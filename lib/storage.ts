import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Transaction {
  id: string;
  customerName: string;
  cardLast4: string;
  cardType: string;
  buyRate: number;
  buyAmountUSDT: number;
  sellRate: number;
  sellAmountUSDT: number;
  cost: number;
  revenue: number;
  profit: number;
  createdAt: string;
}

const TRANSACTIONS_KEY = "usdt_transactions";

export async function getTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export async function saveTransactions(txns: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

export async function addTransaction(txn: Transaction): Promise<void> {
  const txns = await getTransactions();
  txns.unshift(txn);
  await saveTransactions(txns);
}

export async function deleteTransaction(id: string): Promise<void> {
  const txns = await getTransactions();
  await saveTransactions(txns.filter((t) => t.id !== id));
}

export async function seedInitialData(): Promise<void> {
  const existing = await getTransactions();
  if (existing.length > 0) return;

  const seed: Omit<Transaction, "id" | "createdAt">[] = [
    { customerName: "Azhan", cardLast4: "9750", cardType: "VISA DEBIT", buyRate: 15.42, buyAmountUSDT: 131.63, sellRate: 20.15, sellAmountUSDT: 115.0, cost: 2029.73, revenue: 2317.25, profit: 287.52 },
    { customerName: "Azhan", cardLast4: "9759", cardType: "VISA DEBIT", buyRate: 15.42, buyAmountUSDT: 114.50, sellRate: 20.20, sellAmountUSDT: 100.0, cost: 1765.59, revenue: 2020.0, profit: 254.41 },
    { customerName: "Azhan", cardLast4: "2581", cardType: "VISA CREDIT", buyRate: 15.42, buyAmountUSDT: 131.63, sellRate: 20.10, sellAmountUSDT: 115.0, cost: 2029.73, revenue: 2311.50, profit: 281.77 },
    { customerName: "Azhan", cardLast4: "2581", cardType: "VISA CREDIT", buyRate: 15.42, buyAmountUSDT: 188.88, sellRate: 20.25, sellAmountUSDT: 164.99, cost: 2912.53, revenue: 3341.05, profit: 428.52 },
    { customerName: "Azhan", cardLast4: "2581", cardType: "VISA CREDIT", buyRate: 15.42, buyAmountUSDT: 188.88, sellRate: 20.20, sellAmountUSDT: 165.0, cost: 2912.53, revenue: 3333.0, profit: 420.47 },
    { customerName: "Isha", cardLast4: "7835", cardType: "AMEX", buyRate: 15.42, buyAmountUSDT: 131.63, sellRate: 20.10, sellAmountUSDT: 115.0, cost: 2029.73, revenue: 2311.50, profit: 281.77 },
    { customerName: "Isha", cardLast4: "7835", cardType: "AMEX", buyRate: 15.42, buyAmountUSDT: 114.50, sellRate: 20.10, sellAmountUSDT: 100.0, cost: 1765.59, revenue: 2010.0, profit: 244.41 },
    { customerName: "Athoof", cardLast4: "0548", cardType: "VISA DEBIT", buyRate: 15.42, buyAmountUSDT: 131.64, sellRate: 20.0, sellAmountUSDT: 115.0, cost: 2029.89, revenue: 2300.0, profit: 270.11 },
    { customerName: "Athoof", cardLast4: "0548", cardType: "VISA DEBIT", buyRate: 15.42, buyAmountUSDT: 57.25, sellRate: 20.20, sellAmountUSDT: 50.0, cost: 882.80, revenue: 1010.0, profit: 127.21 },
    { customerName: "Bukke", cardLast4: "----", cardType: "CASH", buyRate: 19.0, buyAmountUSDT: 100.0, sellRate: 20.15, sellAmountUSDT: 100.0, cost: 1900.0, revenue: 2015.0, profit: 115.0 },
  ];

  const now = new Date();
  const txns: Transaction[] = seed.map((s, i) => ({
    ...s,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
    createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
  }));

  await saveTransactions(txns);
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
