import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import noticeIcon from "../../assets/react.svg"; // Example image, replace as needed

// Interfaces
export interface Notice {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  read: boolean;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
  userId: string;
}

export interface NoticeResponse {
  code: number;
  message: string;
  result: Notice | Notice[] | string;
}

// API Functions
export const getUserNotices = async (
  userId: string
): Promise<Notice[] | null> => {
  try {
    const response = await customFetch.get<NoticeResponse>(
      `/notifications/user/${userId}`
    );
    return response.data.result as Notice[];
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const createNotice = async (
  data: CreateNoticeRequest
): Promise<Notice | null> => {
  try {
    const response = await customFetch.post<NoticeResponse>(
      "/notifications",
      data
    );
    return response.data.result as Notice;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to create notification"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const markNoticeAsRead = async (
  notificationId: string
): Promise<boolean> => {
  try {
    await customFetch.put<NoticeResponse>(
      `/notifications/${notificationId}/read`
    );
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return false;
  }
};

export const deleteNotice = async (
  notificationId: string
): Promise<boolean> => {
  try {
    await customFetch.delete<NoticeResponse>(
      `/notifications/${notificationId}`
    );
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to delete notification"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return false;
  }
};

export { noticeIcon };
