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

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw7Fl38xuouTFbhqcg1Of8NV9Uyhi0ghu6FJYNWChgkVEDgpiug8YYPw-9vPW6SQq8IEQ/exec";

const LOCAL_TRANSACTIONS_KEY = "usdt_local_transactions";

export async function fetchSheetTransactions(): Promise<Transaction[]> {
  const res = await fetch(GOOGLE_SHEET_URL);
  const data = await res.json();

  return data.map((row: any, index: number) => ({
    id: String(row.id ?? index + 1),
    customerName: (row.owner || "") + "",
    cardLast4: (row.cardNumber || "----") + "",
    cardType: ((row.cardType || "") + "").trim(),
    buyRate: Number(row.buyRate) || 0,
    buyAmountUSDT: Number(row.buyAmount) || 0,
    sellRate: Number(row.sellRate) || 0,
    sellAmountUSDT: Number(row.sellAmount) || 0,
    cost: Number(row.cost) || 0,
    revenue: Number(row.grossProfit) || 0,
    profit: Number(row.netProfit) || 0,
    createdAt: new Date().toISOString(),
  }));
}

export async function getLocalTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(LOCAL_TRANSACTIONS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

async function saveLocalTransactions(txns: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(txns));
}

export async function postToSheet(txn: Transaction): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      action: "add",
      cardType: txn.cardType,
      cardNumber: txn.cardLast4,
      owner: txn.customerName,
      buyRate: String(txn.buyRate),
      buyAmount: String(txn.buyAmountUSDT),
      sellRate: String(txn.sellRate),
      sellAmount: String(txn.sellAmountUSDT),
    });
    const res = await fetch(`${GOOGLE_SHEET_URL}?${params.toString()}`);
    const text = await res.text();
    return res.ok;
  } catch (e) {
    console.warn("Failed to post to sheet:", e);
    return false;
  }
}

export async function addTransaction(txn: Transaction): Promise<void> {
  await postToSheet(txn);
  const txns = await getLocalTransactions();
  txns.unshift(txn);
  await saveLocalTransactions(txns);
}

export async function deleteTransaction(id: string): Promise<void> {
  const txns = await getLocalTransactions();
  await saveLocalTransactions(txns.filter((t) => t.id !== id));
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
