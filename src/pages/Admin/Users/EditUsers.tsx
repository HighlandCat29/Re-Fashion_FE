import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminUserById, updateAdminUser } from "../../../api/Users/index";
import { AdminUser, AdminUserResponse } from "../../../api/Users/index";
import { toast } from "react-hot-toast";
import {
  CLOUDINARY_UPLOAD_URL,
  UPLOAD_PRESET,
} from "../../../config/cloudinary";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<AdminUser>({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    address: "",
    roleId: "",
    email: "",
    active: true,
    profilePicture: "",
  });

  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(form.profilePicture || null);
    }
  }, [selectedFile, form.profilePicture]);

  const fetchUser = async (userId: string) => {
    try {
      const user: AdminUserResponse = await getAdminUserById(userId);
      setForm({
        username: user.username,
        password: "", // Leave empty, unless user wants to update
        confirmPassword: "",
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        roleId: user.role.roleId,
        email: user.email,
        active: user.active,
        profilePicture: user.profilePicture || "",
      });
      setPreviewUrl(user.profilePicture || "");
    } catch (error) {
      toast.error("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    } else {
      setSelectedFile(null);
      setPreviewUrl(form.profilePicture || null);
    }
  };

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);
      cloudinaryFormData.append("cloud_name", "dnrxylpid");

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: cloudinaryFormData,
      });

      const data = await response.json();

      if (data.secure_url) {
        toast.success("Image uploaded successfully!");
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast.error("Failed to upload image to Cloudinary.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    let imageUrl = form.profilePicture;
    if (selectedFile) {
      const uploadedUrl = await uploadImageToCloudinary(selectedFile);
      console.log("Cloudinary uploaded URL:", uploadedUrl);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        toast.error("Failed to upload profile picture. Please try again.");
        return;
      }
    }

    console.log("Payload being sent to updateAdminUser:", {
      ...form,
      profilePicture: imageUrl,
    });

    try {
      await updateAdminUser(id!, {
        ...form,
        profilePicture: imageUrl,
      });
      toast.success("User updated successfully!");
      navigate("/admin/users");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone Number"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          required
        />
        <Input
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <div>
          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-gray-700"
          >
            Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            disabled={uploadingImage}
          />
          {uploadingImage && (
            <p className="text-blue-500 text-sm mt-1">Uploading image...</p>
          )}
          {previewUrl && (
            <div className="mt-2">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
          )}
        </div>

        <Input
          label="New Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
            disabled={uploadingImage}
          >
            Update User
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default EditUser;
