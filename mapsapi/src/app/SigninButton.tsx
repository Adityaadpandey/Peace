import { UserButton } from "@clerk/nextjs";

export default function SignInButton() {
  return (
    <UserButton
      userProfileProps={{
        additionalOAuthScopes: {
          google: [
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.activity.write"
          ]
        }
      }}
      afterSignOutUrl="/"
    />
  );
}