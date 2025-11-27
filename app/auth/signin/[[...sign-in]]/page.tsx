import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignIn 
        routing="path"
        path="/auth/signin"
        signUpUrl="/auth/signup"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
