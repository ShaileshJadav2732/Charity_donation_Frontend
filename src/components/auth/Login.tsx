import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { loginWithEmail, loginWithGoogle, error } = useAuthContext();

	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await loginWithEmail(email, password);
		} catch (err) {
			console.error("Login failed:", err);
		}
	};

	return (
		<div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
			<h2 className="text-2xl font-bold mb-4">Login</h2>

			{error && <div className="mb-4 text-red-500">{error}</div>}

			<form onSubmit={handleEmailLogin}>
				<div className="mb-4">
					<label className="block text-gray-700">Email</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md"
						required
					/>
				</div>

				<div className="mb-6">
					<label className="block text-gray-700">Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md"
						required
					/>
				</div>

				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
				>
					Login
				</button>
			</form>

			<div className="mt-4">
				<button
					onClick={() => loginWithGoogle()}
					className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
				>
					Login with Google
				</button>
			</div>
		</div>
	);
}
