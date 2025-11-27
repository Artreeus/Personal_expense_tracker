import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-md',
            card: 'shadow-xl border-0 bg-background',
            headerTitle: 'text-2xl font-bold text-foreground',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors',
            socialButtonsBlockButtonText: 'font-medium text-foreground',
            formButtonPrimary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md',
            footerActionLink: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium',
            formFieldInput: 'border-input bg-background text-foreground',
            identityPreviewText: 'text-foreground',
            identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
            formResendCodeLink: 'text-blue-600 hover:text-blue-700',
            footerAction: 'text-muted-foreground text-sm',
            footerPages: 'hidden',
            footer: 'hidden',
            formFieldLabel: 'text-foreground font-medium',
            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground text-xs',
            alertText: 'text-foreground',
            formHeaderTitle: 'text-2xl font-bold text-foreground',
            formHeaderSubtitle: 'text-muted-foreground',
            header: 'hidden',
            logoImage: 'hidden',
            logoBox: 'hidden',
          },
          layout: {
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'blockButton',
            showOptionalFields: false,
          },
          variables: {
            colorPrimary: '#3b82f6',
            colorText: 'hsl(var(--foreground))',
            colorTextSecondary: 'hsl(var(--muted-foreground))',
            colorBackground: 'hsl(var(--background))',
            colorInputBackground: 'hsl(var(--background))',
            colorInputText: 'hsl(var(--foreground))',
            borderRadius: '0.5rem',
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

