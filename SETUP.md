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

## Troubleshooting

If you see 500 errors:
- Check that your `.env` file exists and has all required variables
- Verify your MongoDB connection string is correct
- Check the server console for detailed error messages
