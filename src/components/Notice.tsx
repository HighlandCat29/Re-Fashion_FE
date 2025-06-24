import React from "react";
import { Notice } from "../api/Notice/index";

interface NoticeProps {
  notices: Notice[];
  loading: boolean;
  onMarkAsRead: (noticeId: string) => void;
  onClose: () => void;
}

const NoticePopup: React.FC<NoticeProps> = ({
  notices,
  loading,
  onMarkAsRead,
  onClose,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-md bg-white border border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="font-semibold text-lg">Notifications</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
          ✕
        </button>
      </div>
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : notices.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      ) : (
        <ul>
          {notices.map((notice) => (
            <li
              key={notice.id}
              className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                notice.read ? "bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
              }`}
              onClick={() => onMarkAsRead(notice.id)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${
                    notice.read ? "text-gray-700" : "text-black-700"
                  }`}
                >
                  {notice.title}
                </span>
                {!notice.read && (
                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-gray-500" />
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">{notice.content}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(notice.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoticePopup;
