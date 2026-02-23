import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
        return new Response("Missing token", { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: { verificationToken: token },
    });

    if (!user) {
        return new Response("Invalid token", { status: 400 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            verificationToken: null,
        },
    });

    // Redirect to success page or login with a flag
    redirect("/login?verified=true");
}
