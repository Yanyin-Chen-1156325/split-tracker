import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { description, amount, paidBy, date, splits } = body as {
      description: string;
      amount: number;
      paidBy: string;
      date: string;
      splits: string[];
    };

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }
    if (!paidBy) {
      return NextResponse.json({ error: "Paid by is required" }, { status: 400 });
    }
    if (!splits?.length) {
      return NextResponse.json({ error: "At least one split member is required" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description: description.trim(),
        amount,
        paidBy,
        date: date ? new Date(date) : new Date(),
        groupId,
        splits: {
          create: splits.map((memberName) => ({ memberName })),
        },
      },
      include: { splits: true },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
