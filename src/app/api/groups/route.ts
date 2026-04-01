import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: true,
        expenses: {
          where: { closed: false },
          include: { splits: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = groups.map((group) => ({
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      members: group.members,
      openExpenseCount: group.expenses.length,
      totalOpenAmount: group.expenses.reduce(
        (sum: number, e: { amount: number }) => sum + e.amount,
        0
      ),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, members } = body as { name: string; members: string[] };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }
    if (!members?.length) {
      return NextResponse.json({ error: "At least one member is required" }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        members: {
          create: members
            .filter((m) => m.trim())
            .map((m) => ({ name: m.trim() })),
        },
      },
      include: { members: true },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
