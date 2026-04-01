import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    const result = await prisma.expense.updateMany({
      where: { groupId, closed: false },
      data: { closed: true },
    });

    return NextResponse.json({ settled: result.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to settle all expenses" }, { status: 500 });
  }
}
