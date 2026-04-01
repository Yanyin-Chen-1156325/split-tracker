"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Users, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { MemberAvatar } from "@/components/MemberAvatar";

interface Group {
  id: string;
  name: string;
  createdAt: string;
  members: { id: string; name: string }[];
  openExpenseCount: number;
  totalOpenAmount: number;
}

export default function HomePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGroups() {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  async function deleteGroup(id: string) {
    if (!confirm("Delete this group? All expenses will be permanently removed.")) return;
    await fetch(`/api/groups/${id}`, { method: "DELETE" });
    fetchGroups();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Groups</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your expense groups
          </p>
        </div>
        <CreateGroupDialog onCreated={fetchGroups} />
      </div>

      <Separator />

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No groups yet</p>
          <p className="text-muted-foreground text-sm">
            Create a group to start splitting expenses
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <Link href={`/groups/${group.id}`} className="block">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="font-semibold text-lg leading-none">{group.name}</h2>
                      <div className="flex items-center gap-1 flex-wrap mt-2">
                        {group.members.map((m) => (
                          <MemberAvatar key={m.id} name={m.name} size="sm" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {group.members.map((m) => m.name).join(", ")}
                        </span>
                      </div>
                    </div>
                    {group.openExpenseCount > 0 && (
                      <Badge variant="secondary" className="shrink-0">
                        {group.openExpenseCount} open
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" />
                        {group.openExpenseCount} unsettled
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-bold text-lg">
                        ${group.totalOpenAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Link>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  deleteGroup(group.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
