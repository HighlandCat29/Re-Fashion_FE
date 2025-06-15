import React from "react";

interface ChatButtonProps {
  sellerId: string;
  productId?: string;
  onStartChat: (participantId: string, productId?: string) => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({
  sellerId,
  productId,
  onStartChat,
}) => {
  const handleClick = () => {
    onStartChat(sellerId, productId);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
          clipRule="evenodd"
        />
      </svg>
      Message Seller
    </button>
  );
};

export default ChatButton;
