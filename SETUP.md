# Setup Instructions

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
WEBHOOK_SECRET=your-clerk-webhook-secret

# AI Reports (MegaLLM)
MEGALLM_API_KEY=sk-mega-82dcae99f7fb70d409af11fde3f898c2ddce2338dd31ee8a4433c1a4c7d2a565

# Optional: For auto-generating reports via cron
CRON_SECRET=your-cron-secret-key-here
```

## Important Notes

1. **DATABASE_URL**: This is your MongoDB connection string. Make sure it's set correctly.
2. **NEXTAUTH_SECRET**: Generate a random secret key. You can use: `openssl rand -base64 32`
3. **NEXTAUTH_URL**: Should match your application URL (http://localhost:3000 for development)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create the `.env` file with the variables above

3. Run the development server:
```bash
npm run dev
```

## AI Reports Feature

The application includes an AI-powered financial analysis feature that generates monthly reports using MegaLLM.

### Automatic Report Generation

To automatically generate reports at the end of each month:

1. **Using Vercel Cron** (if deployed on Vercel):
   - Add a `vercel.json` file with cron configuration
   - The endpoint `/api/ai-reports/auto-generate` will be called automatically

2. **Using External Cron Service**:
   - Set up a cron job to call: `POST https://your-domain.com/api/ai-reports/auto-generate`
   - Include header: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Run on the 1st of each month (e.g., `0 0 1 * *`)

3. **Manual Generation**:
   - Users can manually generate reports from the "AI Analysis" page in the dashboard

### AI Report Features

- **Monthly Analysis**: Comprehensive financial analysis for any month
- **Spending Insights**: Identifies spending patterns and trends
- **Recommendations**: Provides actionable financial advice
- **Category Breakdown**: Detailed analysis of spending by category
- **Savings Opportunities**: Highlights potential savings areas

## Troubleshooting

If you see 500 errors:
- Check that your `.env` file exists and has all required variables
- Verify your MongoDB connection string is correct
- Check the server console for detailed error messages

If AI reports fail to generate:
- Verify `MEGALLM_API_KEY` is set correctly
- Check that you have transactions for the selected month
- Review server logs for AI service errors
