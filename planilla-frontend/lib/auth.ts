import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "./supabase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        try {
          console.log('🔍 Buscando usuario con email:', credentials.email);
          console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
          console.log('🔑 Service Role Key existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

          // Buscar usuario en Supabase
          const { data: usuario, error } = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('email', credentials.email)
            .single();

          console.log('📊 Resultado de Supabase:');
          console.log('  - Usuario encontrado:', usuario ? 'SÍ' : 'NO');
          console.log('  - Error:', error ? error.message : 'ninguno');
          if (error) {
            console.log('  - Error completo:', JSON.stringify(error, null, 2));
          }
          if (usuario) {
            console.log('  - Email del usuario:', usuario.email);
            console.log('  - Rol:', usuario.rol);
            console.log('  - Activo:', usuario.activo);
          }

          if (error || !usuario) {
            console.error('❌ Error de Supabase o usuario no encontrado');
            throw new Error("Credenciales incorrectas");
          }

          // Verificar que el usuario esté activo
          if (!usuario.activo) {
            throw new Error("Usuario inactivo. Contacta al administrador.");
          }

          // Verificar contraseña
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            usuario.password
          );

          if (!passwordMatch) {
            throw new Error("Credenciales incorrectas");
          }

          // Enviar auditoría a n8n (opcional)
          try {
            const webhookUrl = process.env.N8N_WEBHOOK_AUDITORIA_LOGIN;
            if (webhookUrl) {
              await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  accion: 'login',
                  email: usuario.email,
                  nombre: usuario.nombre,
                  rol: usuario.rol,
                  fecha: new Date().toISOString()
                })
              });
            }
          } catch (webhookError) {
            console.error('Error al enviar auditoría a n8n:', webhookError);
            // No bloqueamos el login si falla el webhook
          }

          // Retornar datos del usuario
          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nombre,
            rol: usuario.rol
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Agregar rol al token JWT
      if (user) {
        token.rol = (user as any).rol;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Agregar rol a la sesión
      if (session.user) {
        (session.user as any).rol = token.rol;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};
