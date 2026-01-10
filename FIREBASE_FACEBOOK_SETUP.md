# Where to Add Facebook App ID and App Secret

## Step-by-Step Guide

### 1. Go to Firebase Console
**URL**: https://console.firebase.google.com/

### 2. Select Your Project
- Click on **facebookmarketplace-69e6a** project
- If not selected, choose it from the project dropdown

### 3. Navigate to Authentication
- In the left sidebar, click **Authentication** (🔐 icon)
- Or go directly: https://console.firebase.google.com/project/facebookmarketplace-69e6a/authentication

### 4. Go to Sign-in Method
- Click the **Sign-in method** tab at the top
- You'll see a list of providers (Email/Password, Google, etc.)

### 5. Configure Facebook
- Find **Facebook** in the list
- Click on it (or click the **pencil/edit icon**)
- **Toggle the switch to "Enable"**
- Fill in these fields:
  - **App ID**: Your Facebook App ID
  - **App Secret**: Your Facebook App Secret

### 6. Save Configuration
- Click **Save** at the bottom

## Visual Guide

```
Firebase Console
├── Project: facebookmarketplace-69e6a
├── Authentication
│   ├── Users tab
│   └── Sign-in method tab  ← CLICK HERE
│       ├── Email/Password
│       ├── Google
│       ├── Facebook  ← CLICK FACEBOOK
│       │   ├── Enable toggle  ← TURN ON
│       │   ├── App ID: [YOUR_APP_ID]
│       │   └── App Secret: [YOUR_APP_SECRET]
│       └── [Save] button
```

## Direct Links

- **Firebase Console**: https://console.firebase.google.com/
- **Your Project Auth**: https://console.firebase.google.com/project/facebookmarketplace-69e6a/authentication
- **Sign-in Methods**: https://console.firebase.google.com/project/facebookmarketplace-69e6a/authentication/providers

## What You'll See

When you click on Facebook in the Sign-in methods, you should see:

1. **Enable/Disable toggle** - Turn this ON
2. **App ID field** - Enter your Facebook App ID here
3. **App Secret field** - Enter your Facebook App Secret here
4. **Authorized domains** - Should include:
   - `localhost` (for development)
   - `facebookmarketplace-69e6a.firebaseapp.com`

## Getting Facebook Credentials

If you don't have Facebook App ID and App Secret:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Go to **Settings** → **Basic**
4. Copy **App ID** and **App Secret**
5. Add them to Firebase as shown above

## After Setup

Once you add the credentials:
1. Facebook login should work immediately
2. Test by clicking the Facebook login button
3. You should see the Facebook login popup

## Troubleshooting

If you can't find Facebook in the list:
- Make sure you're in the correct project: `facebookmarketplace-69e6a`
- Facebook might be at the bottom of the providers list
- Scroll down if you don't see it immediately

If the save button is disabled:
- Make sure both App ID and App Secret are filled
- Check that the enable toggle is turned ON
- Try refreshing the page
