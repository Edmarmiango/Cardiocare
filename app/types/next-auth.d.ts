import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      email: string
      role: Role
      status: UserStatus
      googleAccessToken?: string
      googleRefreshToken?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    status: UserStatus
  }
}

enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT"
}

enum UserStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}



