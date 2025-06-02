import { Cloudinary } from "@cloudinary/url-gen";

// Get these values from your Cloudinary dashboard:
// 1. Cloud Name: Go to Dashboard -> Account Details
// 2. Upload Preset: Go to Settings -> Upload -> Upload presets -> Add upload preset
//    - Set "Signing Mode" to "Unsigned"
//    - Set "Folder" to where you want to store images (e.g., "refashion/products")
//    - Save the preset name

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: "dnrxylpid",
    apiKey: "118782255391218",
    apiSecret: "XRHSTDCmTEfAL39-QinpuEDC4ac",
  },
});

// Cloudinary upload preset - create this in your Cloudinary dashboard
export const UPLOAD_PRESET = "Samroy"; // Simpler preset name

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/dnrxylpid/image/upload`;

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloud_name: "dnrxylpid",
  api_key: "118782255391218",
  api_secret: "XRHSTDCmTEfAL39-QinpuEDC4ac",
  secure: true,
};
