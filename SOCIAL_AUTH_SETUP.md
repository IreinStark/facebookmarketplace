# Social Authentication Setup Guide

This guide explains how to set up Google and Facebook authentication for your Facebook Marketplace clone.

## Prerequisites

- Firebase project with Authentication enabled
- Google Cloud Console access (for Google OAuth)
- Facebook Developer account (for Facebook Login)

## Google Authentication Setup

### 1. Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Google** and enable it
5. Provide your project's authorized domains:
   - `localhost` (for development)
   - `yourdomain.com` (for production)
6. Save the configuration

### 2. Configure OAuth Consent Screen (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure the consent screen with:
   - App name
   - User support email
   - Developer contact information
5. Add required scopes:
   - `email`
   - `profile`
6. Save and publish

## Facebook Authentication Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Choose **Business** or **Other** as app type
4. Add **Facebook Login** product
5. Configure the app settings

### 2. Configure Facebook Login

1. In your Facebook App Dashboard, go to **Facebook Login** → **Settings**
2. Add your authorized domains:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
3. Enable **Web OAuth Login**
4. Set **Valid OAuth Redirect URIs**:
   - `https://your-project-id.firebaseapp.com/__/auth/handler`
   - (Find this in Firebase Console → Authentication → Sign-in method → Facebook)

### 3. Enable Facebook in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Facebook** and enable it
5. Copy your **App ID** and **App Secret** from Facebook Developers
6. Paste them into Firebase configuration
7. Save the configuration

## Code Implementation

The social authentication is already implemented in your codebase:

### Login Page (`/app/auth/login/page.tsx`)
- Google login: `handleGoogleLogin()`
- Facebook login: `handleFacebookLogin()`

### Signup Page (`/app/auth/signup/page.tsx`)
- Google signup: `handleGoogleSignup()`
- Facebook signup: `handleFacebookSignup()`

### Social Login Component (`/components/ui/social-login-button.tsx`)
- Reusable component with proper branding
- Loading states and error handling
- Dark mode support

## Testing

### Local Development
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/login`
3. Test both Google and Facebook login buttons
4. Verify user data is saved to Firestore

### Production Deployment
1. Add your production domain to Firebase authorized domains
2. Update Facebook OAuth redirect URIs
3. Test in production environment

## Common Issues

### Google Sign-In Issues
- **"redirect_uri_mismatch"**: Check that your redirect URI matches Firebase configuration
- **"invalid_client"**: Verify your OAuth client credentials

### Facebook Login Issues
- **"URL Blocked"**: Check your app domains in Facebook Developer settings
- **"OAuthException"**: Verify your App ID and App Secret are correct

## Security Considerations

1. **Environment Variables**: Store sensitive credentials in environment variables
2. **Domain Validation**: Always validate authorized domains
3. **User Data**: Only request necessary user permissions
4. **Error Handling**: Implement proper error handling for failed authentications

## Environment Variables (Optional)

For enhanced security, you can configure environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review browser console for detailed error logs
3. Verify OAuth configurations in both Firebase and provider consoles
4. Ensure all redirect URIs match exactly
