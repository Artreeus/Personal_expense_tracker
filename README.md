4321# Finance Tracker - Personal Finance Management SaaS

A modern, full-featured personal finance management application built with Next.js 15, MongoDB, and Clerk authentication.

## Features

- 💰 **Transaction Management**: Track income and expenses with categories
- 📊 **Dashboard**: Real-time financial overview with charts and trends
- 🎯 **Budgets**: Set and track monthly budgets by category
- 🏆 **Goals**: Create and monitor financial goals
- 📈 **Reports**: Detailed monthly financial reports with visualizations
- 🤖 **AI Analysis**: AI-powered monthly financial analysis and recommendations
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Quick Add**: Fast transaction entry with keyboard shortcuts
- 🎨 **Modern UI**: Beautiful, intuitive interface with dark mode support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Charts**: Recharts
- **AI**: MegaLLM (OpenAI-compatible API)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Clerk account
- MegaLLM API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration (see [SETUP.md](./SETUP.md) for details)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See [SETUP.md](./SETUP.md) for complete environment variable configuration.

Required:
- `DATABASE_URL` - MongoDB connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `MEGALLM_API_KEY` - MegaLLM API key for AI features

Optional:
- `WEBHOOK_SECRET` - Clerk webhook secret (users sync on-demand if not set)
- `CRON_SECRET` - Secret for cron job authentication

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utilities and services
│   ├── models/           # MongoDB models
│   ├── ai-service.ts     # AI report generation
│   └── clerk-helpers.ts  # Clerk utilities
└── public/               # Static assets
```

## Features in Detail

### Dashboard
- Real-time financial statistics
- 7-day trend charts
- Category breakdown visualization
- Recent transactions

### Transactions
- Add, edit, delete transactions
- Filter by type, category, date
- Search functionality
- Bulk operations

### Budgets
- Set monthly budgets by category
- Track spending vs budget
- Visual progress indicators
- Budget alerts

### Goals
- Create financial goals
- Track progress
- Set deadlines
- Visual progress bars

### AI Reports
- Monthly financial analysis
- Spending pattern insights
- Personalized recommendations
- Automatic generation at month end

## Keyboard Shortcuts

- `Q` - Open quick add modal
- `Ctrl/Cmd + Enter` - Submit forms
- `Escape` - Close modals/go back

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check [SETUP.md](./SETUP.md) for setup help
- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for deployment help
- Open an issue on GitHub
