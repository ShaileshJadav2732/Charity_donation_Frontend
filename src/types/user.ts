export interface ISignupData {
	username: string;
	password: string;
	role: "admin" | "organization" | "donor";
}

export interface IUser {
	_id: string;
	username: string;
	role: "admin" | "organization" | "donor";
}

export interface AuthState {
	user: IUser | null;
	token: string | null;
	loading: boolean;
	error: string | null;
}
