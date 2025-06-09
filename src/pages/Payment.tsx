import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentScreenshot) {
      toast.error("Please upload a payment screenshot.");
      return;
    }
    // Here you would typically send the screenshot to your backend
    // For now, we'll just navigate to the confirmation page
    toast.success("Payment confirmed!");
    navigate("/order-confirmation", { state: { order } });
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
            />
            {paymentScreenshot && (
              <img
                src={URL.createObjectURL(paymentScreenshot)}
                alt="Payment Screenshot Preview"
                className="w-64 h-auto object-contain rounded-lg shadow-md mb-4"
              />
            )}
            <button
              onClick={handleConfirmPayment}
              disabled={!paymentScreenshot}
              className={`text-white bg-black text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-[200px] h-12 flex items-center justify-center max-md:text-base rounded-lg shadow ${
                !paymentScreenshot
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800 transition-colors"
              }`}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
