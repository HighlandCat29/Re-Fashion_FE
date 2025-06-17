import React, { useState, useEffect, useRef } from "react";
import { Message, sendMessage, getConversation } from "../api/Message";

interface MessagePopupProps {
  open: boolean;
  onClose: () => void;
  senderId: string;
  receiverId: string;
  receiverName: string;
}

export const MessagePopup: React.FC<MessagePopupProps> = ({
  open,
  onClose,
  senderId,
  receiverId,
  receiverName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessagesLength = useRef<number>(0);

  // Typing indicator logic using localStorage
  useEffect(() => {
    if (!open) return;
    const typingKey = `typing-${senderId}-to-${receiverId}`;
    if (input) {
      localStorage.setItem(typingKey, "true");
      setIsTyping(false); // Don't show for self
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(typingKey, "false");
      }, 1500);
    } else {
      localStorage.setItem(typingKey, "false");
      setIsTyping(false);
    }
  }, [input, open, senderId, receiverId]);

  // Polling for messages and typing
  const fetchMessages = React.useCallback(() => {
    getConversation(senderId, receiverId).then((msgs) => {
      if (msgs) {
        setMessages(msgs);
      }
    });
    // Typing indicator: check if other user is typing
    const typingKey = `typing-${receiverId}-to-${senderId}`;
    setIsTyping(localStorage.getItem(typingKey) === "true");
  }, [senderId, receiverId]);

  useEffect(() => {
    if (open && senderId && receiverId) {
      fetchMessages(); // Initial fetch
      intervalRef.current = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, senderId, receiverId, fetchMessages]);

  useEffect(() => {
    if (
      messages.length > prevMessagesLength.current &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const msg = await sendMessage({ senderId, receiverId, message: input });
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Chat with {receiverName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === senderId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.senderId === senderId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.sentAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                <p className="text-sm italic">typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
