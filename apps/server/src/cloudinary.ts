import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hpqscnau',
  api_key: process.env.CLOUDINARY_API_KEY || '551852942354546',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Gh4bTjzwWoZtz9S0ecX8Ma9c6l4',
});

/**
 * Upload file to Cloudinary
 * @param filePath - Local file path to upload
 * @param folder - Cloudinary folder (e.g., 'avatars', 'messages', 'stories')
 * @returns Cloudinary URL
 */
export async function uploadToCloudinary(
  filePath: string,
  folder: string = 'vortex'
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `vortex/${folder}`,
      resource_type: 'auto', // auto-detect file type (image/video/raw)
      use_filename: true,
      unique_filename: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

/**
 * Delete file from Cloudinary
 * @param publicId - Cloudinary public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
}

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;

  // Example URL: https://res.cloudinary.com/hpqscnau/image/upload/v1234567890/vortex/avatars/abc123.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}
