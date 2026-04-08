import { SignUp } from "@clerk/nextjs";

import AuthShell from "@/components/AuthShell";
import { authAppearance } from "@/lib/clerkAppearance";

export default function Page() {
  return (
    <AuthShell
      badge="Create your space"
      title="Save your best prompts, drafts, and results in one place."
      description="Create an account to keep your history, move faster between sessions, and turn quick experiments into a reusable workflow."
      alternateHref="/sign-in"
      alternateLabel="Sign in instead"
      alternateText="Already have an account?"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight">Sign up</h2>
        <p className="mt-2 text-sm text-white/65">
          Start free and keep your prompt history attached to your account.
        </p>
      </div>

      <SignUp
        appearance={authAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
