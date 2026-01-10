# Facebook Login Debug Guide

## Common Facebook Sign-in Issues & Solutions

### 1. **Facebook Provider Not Enabled in Firebase**
**Error**: `auth/operation-not-allowed` or `Facebook sign-in failed: This operation is not allowed in this environment`

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `facebookmarketplace-69e6a`
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Facebook** and **Enable** it
5. Add your Facebook App ID and App Secret

### 2. **Facebook App Not Configured**
**Error**: `auth/invalid-credential` or OAuth redirect errors

**Solution**:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create or select your app
3. Add **Facebook Login** product
4. In **Settings** → **Basic**, add:
   - **App Domains**: `localhost` (for development)
   - **Website URL**: `http://localhost:3000`
5. In **Facebook Login** → **Settings**, add:
   - **Valid OAuth Redirect URIs**: `https://facebookmarketplace-69e6a.firebaseapp.com/__/auth/handler`

### 3. **Missing Facebook App Credentials**
**Error**: `auth/invalid-credential` or API key errors

**Solution**:
1. Get your **App ID** and **App Secret** from Facebook Developers
2. In Firebase Console → Authentication → Facebook:
   - Paste your **App ID**
   - Paste your **App Secret**
3. Save the configuration

### 4. **Browser Pop-up Blocked**
**Error**: No error appears, but nothing happens

**Solution**:
1. Allow pop-ups for `localhost:3000` in your browser
2. Try again with pop-ups enabled

### 5. **CORS or Network Issues**
**Error**: Network errors or CORS issues

**Solution**:
1. Check your internet connection
2. Try in a different browser
3. Clear browser cache and cookies

## How to Debug

### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Click the Facebook login button
3. Check the **Console** tab for detailed error messages
4. Look for specific error codes like:
   - `auth/operation-not-allowed`
   - `auth/invalid-credential`
   - `auth/network-request-failed`

### Step 2: Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Sign-in method**
3. Verify Facebook is **enabled** (green toggle)
4. Check that App ID and App Secret are filled

### Step 3: Test with Different Scopes
The current implementation uses default Facebook permissions. If needed, you can add specific scopes:

```javascript
const provider = new FacebookAuthProvider()
provider.addScope('email')
provider.addScope('public_profile')
```

## Quick Fix Checklist

- [ ] Facebook provider enabled in Firebase Console
- [ ] Facebook App ID and App Secret configured
- [ ] Valid OAuth redirect URI set in Facebook Developers
- [ ] Browser pop-ups allowed for localhost
- [ ] Internet connection stable
- [ ] Browser cache cleared

## Current Configuration

Your Firebase project:
- **Project ID**: `facebookmarketplace-69e6a`
- **Auth Domain**: `facebookmarketplace-69e6a.firebaseapp.com`
- **Required Redirect URI**: `https://facebookmarketplace-69e6a.firebaseapp.com/__/auth/handler`

## Next Steps

1. Try the Facebook login again with the improved error messages
2. Check the browser console for specific error details
3. Follow the checklist above to fix any configuration issues
4. If still failing, the error message will now show the exact problem
