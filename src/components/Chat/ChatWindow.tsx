import React, { useState, useEffect, useRef } from "react";
import { Message, sendMessage } from "../../api/Message";

interface ChatWindowProps {
  chatRoom: {
    id: string;
    participants: string[];
    productId?: string;
  };
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
        const { getConversation } = await import("../../api/Message");
        const fetchedMessages = await getConversation(
          currentUserId,
          chatRoom.participants.find((id) => id !== currentUserId) || ""
        );
        if (fetchedMessages) {
          setMessages(fetchedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatRoom.id, currentUserId, chatRoom.participants]);

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
        message: newMessage.trim(),
      };

      const sentMessage = await sendMessage(messageData);
      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 bg-white rounded-t-lg shadow-lg">
      <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Chat</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ×
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.senderId === currentUserId ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.senderId === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.message}
              <div className="text-[10px] text-gray-400 mt-0.5 text-right">
                {msg.sentAt
                  ? new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
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
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
