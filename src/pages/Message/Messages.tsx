import React, { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../hooks";
import { Message, getConversation, sendMessage } from "../../api/Message";
import { getAdminUsers, AdminUserResponse } from "../../api/Users";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

type PartnerPreview = AdminUserResponse & { lastMessage?: Message };

const Messages = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [partners, setPartners] = useState<PartnerPreview[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerPreview | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch all users except the current user
  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const users = await getAdminUsers();
        if (users) {
          const filteredUsers = users.filter((u) => u.id !== user.id);
          setPartners(filteredUsers);
          if (filteredUsers.length > 0) {
            setSelectedPartner(filteredUsers[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, [user?.id, navigate]);

  // Fetch messages for selected partner
  useEffect(() => {
    if (selectedPartner && user?.id) {
      const fetchMessages = async () => {
        try {
          const msgs = await getConversation(user.id, selectedPartner.id);
          if (msgs) {
            setMessages(msgs);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error("Failed to load messages");
        }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedPartner, user?.id]);

  // Only scroll chat container when new messages are added and user is at the bottom
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, autoScroll]);

  // Detect if user is at the bottom
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop === container.clientHeight;
    setAutoScroll(isAtBottom);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedPartner || !user?.id) return;
    setSending(true);
    try {
      const msg = await sendMessage({
        senderId: user.id,
        receiverId: selectedPartner.id,
        message: input.trim(),
      });
      if (msg) {
        setMessages((prev) => [...prev, msg]);
        setInput("");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Full error response:", error.response);
        toast.error(error.response?.data?.message || "Failed to send message");
      } else {
        toast.error("An unexpected error occurred");
      }
      return null;
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Partners List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">All Users</h2>
            </div>
            <div className="divide-y">
              {partners.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                partners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedPartner?.id === partner.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {partner.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {partner.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {partner.role.roleName}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-lg shadow">
            {selectedPartner ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {selectedPartner.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold">
                        {selectedPartner.username}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedPartner.role.roleName}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="h-[500px] overflow-y-auto p-4 space-y-4"
                  onScroll={handleScroll}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === user?.id
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
                    ))
                  )}
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
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
