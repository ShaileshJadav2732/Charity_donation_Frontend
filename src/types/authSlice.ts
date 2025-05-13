export interface AppUser {
  uid: string;
  email: string | null;
  fullName?: string;
  profilePicture?: string;
}

export interface AuthState {
  user: DbUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface DbUser {
  _id: string;
  email: string;
  firebaseUid: string;
  role: "donor";
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
