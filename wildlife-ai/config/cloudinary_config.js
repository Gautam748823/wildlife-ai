/**
 * config/cloudinary_config.js
 * =============================
 * Cloudinary configuration reference and helper.
 * Actual credentials must be in .env — never hardcode them here.
 *
 * Used by:
 *   - backend/utils/cloudinary_upload.py (Python — uses cloudinary SDK)
 *   - This file is a JS reference/helper for any Node.js code
 *     that needs to interact with Cloudinary directly.
 *
 * Setup:
 *   1. Create a free account at https://cloudinary.com
 *   2. Go to Dashboard → copy Cloud Name, API Key, API Secret
 *   3. Add to .env:
 *        CLOUDINARY_CLOUD_NAME=your-cloud-name
 *        CLOUDINARY_API_KEY=your-api-key
 *        CLOUDINARY_API_SECRET=your-api-secret
 */

const cloudinary = require("cloudinary").v2;
const dotenv     = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,   // Always use HTTPS
});

/**
 * Upload a file buffer to Cloudinary from Node.js.
 * (Python code uses cloudinary_upload.py instead)
 */
async function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        "wildlife-ai/uploads",
        public_id:     `sighting_${filename}`,
        resource_type: "image",
        tags:          ["wildlife", "camera-trap"],
      },
      (error, result) => {
        if (error) reject(error);
        else       resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadToCloudinary };
