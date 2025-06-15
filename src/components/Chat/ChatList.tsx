import React, { useState, useEffect } from "react";
import { ChatRoom, getUserChatRooms, createChatRoom } from "../../api/Message";
import { useAuth } from "../../context/AuthContext";
import ChatWindow from "./ChatWindow";

const ChatList: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user) return;
      try {
        const rooms = await getUserChatRooms(user.id);
        setChatRooms(rooms);
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };

    fetchChatRooms();
    // Refresh chat rooms every 30 seconds
    const interval = setInterval(fetchChatRooms, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStartChat = async (participantId: string, productId?: string) => {
    if (!user) return;

    try {
      const existingRoom = chatRooms.find(
        (room) =>
          room.participants.includes(participantId) &&
          (!productId || room.productId === productId)
      );

      if (existingRoom) {
        setSelectedChat(existingRoom);
        return;
      }

      const newRoom = await createChatRoom([user.id, participantId], productId);
      setChatRooms((prev) => [...prev, newRoom]);
      setSelectedChat(newRoom);
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 bg-white rounded-t-lg shadow-lg">
      <div className="bg-primary text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">Messages</h3>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {chatRooms.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No messages yet</p>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room.id}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedChat(room)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {room.participants.find((id) => id !== user?.id)}
                  </p>
                  {room.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
                {room.lastMessage && (
                  <span className="text-xs text-gray-400">
                    {new Date(room.lastMessage.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedChat && (
        <ChatWindow
          chatRoom={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default ChatList;
