"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/ExpenseForm";
import { MemberAvatar } from "@/components/MemberAvatar";

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  closed: boolean;
  splits: { id: string; memberName: string }[];
}

interface ExpenseCardProps {
  expense: Expense;
  members: { id: string; name: string }[];
  onToggleStatus: (id: string, closed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, data: {
    description: string;
    amount: number;
    paidBy: string;
    date: Date;
    splits: string[];
  }) => Promise<void>;
}

export function ExpenseCard({
  expense,
  members,
  onToggleStatus,
  onDelete,
  onEdit,
}: ExpenseCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const perPerson =
    expense.splits.length > 0
      ? expense.amount / expense.splits.length
      : expense.amount;

  async function handleToggle() {
    setLoading(true);
    try {
      await onToggleStatus(expense.id, !expense.closed);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this expense?")) return;
    setLoading(true);
    try {
      await onDelete(expense.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={`rounded-xl border p-4 transition-all ${
          expense.closed
            ? "opacity-60 bg-muted/30"
            : "bg-card hover:shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold truncate">{expense.description}</span>
              <Badge variant={expense.closed ? "secondary" : "default"} className="text-xs shrink-0">
                {expense.closed ? "Settled" : "Open"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {format(new Date(expense.date), "MM/dd")} · paid by{" "}
              <span className="font-medium text-foreground">{expense.paidBy}</span>
            </div>

            {/* Splits */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Split:</span>
              {expense.splits.map((s) => (
                <MemberAvatar key={s.id} name={s.memberName} size="sm" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ${perPerson.toFixed(2)} each
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            <div className="text-lg font-bold">${expense.amount.toFixed(2)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 gap-1.5 text-xs"
            onClick={handleToggle}
            disabled={loading}
          >
            {expense.closed ? (
              <>
                <Circle className="w-3.5 h-3.5" />
                Reopen
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settle
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => setEditOpen(true)}
            disabled={loading}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            members={members}
            initialData={{
              description: expense.description,
              amount: expense.amount,
              paidBy: expense.paidBy,
              date: new Date(expense.date),
              splits: expense.splits.map((s) => s.memberName),
            }}
            onSubmit={async (data) => {
              await onEdit(expense.id, data);
              setEditOpen(false);
            }}
            onCancel={() => setEditOpen(false)}
            submitLabel="Save"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
