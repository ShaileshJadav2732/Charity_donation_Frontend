"use client";

import SignupForm from "@/components/auth/SignupForm";
import NoSSR from "@/components/common/NoSSR";

export default function SignupPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<NoSSR>
				<SignupForm />
			</NoSSR>
		</div>
	);
}
