import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnLoginPage = req.nextUrl.pathname.startsWith("/login");
    const isPublicAsset = req.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);

    if (isPublicAsset) return NextResponse.next();

    if (isOnLoginPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", req.nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
