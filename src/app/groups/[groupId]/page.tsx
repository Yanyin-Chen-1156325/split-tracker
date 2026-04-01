"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseCard } from "@/components/ExpenseCard";
import { MemberAvatar } from "@/components/MemberAvatar";

interface Member {
  id: string;
  name: string;
}

interface ExpenseSplit {
  id: string;
  memberName: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  closed: boolean;
  splits: ExpenseSplit[];
}

interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
}

export default function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "settled">("all");

  async function fetchGroup() {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      setGroup(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  async function handleAddExpense(data: {
    description: string;
    amount: number;
    paidBy: string;
    date: Date;
    splits: string[];
  }) {
    await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, date: data.date.toISOString() }),
    });
    setAddOpen(false);
    fetchGroup();
  }

  async function handleEditExpense(
    id: string,
    data: {
      description: string;
      amount: number;
      paidBy: string;
      date: Date;
      splits: string[];
    }
  ) {
    await fetch(`/api/groups/${groupId}/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, date: data.date.toISOString() }),
    });
    fetchGroup();
  }

  async function handleToggleStatus(id: string, closed: boolean) {
    await fetch(`/api/groups/${groupId}/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closed }),
    });
    fetchGroup();
  }

  async function handleDeleteExpense(id: string) {
    await fetch(`/api/groups/${groupId}/expenses/${id}`, {
      method: "DELETE",
    });
    fetchGroup();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!group) {
    return <div className="text-center py-20 text-muted-foreground">Group not found</div>;
  }

  const filteredExpenses = group.expenses.filter((e) => {
    if (filter === "open") return !e.closed;
    if (filter === "settled") return e.closed;
    return true;
  });

  const openCount = group.expenses.filter((e) => !e.closed).length;
  const totalOpen = group.expenses
    .filter((e) => !e.closed)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Back + Title */}
      <div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Groups
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {group.members.map((m) => (
                <MemberAvatar key={m.id} name={m.name} size="md" showName />
              ))}
            </div>
          </div>

          {/* Settlement button */}
          <Link href={`/groups/${groupId}/settlement`}>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Calculator className="w-3.5 h-3.5" />
              Settle Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Open Expenses</p>
          <p className="text-2xl font-bold mt-1">{openCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Owed</p>
          <p className="text-2xl font-bold mt-1">${totalOpen.toFixed(2)}</p>
        </div>
      </div>

      <Separator />

      {/* Expenses Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(["all", "open", "settled"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === "all" ? "All" : f === "open" ? "Open" : "Settled"}
            </Button>
          ))}
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Expense
              </Button>
            }
          />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              members={group.members}
              onSubmit={handleAddExpense}
              onCancel={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Badge variant="secondary" className="text-xs">
            {filter === "all" ? "No expenses yet" : filter === "open" ? "No open expenses" : "No settled expenses"}
          </Badge>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              members={group.members}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
            />
          ))}
        </div>
      )}
    </div>
  );
}
