# Vercel Deployment Guide

This guide will help you deploy your Finance Tracker application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub account (or GitLab/Bitbucket)
3. Your MongoDB connection string
4. Your Clerk API keys

## Step 1: Push Code to GitHub

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required Variables:

```env
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Reports (MegaLLM)
MEGALLM_API_KEY=sk-mega-82dcae99f7fb70d409af11fde3f898c2ddce2338dd31ee8a4433c1a4c7d2a565
```

### Optional Variables:

```env
# Clerk Webhook (optional - users will sync on-demand if not set)
WEBHOOK_SECRET=whsec_...

# Cron Secret (for auto-generating AI reports)
CRON_SECRET=your-random-secret-here
```

**How to add environment variables in Vercel:**
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable for all environments (Production, Preview, Development)
4. Click "Save"

## Step 4: Configure Clerk

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" and copy:
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

4. **Configure Allowed Origins:**
   - Go to "Settings" → "Domains"
   - Add your Vercel domain (e.g., `your-app.vercel.app`)
   - Add your custom domain (if you have one)

5. **Optional: Set up Webhook (Recommended but not required):**
   - Go to "Webhooks" in Clerk Dashboard
   - Click "Add Endpoint"
   - URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`
   - Copy the "Signing Secret" → `WEBHOOK_SECRET` in Vercel

## Step 5: Deploy

1. After adding environment variables, Vercel will automatically redeploy
2. Or click "Deploy" in the Vercel dashboard
3. Wait for deployment to complete

## Step 6: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test sign up / sign in
3. Test creating transactions
4. Test AI report generation

## Step 7: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Clerk allowed origins with your custom domain

## Step 8: Enable Cron Jobs (For Auto AI Reports)

The `vercel.json` file is already configured for automatic AI report generation.

1. Vercel will automatically detect the cron configuration
2. Reports will be generated on the 1st of each month at midnight UTC
3. To test manually, you can call: `POST https://your-app.vercel.app/api/ai-reports/auto-generate`

## Troubleshooting

### Build Errors

- **TypeScript errors**: Check that all types are correct
- **Missing dependencies**: Run `npm install` locally and commit `package-lock.json`
- **Environment variables**: Ensure all required variables are set in Vercel

### Runtime Errors

- **Database connection**: Verify `DATABASE_URL` is correct
- **Clerk authentication**: Check that Clerk keys are correct and domains are configured
- **API errors**: Check Vercel function logs in the dashboard

### Common Issues

1. **"User not found" errors**: 
   - This is normal on first login - users sync automatically
   - If persistent, check database connection

2. **Webhook errors**:
   - Webhook is optional - users sync on-demand
   - If you want webhooks, ensure `WEBHOOK_SECRET` is set correctly

3. **AI reports not generating**:
   - Check `MEGALLM_API_KEY` is set
   - Verify you have transactions for the selected month

## Monitoring

- **Logs**: View function logs in Vercel dashboard → "Deployments" → Click deployment → "Functions"
- **Analytics**: Enable Vercel Analytics in project settings
- **Performance**: Monitor in Vercel dashboard

## Next Steps

1. Set up monitoring and error tracking (e.g., Sentry)
2. Configure backups for MongoDB
3. Set up staging environment
4. Enable Vercel Analytics
5. Configure rate limiting if needed

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB connection
3. Verify all environment variables are set
4. Review Clerk dashboard for authentication issues

