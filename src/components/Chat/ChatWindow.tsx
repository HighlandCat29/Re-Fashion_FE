import React, { useState, useEffect, useRef } from "react";
import {
  Message,
  ChatRoom,
  getChatMessages,
  sendMessage,
} from "../../api/Message";
import { format } from "date-fns";

interface ChatWindowProps {
  chatRoom: ChatRoom;
  onClose: () => void;
  currentUserId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatRoom,
  onClose,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getChatMessages(chatRoom.id);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatRoom.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        senderId: currentUserId,
        receiverId:
          chatRoom.participants.find((id) => id !== currentUserId) || "",
        content: newMessage.trim(),
        productId: chatRoom.productId,
      };

      const sentMessage = await sendMessage(messageData);
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 h-[500px] bg-white rounded-t-lg shadow-lg flex flex-col">
      <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Chat</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUserId
                  ? "bg-primary text-white"
                  : "bg-gray-100"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {format(new Date(message.timestamp), "HH:mm")}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
