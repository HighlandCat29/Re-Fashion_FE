import React from "react";

const MessagePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="w-full max-w-2xl bg-white rounded shadow p-4">
        {/* Chat UI will go here */}
        <p className="text-gray-500">
          Select a conversation or start a new chat.
        </p>
      </div>
    </div>
  );
};

export default MessagePage;
