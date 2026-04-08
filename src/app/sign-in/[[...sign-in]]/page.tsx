import { SignIn } from "@clerk/nextjs";

import AuthShell from "@/components/AuthShell";
import { authAppearance } from "@/lib/clerkAppearance";

export default function Page() {
  return (
    <AuthShell
      badge="Welcome back"
      title="Pick up your prompts right where you left them."
      description="Sign in to keep your generated content synced, revisit previous ideas, and continue building from the same workspace."
      alternateHref="/sign-up"
      alternateLabel="Create an account"
      alternateText="New here?"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
        <p className="mt-2 text-sm text-white/65">
          Access your saved history and continue generating with your account.
        </p>
      </div>

      <SignIn
        appearance={authAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
