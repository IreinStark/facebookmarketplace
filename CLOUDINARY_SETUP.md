# Cloudinary Photo Upload Setup

This guide will help you configure Cloudinary for photo uploads in the marketplace application.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Verify your email address
3. Log in to your Cloudinary dashboard

## Step 2: Get Your Cloud Name

1. In your Cloudinary dashboard, you'll see your **Cloud Name** in the top right corner
2. This is usually something like `my-company` or `my-app-name`
3. Copy this value

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the following:
   - **Preset name**: `marketplace_uploads` (or any name you prefer)
   - **Signing Mode**: `Unsigned`
   - **Folder**: `marketplace` (optional, for organization)
5. Click **Save**

## Step 4: Configure the Application

1. Open `lib/cloudinary-config.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
export const cloudinaryConfig = {
  cloudName: 'your-actual-cloud-name', // Replace with your cloud name
  uploadPreset: 'marketplace_uploads', // Replace with your preset name
  apiKey: 'your-api-key', // Optional: Only needed for server-side uploads
  apiSecret: 'your-api-secret', // Optional: Only needed for server-side uploads
}
```

## Step 5: Test the Upload

1. Start your development server
2. Go to the photo upload page
3. Try uploading an image
4. Check the browser console for any errors

## Troubleshooting

### Common Issues

1. **"Please configure your Cloudinary credentials"**
   - Make sure you've updated the values in `lib/cloudinary-config.ts`
   - Ensure you're using the correct cloud name and upload preset

2. **"Upload preset not found"**
   - Double-check your upload preset name
   - Make sure the preset is set to "Unsigned" mode

3. **"Cloudinary upload failed"**
   - Check your browser's network tab for the actual error
   - Verify your cloud name is correct
   - Ensure your upload preset is properly configured

### Security Notes

- The upload preset should be set to "Unsigned" for client-side uploads
- Never expose your API secret in client-side code
- Consider implementing server-side uploads for additional security

## Advanced Configuration

### Server-Side Uploads (Recommended for Production)

For better security, consider implementing server-side uploads:

1. Create an API route in your Next.js app
2. Use your API key and secret on the server side
3. Handle the upload through your server
4. Return the uploaded URL to the client

### Image Transformations

You can add Cloudinary transformations to optimize images:

```typescript
// In your upload function, add transformation parameters
formData.append('transformation', 'f_auto,q_auto,w_800,h_600,c_fill');
```

This will:
- Auto-format images (WebP for supported browsers)
- Auto-optimize quality
- Resize to 800x600 with fill crop

## Support

If you encounter issues:

1. Check the [Cloudinary documentation](https://cloudinary.com/documentation)
2. Verify your configuration in the Cloudinary dashboard
3. Check the browser console for detailed error messages
4. Ensure your upload preset is properly configured