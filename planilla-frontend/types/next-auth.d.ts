import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      rol: 'admin' | 'editor' | 'visor';
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    rol: 'admin' | 'editor' | 'visor';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: 'admin' | 'editor' | 'visor';
  }
}
