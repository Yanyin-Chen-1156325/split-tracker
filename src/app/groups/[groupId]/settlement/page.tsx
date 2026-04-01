"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MemberAvatar } from "@/components/MemberAvatar";

interface Balance {
  member: string;
  net: number;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export default function SettlementPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  async function fetchData() {
      try {
        const [settlRes, groupRes] = await Promise.all([
          fetch(`/api/groups/${groupId}/settlement`),
          fetch(`/api/groups/${groupId}`),
        ]);
        const settlData = await settlRes.json();
        const groupData = await groupRes.json();
        setBalances(settlData.balances);
        setTransactions(settlData.transactions);
        setGroupName(groupData.name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    fetchData();
  }, [groupId]);

  async function handleSettleAll() {
    if (!confirm("Mark all open expenses as settled?")) return;
    setSettling(true);
    try {
      await fetch(`/api/groups/${groupId}/settle-all`, { method: "POST" });
      await fetchData();
    } finally {
      setSettling(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const sortedBalances = [...balances].sort((a, b) => b.net - a.net);

  return (
    <div className="space-y-6">
      {/* Back */}
      <div>
        <Link
          href={`/groups/${groupId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {groupName}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settle Up</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Based on open expenses only
            </p>
          </div>
          {balances.length > 0 && (
            <Button
              onClick={handleSettleAll}
              disabled={settling}
              className="gap-2 shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              {settling ? "Settling..." : "Settle All"}
            </Button>
          )}
        </div>
      </div>

      {/* Net Balances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Net Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {sortedBalances.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No open expenses</p>
          ) : (
            sortedBalances.map((b) => (
              <div
                key={b.member}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40"
              >
                <div className="flex items-center gap-2">
                  <MemberAvatar name={b.member} size="md" />
                  <span className="font-medium">{b.member}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {b.net > 0.001 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : b.net < -0.001 ? (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={`font-bold text-lg ${
                      b.net > 0.001
                        ? "text-emerald-500"
                        : b.net < -0.001
                        ? "text-rose-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {b.net > 0.001
                      ? `+$${b.net.toFixed(2)}`
                      : b.net < -0.001
                      ? `-$${Math.abs(b.net).toFixed(2)}`
                      : "$0.00"}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Transactions */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base">Payment Plan</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="font-medium">All settled up!</p>
            <p className="text-muted-foreground text-sm">No payments needed</p>
          </div>
        ) : (
          transactions.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border bg-card p-4"
            >
              {/* From */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <MemberAvatar name={t.from} size="lg" />
                <span className="text-sm font-medium">{t.from}</span>
                <Badge variant="destructive" className="text-xs">Pays</Badge>
              </div>

              {/* Arrow + Amount */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <span className="font-bold text-xl">${t.amount.toFixed(2)}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="h-px w-8 bg-border" />
                  <ArrowRight className="w-4 h-4" />
                  <div className="h-px w-8 bg-border" />
                </div>
                <span className="text-xs text-muted-foreground">pays to</span>
              </div>

              {/* To */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <MemberAvatar name={t.to} size="lg" />
                <span className="text-sm font-medium">{t.to}</span>
                <Badge variant="secondary" className="text-xs text-emerald-600">Receives</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
