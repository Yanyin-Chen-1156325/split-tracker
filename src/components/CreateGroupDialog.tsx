"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreateGroupDialogProps {
  onCreated: () => void;
}

export function CreateGroupDialog({ onCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addMember() {
    setMembers((prev) => [...prev, ""]);
  }

  function removeMember(idx: number) {
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateMember(idx: number, val: string) {
    setMembers((prev) => prev.map((m, i) => (i === idx ? val : m)));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Group name is required";
    const validMembers = members.filter((m) => m.trim());
    if (validMembers.length < 2) errs.members = "At least 2 members are required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          members: members.filter((m) => m.trim()),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      setName("");
      setMembers(["", ""]);
      onCreated();
    } catch {
      setErrors({ submit: "Failed to create group. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Group
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Group Name</Label>
            <Input
              placeholder="e.g. Trip, Dinner..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            {members.map((m, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  placeholder={`Member ${idx + 1}`}
                  value={m}
                  onChange={(e) => updateMember(idx, e.target.value)}
                />
                {members.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.members && (
              <p className="text-destructive text-xs">{errors.members}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMember}
              className="w-full gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Member
            </Button>
          </div>

          {errors.submit && (
            <p className="text-destructive text-sm">{errors.submit}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
