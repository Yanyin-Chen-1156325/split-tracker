export interface ExpenseWithSplits {
  amount: number;
  paidBy: string;
  splits: { memberName: string }[];
}

export interface Balance {
  member: string;
  net: number; // positive = owed money, negative = owes money
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export function calculateBalances(expenses: ExpenseWithSplits[]): Balance[] {
  const balanceMap = new Map<string, number>();

  for (const expense of expenses) {
    const splitCount = expense.splits.length;
    if (splitCount === 0) continue;

    const perPerson = expense.amount / splitCount;

    // payer gets credit
    balanceMap.set(
      expense.paidBy,
      (balanceMap.get(expense.paidBy) ?? 0) + expense.amount
    );

    // each split member owes their share
    for (const split of expense.splits) {
      balanceMap.set(
        split.memberName,
        (balanceMap.get(split.memberName) ?? 0) - perPerson
      );
    }
  }

  return Array.from(balanceMap.entries()).map(([member, net]) => ({
    member,
    net: Math.round(net * 100) / 100,
  }));
}

export function calculateSettlement(expenses: ExpenseWithSplits[]): Transaction[] {
  const balances = calculateBalances(expenses);

  // separate into creditors (net > 0) and debtors (net < 0)
  const creditors = balances
    .filter((b) => b.net > 0.001)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter((b) => b.net < -0.001)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net);

  const transactions: Transaction[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const amount = Math.min(creditor.net, -debtor.net);
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > 0.001) {
      transactions.push({
        from: debtor.member,
        to: creditor.member,
        amount: rounded,
      });
    }

    creditor.net -= amount;
    debtor.net += amount;

    if (Math.abs(creditor.net) < 0.001) ci++;
    if (Math.abs(debtor.net) < 0.001) di++;
  }

  return transactions;
}
