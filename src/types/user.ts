export enum ERole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface IUserAttributes {
  id: string;
  password?: string;
  fullName?: string;
  gender?: string;
  avatar?: string;
  phoneNumber?: string;
  email: string;
  role?: ERole;
}

export interface IUserDecoded {
  id: string;
  email: string;
  role: ERole;
}
