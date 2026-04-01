"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calculator } from "@/components/Calculator";
import { MemberAvatar } from "@/components/MemberAvatar";

interface ExpenseFormData {
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  splits: string[];
}

interface ExpenseFormProps {
  members: { id: string; name: string }[];
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  members,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add",
}: ExpenseFormProps) {
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [paidBy, setPaidBy] = useState(initialData?.paidBy ?? "");
  const [date, setDate] = useState<Date>(initialData?.date ?? new Date());
  const [splits, setSplits] = useState<string[]>(
    initialData?.splits ?? members.map((m) => m.name)
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleSplit(name: string) {
    setSplits((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = "Description is required";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      errs.amount = "Enter a valid amount";
    if (!paidBy) errs.paidBy = "Select who paid";
    if (splits.length === 0) errs.splits = "Select at least one member to split with";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        description,
        amount: Number(amount),
        paidBy,
        date,
        splits,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "MM/dd/yyyy")}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) setDate(d);
                setShowCalendar(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input
          placeholder="e.g. Dinner, Taxi..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-destructive text-xs">{errors.description}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label>Amount</Label>
        <div
          className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs items-center cursor-pointer hover:border-primary transition-colors ${
            errors.amount ? "border-destructive" : "border-input"
          }`}
          onClick={() => setShowCalc(true)}
        >
          <span className={amount ? "" : "text-muted-foreground"}>
            {amount ? `$ ${amount}` : "Click to enter amount"}
          </span>
        </div>
        {errors.amount && (
          <p className="text-destructive text-xs">{errors.amount}</p>
        )}
        <Calculator
          open={showCalc}
          onClose={() => setShowCalc(false)}
          onConfirm={(val) => setAmount(val.toString())}
          initialValue={amount}
        />
      </div>

      {/* Paid By */}
      <div className="space-y-1.5">
        <Label>Paid By</Label>
        <Select
          value={paidBy}
          onValueChange={(val) => {
            if (val) setPaidBy(val);
          }}
        >
          <SelectTrigger className={`w-full ${errors.paidBy ? "border-destructive" : ""}`}>
            <SelectValue placeholder="Select who paid" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.name}>
                <div className="flex items-center gap-2">
                  <MemberAvatar name={m.name} size="sm" />
                  {m.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.paidBy && (
          <p className="text-destructive text-xs">{errors.paidBy}</p>
        )}
      </div>

      {/* Split Among */}
      <div className="space-y-1.5">
        <Label>Split Among</Label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const selected = splits.includes(m.name);
            return (
              <Badge
                key={m.id}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer select-none gap-1.5 py-1.5 px-3 text-sm"
                onClick={() => toggleSplit(m.name)}
              >
                <MemberAvatar name={m.name} size="sm" />
                {m.name}
              </Badge>
            );
          })}
        </div>
        {errors.splits && (
          <p className="text-destructive text-xs">{errors.splits}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
