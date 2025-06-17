import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// Interfaces
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  isFree: boolean;
}

export interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  message: string;
}

export interface SendMessageResponse {
  code: number;
  message: string;
  result: Message;
}

export interface ReadMessageRequest {
  senderId: string;
  receiverId: string;
  message: string;
}

export interface ReadMessageResponse {
  code: number;
  message: string;
  result: Record<string, unknown>;
}

export interface MessagePartner {
  uid: string;
  username: string;
  email: string;
  role: {
    roleId: string;
    roleName: string;
    description: string;
  };
  fullName: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
  createdAt: string;
  emailVerified: boolean;
  active: boolean;
  verificationToken: string;
}

export interface GetPartnersResponse {
  code: number;
  message: string;
  result: MessagePartner[];
}

export interface GetConversationResponse {
  code: number;
  message: string;
  result: Message[];
}

// API Functions
export const sendMessage = async (
  data: SendMessageRequest
): Promise<Message | null> => {
  try {
    console.log("Sending message payload:", data);
    const response = await customFetch.post<SendMessageResponse>(
      "/messages/send",
      {
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
      }
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const readMessage = async (
  data: ReadMessageRequest
): Promise<boolean> => {
  try {
    await customFetch.post<ReadMessageResponse>("/messages/read", data);
    return true;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to mark message as read"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return false;
  }
};

export const getMessagePartners = async (
  userId: string
): Promise<MessagePartner[] | null> => {
  try {
    // First, get all messages for the user
    const response = await customFetch.get<GetPartnersResponse>(
      `/messages/user/${userId}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Failed to fetch partners");
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};

export const getConversation = async (
  userId1: string,
  userId2: string
): Promise<Message[] | null> => {
  try {
    const response = await customFetch.get<GetConversationResponse>(
      `/messages/conversation?userId1=${userId1}&userId2=${userId2}`
    );
    return response.data.result;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(
        error.response?.data?.message || "Failed to fetch conversation"
      );
    } else {
      toast.error("An unexpected error occurred");
    }
    return null;
  }
};
