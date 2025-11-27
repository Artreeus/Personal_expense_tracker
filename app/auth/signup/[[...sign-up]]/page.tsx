import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
        routing="path"
        path="/auth/signup"
        signInUrl="/auth/signin"
        afterSignUpUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}

