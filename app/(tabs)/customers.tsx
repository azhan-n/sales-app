import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "@/lib/TransactionContext";
import { useTheme } from "@/lib/ThemeContext";
import Colors from "@/constants/colors";

const { palette } = Colors;

function formatCurrency(val: number): string {
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const AVATAR_COLORS = ["#10B981", "#6366F1", "#F59E0B", "#EC4899", "#1A73E8", "#EF4444"];

interface CustomerDetail {
  name: string;
  totalProfit: number;
  totalRevenue: number;
  totalCost: number;
  count: number;
  avgProfit: number;
  cards: string[];
}

function CustomerCard({ customer, index, expanded, onToggle, theme }: { customer: CustomerDetail; index: number; expanded: boolean; onToggle: () => void; theme: any }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.customerCard, { opacity: pressed ? 0.97 : 1, backgroundColor: theme.surface, shadowColor: theme.shadow }]}
    >
      <View style={styles.customerTop}>
        <View style={styles.customerLeft}>
          <View style={[styles.avatar, { backgroundColor: color + "18" }]}>
            <Text style={[styles.avatarText, { color }]}>{customer.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.customerName, { color: theme.text }]}>{customer.name}</Text>
            <Text style={[styles.customerSales, { color: theme.textMuted }]}>{customer.count} transaction{customer.count !== 1 ? "s" : ""}</Text>
          </View>
        </View>
        <View style={styles.customerRight}>
          <Text style={styles.customerProfit}>{formatCurrency(customer.totalProfit)}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={theme.textSecondary} />
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={[styles.expandedDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.expandedGrid}>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Revenue</Text>
              <Text style={[styles.expandedValue, { color: theme.text }]}>{formatCurrency(customer.totalRevenue)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Cost</Text>
              <Text style={[styles.expandedValue, { color: theme.text }]}>{formatCurrency(customer.totalCost)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Avg Profit</Text>
              <Text style={[styles.expandedValue, { color: palette.emerald }]}>{formatCurrency(customer.avgProfit)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Cards Used</Text>
              <View style={styles.cardsList}>
                {customer.cards.map((c) => (
                  <View key={c} style={[styles.cardBadge, { backgroundColor: theme.surfaceAlt }]}>
                    <Text style={[styles.cardBadgeText, { color: theme.textSecondary }]}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.profitBar}>
            <View style={[styles.profitBarBg, { backgroundColor: theme.surfaceAlt }]}>
              <View
                style={[
                  styles.profitBarFill,
                  { width: `${Math.min((customer.totalProfit / customer.totalRevenue) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={[styles.profitBarLabel, { color: theme.textMuted }]}>
              {((customer.totalProfit / customer.totalRevenue) * 100).toFixed(1)}% margin
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, isLoading } = useTransactions();
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const customers = useMemo<CustomerDetail[]>(() => {
    const map = new Map<string, { profit: number; revenue: number; cost: number; count: number; cards: Set<string> }>();
    transactions.forEach((t) => {
      const existing = map.get(t.customerName) || { profit: 0, revenue: 0, cost: 0, count: 0, cards: new Set<string>() };
      existing.profit += t.profit;
      existing.revenue += t.revenue;
      existing.cost += t.cost;
      existing.count += 1;
      existing.cards.add(t.cardType);
      map.set(t.customerName, existing);
    });
    return Array.from(map.entries())
      .map(([name, s]) => ({
        name,
        totalProfit: s.profit,
        totalRevenue: s.revenue,
        totalCost: s.cost,
        count: s.count,
        avgProfit: s.profit / s.count,
        cards: Array.from(s.cards),
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [transactions]);

  const totalCustomers = customers.length;
  const bestCustomer = customers[0];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + webTopInset + 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={customers.length > 0}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Customers</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{totalCustomers} customer{totalCustomers !== 1 ? "s" : ""}</Text>

            {bestCustomer && (
              <View style={[styles.bestCard, { backgroundColor: palette.gold + "0D", borderColor: palette.gold + "25" }]}>
                <View style={styles.bestCardHeader}>
                  <Ionicons name="trophy" size={18} color={palette.gold} />
                  <Text style={styles.bestCardTitle}>Top Performer</Text>
                </View>
                <Text style={[styles.bestCardName, { color: theme.text }]}>{bestCustomer.name}</Text>
                <Text style={styles.bestCardProfit}>{formatCurrency(bestCustomer.totalProfit)} total profit</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No customers yet</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <CustomerCard
            customer={item}
            index={index}
            expanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            theme={theme}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listHeader: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", marginTop: 2, marginBottom: 16 },
  bestCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  bestCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  bestCardTitle: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: palette.gold, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  bestCardName: { fontSize: 20, fontFamily: "DMSans_700Bold" },
  bestCardProfit: { fontSize: 14, fontFamily: "DMSans_500Medium", color: palette.emerald, marginTop: 2 },
  customerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  customerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "DMSans_700Bold" },
  customerName: { fontSize: 16, fontFamily: "DMSans_600SemiBold" },
  customerSales: { fontSize: 13, fontFamily: "DMSans_400Regular", marginTop: 1 },
  customerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  customerProfit: { fontSize: 16, fontFamily: "DMSans_700Bold", color: palette.emerald },
  expandedSection: { marginTop: 4 },
  expandedDivider: { height: 1, marginVertical: 12 },
  expandedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  expandedItem: { width: "46%" as any },
  expandedLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", textTransform: "uppercase" as const, marginBottom: 3 },
  expandedValue: { fontSize: 15, fontFamily: "DMSans_600SemiBold" },
  cardsList: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  cardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardBadgeText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const },
  profitBar: { marginTop: 16 },
  profitBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  profitBarFill: { height: "100%", borderRadius: 3, backgroundColor: palette.emerald },
  profitBarLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 100 },
  emptyText: { fontSize: 16, fontFamily: "DMSans_600SemiBold" },
});
