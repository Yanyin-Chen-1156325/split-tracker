import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { expenseId } = await params;
    const body = await request.json();
    const { description, amount, paidBy, date, splits } = body as {
      description: string;
      amount: number;
      paidBy: string;
      date: string;
      splits: string[];
    };

    // delete old splits and create new ones
    await prisma.expenseSplit.deleteMany({ where: { expenseId } });

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: description.trim(),
        amount,
        paidBy,
        date: date ? new Date(date) : new Date(),
        splits: {
          create: splits.map((memberName) => ({ memberName })),
        },
      },
      include: { splits: true },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { expenseId } = await params;
    const body = await request.json();
    const { closed } = body as { closed: boolean };

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: { closed },
      include: { splits: true },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update expense status" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { expenseId } = await params;
    await prisma.expense.delete({ where: { id: expenseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
