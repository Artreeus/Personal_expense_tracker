# Clerk Migration Guide

## Environment Variables Needed

Add these to your `.env` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
WEBHOOK_SECRET=whsec_... # Get this from Clerk Dashboard > Webhooks
```

## What's Been Updated

1. ✅ Installed @clerk/nextjs
2. ✅ Created middleware.ts for route protection
3. ✅ Updated Providers to use ClerkProvider
4. ✅ Created Clerk helpers for MongoDB sync
5. ✅ Updated User model to include clerk_id
6. ✅ Created webhook handler for user sync
7. ✅ Updated home page to use Clerk
8. ✅ Created new sign-in/sign-up pages using Clerk components
9. ✅ Updated dashboard page to use Clerk
10. ✅ Started updating API routes

## Still Need to Update

### API Routes (Replace getServerSession with Clerk auth):
- [ ] app/api/transactions/[id]/route.ts
- [ ] app/api/categories/route.ts
- [ ] app/api/categories/[id]/route.ts
- [ ] app/api/dashboard/stats/route.ts
- [ ] app/api/reports/monthly/route.ts
- [ ] app/api/budgets/route.ts
- [ ] app/api/budgets/[id]/route.ts
- [ ] app/api/goals/route.ts
- [ ] app/api/goals/[id]/route.ts

### Dashboard Pages (Replace useSession with useUser):
- [ ] app/dashboard/add/page.tsx
- [ ] app/dashboard/transactions/page.tsx
- [ ] app/dashboard/categories/page.tsx
- [ ] app/dashboard/budgets/page.tsx
- [ ] app/dashboard/goals/page.tsx
- [ ] app/dashboard/reports/page.tsx
- [ ] app/dashboard/settings/page.tsx
- [ ] app/dashboard/quick/page.tsx
- [ ] components/quick-add-button.tsx

### Pattern for API Routes:
```typescript
// OLD:
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
const session = await getServerSession(authOptions);
if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userId = session.user.id;

// NEW:
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
const { userId } = await auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const mongoUserId = await getMongoUserIdFromClerk();
if (!mongoUserId) return NextResponse.json({ error: 'User not found' }, { status: 404 });
```

### Pattern for Client Components:
```typescript
// OLD:
import { useSession } from 'next-auth/react';
const { data: session, status } = useSession();
if (status === 'loading') return <Loading />;
if (status === 'unauthenticated') redirect('/auth/signin');

// NEW:
import { useUser } from '@clerk/nextjs';
const { isLoaded, isSignedIn, user } = useUser();
if (!isLoaded) return <Loading />;
if (!isSignedIn) router.push('/auth/signin');
```

## Webhook Setup

1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`
4. Copy the signing secret to `WEBHOOK_SECRET` in .env

