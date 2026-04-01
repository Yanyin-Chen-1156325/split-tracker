import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateBalances, calculateSettlement } from "@/lib/settlement";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    const expenses = await prisma.expense.findMany({
      where: { groupId, closed: false },
      include: { splits: true },
    });

    const balances = calculateBalances(expenses);
    const transactions = calculateSettlement(expenses);

    return NextResponse.json({ balances, transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to calculate settlement" }, { status: 500 });
  }
}
