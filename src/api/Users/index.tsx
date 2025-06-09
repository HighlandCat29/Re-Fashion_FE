import customFetch from "../../axios/custom";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

/** Types **/

export interface Role {
  roleId: string;
  roleName: string;
  description: string;
  active: boolean;
}
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: Role;
  fullName: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
  createdAt: string;
  emailVerified: boolean;
  active: boolean;
  verificationToken: string;
}
export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  role: Role;
  fullName: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
  createdAt: string;
  emailVerified: boolean;
  active: boolean;
  verificationToken: string;
}

export interface AdminUser {
  roleId: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  active: boolean;
  profilePicture?: string;
}

/** API Functions **/
export const getUsers = async (): Promise<UserResponse[] | null> => {
  try {
    const response = await customFetch.get("/users");
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to fetch users: " + errorMessage);
    return null;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<UserResponse | null> => {
  try {
    const response = await customFetch.get(`/users/${id}`);
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to fetch user: " + errorMessage);
    return null;
  }
};

// Get user by username
export const getUserByUsername = async (
  username: string
): Promise<UserResponse | null> => {
  try {
    const response = await customFetch.get(`/users/${username}`);
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to fetch user by username: " + errorMessage);
    return null;
  }
};

// Get all admin users
export const getAdminUsers = async (): Promise<AdminUserResponse[] | null> => {
  try {
    const response = await customFetch.get("/admin/users");
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to fetch admin users: " + errorMessage);
    return null;
  }
};

// Get admin user by ID
export const getAdminUserById = async (
  id: string
): Promise<AdminUserResponse> => {
  try {
    const response = await customFetch.get(`/admin/users/${id}`);
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to fetch admin user: " + errorMessage);
    throw error;
  }
};

// Add new admin user
export const addAdminUser = async (user: AdminUser): Promise<void> => {
  try {
    const response = await customFetch.post("/admin/users", user);
    if ([200, 1000, 1073741824].includes(response.status)) {
      toast.success("Admin user added successfully!");
    } else {
      toast.error("Unexpected response when adding admin user.");
    }
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to add admin user: " + errorMessage);
    throw error;
  }
};

// Update existing admin user
export const updateAdminUser = async (
  id: string,
  user: AdminUser
): Promise<AdminUserResponse> => {
  try {
    const response = await customFetch.put(`/admin/users/${id}`, user);
    if ([200, 1000, 1073741824].includes(response.status)) {
      toast.success("Admin user updated successfully!");
    }
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to update admin user: " + errorMessage);
    throw error;
  }
};
export const updateUser = async (
  id: string,
  user: AdminUser
): Promise<AdminUserResponse> => {
  try {
    const response = await customFetch.put(`/users/${id}`, user);
    if ([200, 1000, 1073741824].includes(response.status)) {
      toast.success("Admin user updated successfully!");
    }
    return response.data.result;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to update admin user: " + errorMessage);
    throw error;
  }
};

// Delete admin user
export const deleteAdminUser = async (id: string): Promise<boolean> => {
  try {
    const response = await customFetch.delete(`/admin/users/${id}`);
    if ([200, 1000, 1073741824].includes(response.status)) {
      toast.success("Admin user deleted successfully!");
    }
    return true;
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error("Failed to delete admin user: " + errorMessage);
    throw error;
  }
};

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  return [
    {
      roleId: "1",
      roleName: "ADMIN",
      description: "Administrator with full access",
      active: true,
    },
    {
      roleId: "2",
      roleName: "USER",
      description: "Regular user who can purchase and sell items",
      active: true,
    },
  ];
};
