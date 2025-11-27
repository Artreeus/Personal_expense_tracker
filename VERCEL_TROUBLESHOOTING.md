# Vercel Deployment Troubleshooting

## MIDDLEWARE_INVOCATION_FAILED Error

If you're seeing a `500: INTERNAL_SERVER_ERROR` with code `MIDDLEWARE_INVOCATION_FAILED`, this is almost always caused by missing Clerk environment variables.

### Solution

1. **Go to your Vercel Project Dashboard**
   - Navigate to: `https://vercel.com/your-username/your-project`
   - Click on "Settings" → "Environment Variables"

2. **Add the following REQUIRED environment variables:**

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

   **Important:** 
   - Make sure to add them for **all environments** (Production, Preview, Development)
   - The `NEXT_PUBLIC_` prefix is required for the publishable key
   - Get these keys from your [Clerk Dashboard](https://dashboard.clerk.com)

3. **After adding the variables:**
   - Click "Save"
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy" to apply the new environment variables

### How to Get Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" in the sidebar
4. Copy:
   - **Publishable Key** → Use as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → Use as `CLERK_SECRET_KEY`

### Verify Environment Variables Are Set

After redeploying, you can verify the variables are set by:
1. Going to your Vercel project settings
2. Clicking "Environment Variables"
3. You should see both Clerk keys listed

### Other Required Environment Variables

Make sure you also have these set:

```
DATABASE_URL=mongodb+srv://...
MEGALLM_API_KEY=sk-mega-...
```

### Still Having Issues?

1. **Check Vercel Logs:**
   - Go to your deployment in Vercel
   - Click on "Functions" tab
   - Check for any error messages

2. **Verify Clerk Domain Configuration:**
   - In Clerk Dashboard → Settings → Domains
   - Make sure your Vercel domain is added (e.g., `your-app.vercel.app`)

3. **Clear Vercel Cache:**
   - Sometimes Vercel caches old builds
   - Try redeploying or clearing the build cache

