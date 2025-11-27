import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
        routing="path"
        path="/auth/signin"
        signUpUrl="/auth/signup"
        afterSignInUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}

