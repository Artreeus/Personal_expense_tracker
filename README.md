# Personal Expense Tracker

A modern, full-stack personal finance tracking application built with Next.js 15, TypeScript, MongoDB, and shadcn/ui. Track income and expenses with beautiful analytics and insights.

## Features

### Core Functionality
- **Authentication**: Secure login with email/password and Google OAuth via NextAuth
- **Transaction Management**: Fast, mobile-optimized income/expense tracking
- **Smart Categories**: Customizable categories with color coding
- **Real-time Analytics**: Beautiful charts and visualizations with Recharts
- **Monthly Reports**: Comprehensive financial summaries with category breakdowns
- **Budget Tracking**: Automatic budget calculation based on spending patterns
- **Dark Mode**: Full theme support with next-themes
- **Responsive Design**: Mobile-first with bottom navigation and desktop sidebar

### Technical Highlights
- **Multi-tenant Architecture**: Built for SaaS scalability from day one
- **Type-safe API**: Full TypeScript coverage across frontend and backend
- **MongoDB Database**: Flexible NoSQL database with Mongoose ODM
- **Server Components**: Leveraging Next.js 15 App Router for performance
- **Modern UI**: shadcn/ui components with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v4
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Artreeus/Personal_expense_tracker.git
cd Personal_expense_tracker
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application uses MongoDB with the following collections:
- `users` - User accounts
- `accounts` - OAuth provider links
- `categories` - Transaction categories
- `transactions` - Income/expense records
- `subscriptionplans` - Available subscription tiers
- `usersubscriptions` - User subscription status

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── transactions/ # Transaction CRUD
│   │   ├── categories/   # Category management
│   │   ├── dashboard/    # Dashboard stats
│   │   └── reports/      # Report generation
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── add/         # Add transaction
│   │   ├── transactions/ # Transaction list
│   │   ├── categories/  # Category management
│   │   ├── budgets/     # Budget tracking
│   │   ├── goals/       # Financial goals
│   │   ├── reports/     # Monthly reports
│   │   └── settings/    # User settings
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── layout/          # Layout components
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── dashboard-layout.tsx
│   ├── ui/              # shadcn/ui components
│   └── providers.tsx    # Context providers
├── lib/
│   ├── models/          # MongoDB models
│   ├── auth.ts          # NextAuth configuration
│   ├── mongodb.ts       # MongoDB connection
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── types/
    └── next-auth.d.ts   # NextAuth type extensions
```

## Key Pages

### Landing Page (`/`)
Minimal landing page with feature highlights and call-to-action buttons.

### Dashboard (`/dashboard`)
- Today's and monthly income/expense summaries
- 7-day trend chart
- Category breakdown pie chart
- Recent transactions list

### Add Transaction (`/dashboard/add`)
- Fast mobile-optimized form
- Type toggle (income/expense)
- Category selector
- Date picker
- Optional notes
- "Repeat last transaction" shortcut

### Transactions (`/dashboard/transactions`)
- Full transaction list with filtering
- Search by note/category
- Filter by type and category
- Delete functionality

### Categories (`/dashboard/categories`)
- Create custom categories
- Separate income and expense categories
- Color customization
- Delete categories

### Budgets (`/dashboard/budgets`)
- Automatic budget calculation from spending
- Category-wise budget tracking
- Visual progress indicators
- Budget status alerts

### Reports (`/dashboard/reports`)
- Month selector
- Income/expense summary
- Category breakdown bar chart
- Expense distribution pie chart
- Detailed transaction breakdown

### Settings (`/dashboard/settings`)
- User profile display
- Dark mode toggle
- Account management
- Sign out

## API Routes

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get single transaction
- `PATCH /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Dashboard & Reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/reports/monthly` - Generate monthly report

## Security

- All API routes require authentication
- Users can only access their own data
- Passwords hashed with bcrypt
- OAuth integration via NextAuth
- HTTPS required in production

## Development

### Type Checking
```bash
npm run typecheck
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Deployment

This application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any Node.js hosting platform

Ensure environment variables are configured in your deployment platform.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For support, please open an issue on GitHub.

---

**Built with ❤️ for financial wellness**
