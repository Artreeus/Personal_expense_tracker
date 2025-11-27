# Clerk OAuth Setup Guide

## Enable Google and GitHub Login in Clerk Dashboard

To add Google and GitHub OAuth providers, you need to configure them in the Clerk Dashboard:

### Steps:

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com

2. **Navigate to User & Authentication → Social Connections**

3. **Enable Google OAuth**:
   - Click on "Google"
   - Toggle it ON
   - You'll need to:
     - Create a Google OAuth app at https://console.cloud.google.com/apis/credentials
     - Add authorized redirect URI: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
     - Copy the Client ID and Client Secret
     - Paste them into Clerk Dashboard

4. **Enable GitHub OAuth**:
   - Click on "GitHub"
   - Toggle it ON
   - You'll need to:
     - Create a GitHub OAuth app at https://github.com/settings/developers
     - Set Authorization callback URL: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
     - Copy the Client ID and Client Secret
     - Paste them into Clerk Dashboard

### Important Notes:

- The OAuth buttons will automatically appear in the Clerk SignIn and SignUp components once enabled in the dashboard
- No code changes are needed - Clerk handles everything automatically
- Make sure your redirect URIs match exactly what Clerk provides

### Testing:

Once configured, users will see Google and GitHub buttons on both:
- `/auth/signin` page
- `/auth/signup` page

The buttons will appear automatically in the Clerk components.

