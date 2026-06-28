import type { DefaultSession } from "next-auth";

import type { Role } from "@shared/types/enums";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    mustChangePassword: boolean;
  }
}
