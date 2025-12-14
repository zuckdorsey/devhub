import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getSetting } from "@/lib/settings";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "PIN",
            credentials: {
                pin: { label: "PIN", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.pin) return null;

                const pin = credentials.pin as string;
                const hashedPin = await getSetting("auth_pin_hash");

                // If no PIN is set, allow default "123456"
                if (!hashedPin) {
                    if (pin === "123456") {
                        return { id: "1", name: "Admin", email: "admin@example.com" };
                    }
                    return null;
                }

                const isValid = await bcrypt.compare(pin, hashedPin);

                if (isValid) {
                    // Fetch user details from settings if available
                    const name = await getSetting("user_name") || "Admin";
                    const avatar = await getSetting("user_avatar");

                    return {
                        id: "1",
                        name: name,
                        email: "admin@example.com",
                        image: avatar
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // Refresh user data from DB on session check to keep it up to date
                const name = await getSetting("user_name");
                const avatar = await getSetting("user_avatar");

                if (name) session.user.name = name;
                if (avatar) session.user.image = avatar;
            }
            return session;
        },
    },
});
