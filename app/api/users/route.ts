import { NextRequest } from "next/server";
import argon2 from "argon2";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { registerUserSchema, updateUserSchema } from "@/lib/schemas/user";

export async function POST(req: NextRequest) {
  try {
    const body = registerUserSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      throw new ApiException("CONFLICT", "A user with this email already exists");
    }

    const hashedPassword = await argon2.hash(body.password);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        image: body.image,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, image: true },
    });

    return ok({ user }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = updateUserSchema.parse(await req.json());

    const updated = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: { id: true, name: true, email: true, image: true },
    });

    return ok({ user: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    await prisma.user.delete({ where: { id: userId } });
    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, name: true, email: true, image: true },
    });

    return ok({ users });
  } catch (err) {
    return handleRouteError(err);
  }
}
