# Clerk Migration Helper
This file lists all API routes that need to be updated to use Clerk instead of NextAuth.

## Pattern to replace:
- `import { getServerSession } from 'next-auth';`
- `import { authOptions } from '@/lib/auth';`
- `const session = await getServerSession(authOptions);`
- `if (!session?.user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }`
- `session.user.id`

## Replace with:
- `import { auth } from '@clerk/nextjs/server';`
- `import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';`
- `const { userId } = await auth();`
- `if (!userId) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }`
- `const mongoUserId = await getMongoUserIdFromClerk();`
- `if (!mongoUserId) { return NextResponse.json({ error: 'User not found' }, { status: 404 }); }`
- `mongoUserId` (instead of session.user.id)

