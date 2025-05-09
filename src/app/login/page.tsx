"use client";

import LoginForm from "@/components/auth/LoginForm";
import NoSSR from "@/components/common/NoSSR";

export default function LoginPage() {
  return (
    <div>
      <NoSSR>
        <LoginForm />
      </NoSSR>
    </div>
  );
}
