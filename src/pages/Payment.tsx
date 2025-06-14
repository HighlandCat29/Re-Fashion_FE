import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { uploadPaymentScreenshot } from "../api/Orders";
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET } from "../config/cloudinary";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
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
      cloudinaryFormData.append("cloud_name", "dnrxylpid"); // Replace with your Cloudinary cloud name

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: cloudinaryFormData,
      });

      const data = await response.json();

      if (data.secure_url) {
        toast.success("Screenshot uploaded successfully!");
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

  const handleConfirmPayment = async () => {
    if (!paymentScreenshot) {
      toast.error("Please upload a payment screenshot.");
      return;
    }

    if (!order?.id) {
      toast.error("Order details not found. Cannot confirm payment.");
      return;
    }

    setConfirmingPayment(true);

    try {
      const imageUrl = await uploadImageToCloudinary(paymentScreenshot);

      if (imageUrl) {
        const updatedOrder = await uploadPaymentScreenshot(order.id, imageUrl);
        if (updatedOrder) {
          toast.success("Payment confirmed and screenshot uploaded!");
          navigate("/order-confirmation", { state: { order: updatedOrder } });
        } else {
          toast.error("Failed to update order with payment screenshot.");
        }
      } else {
        toast.error("Image upload failed.");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Failed to confirm payment.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (!order) {
    return (
      <div className="max-w-screen-2xl mx-auto pt-20 px-4 text-center">
        <h1 className="text-3xl font-light mb-8">No Order Details Found</h1>
        <p>Please go back to checkout to place an order.</p>
        <button
          onClick={() => navigate("/checkout")}
          className="mt-4 text-white bg-black px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-colors"
        >
          Go to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto pt-20 px-4">
      <h1 className="text-5xl font-light text-center mb-8">Payment</h1>

      <div className="mt-8 max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Scan to Pay</h2>
        <div className="flex justify-center mb-6">
          <img
            src="/src/assets/Payment.jpg" // Updated QR code image path
            alt="QR Payment Code"
            className="w-64 h-64 object-contain border border-gray-300 rounded-lg"
          />
        </div>

        <div className="text-center text-lg mb-6 space-y-2">
          <p className="font-medium">
            Ngân hàng: <span className="font-normal">VCB</span>
          </p>
          <p className="font-medium">
            Tên tài khoản: <span className="font-normal">THAI BINH DUONG</span>
          </p>
          <p className="font-medium">
            Số tài khoản: <span className="font-normal">1031513945</span>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Upload Payment Screenshot
          </h3>
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4 p-2 border border-gray-300 rounded-md"
              disabled={uploadingImage || confirmingPayment}
            />
            {uploadingImage && (
              <p className="text-blue-500 text-sm mt-1">Uploading image...</p>
            )}
            {paymentScreenshot && (
              <img
                src={URL.createObjectURL(paymentScreenshot)}
                alt="Payment Screenshot Preview"
                className="w-64 h-auto object-contain rounded-lg shadow-md mb-4"
              />
            )}
            <button
              onClick={handleConfirmPayment}
              disabled={
                !paymentScreenshot || uploadingImage || confirmingPayment
              }
              className={`text-white bg-black text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-[200px] h-12 flex items-center justify-center max-md:text-base rounded-lg shadow ${
                !paymentScreenshot || uploadingImage || confirmingPayment
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800 transition-colors"
              }`}
            >
              {confirmingPayment ? "Confirming..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
