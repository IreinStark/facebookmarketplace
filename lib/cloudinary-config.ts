// Cloudinary Configuration
// Replace these values with your actual Cloudinary credentials

export const cloudinaryConfig = {
  cloudName: 'dhcdhsgax', // Your Cloudinary cloud name
  uploadPreset: 'ml_default', // Default unsigned upload preset
  apiKey: '272862423432328', // Your API key
  apiSecret: 'your-api-secret', // Optional: Only needed for server-side uploads
}

// Example configuration (replace with your actual values):
// export const cloudinaryConfig = {
//   cloudName: 'my-marketplace',
//   uploadPreset: 'marketplace_uploads',
//   apiKey: '123456789012345',
//   apiSecret: 'abcdefghijklmnopqrstuvwxyz123456',
// }

export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`
}

export const getCloudinaryConfig = () => {
  return {
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
  }
}