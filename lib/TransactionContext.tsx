import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Transaction, getTransactions, addTransaction as addTxn, deleteTransaction as delTxn, seedInitialData } from "./storage";

interface TransactionContextValue {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (txn: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  totalProfit: number;
  totalRevenue: number;
  totalCost: number;
  customerStats: { name: string; profit: number; count: number }[];
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await seedInitialData();
    const data = await getTransactions();
    setTransactions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTransaction = useCallback(async (txn: Transaction) => {
    await addTxn(txn);
    setTransactions((prev) => [txn, ...prev]);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await delTxn(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const totalProfit = useMemo(() => transactions.reduce((s, t) => s + t.profit, 0), [transactions]);
  const totalRevenue = useMemo(() => transactions.reduce((s, t) => s + t.revenue, 0), [transactions]);
  const totalCost = useMemo(() => transactions.reduce((s, t) => s + t.cost, 0), [transactions]);

  const customerStats = useMemo(() => {
    const map = new Map<string, { profit: number; count: number }>();
    transactions.forEach((t) => {
      const existing = map.get(t.customerName) || { profit: 0, count: 0 };
      map.set(t.customerName, { profit: existing.profit + t.profit, count: existing.count + 1 });
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.profit - a.profit);
  }, [transactions]);

  const value = useMemo(
    () => ({ transactions, isLoading, addTransaction, deleteTransaction, refresh, totalProfit, totalRevenue, totalCost, customerStats }),
    [transactions, isLoading, addTransaction, deleteTransaction, refresh, totalProfit, totalRevenue, totalCost, customerStats]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
}
