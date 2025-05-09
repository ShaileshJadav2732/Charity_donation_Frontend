"use client";

import SignupForm from "@/components/auth/SignupForm";
import NoSSR from "@/components/common/NoSSR";

export default function SignupPage() {
  return (
    <div>
      <NoSSR>
        <SignupForm />
      </NoSSR>
    </div>
  );
}
