import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTransactions } from "@/lib/TransactionContext";
import Colors from "@/constants/colors";

const { palette } = Colors;

function formatCurrency(val: number): string {
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ title, value, icon, color, subtitle }: { title: string; value: string; icon: string; color: string; subtitle?: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconBg, { backgroundColor: color + "18" }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function RecentTransaction({ txn }: { txn: any }) {
  const isPositive = txn.profit > 0;
  return (
    <View style={styles.recentItem}>
      <View style={styles.recentLeft}>
        <View style={[styles.avatar, { backgroundColor: palette.emerald + "20" }]}>
          <Text style={styles.avatarText}>{txn.customerName.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.recentName}>{txn.customerName}</Text>
          <Text style={styles.recentCard}>{txn.cardType} {txn.cardLast4 !== "----" ? `****${txn.cardLast4}` : ""}</Text>
        </View>
      </View>
      <View style={styles.recentRight}>
        <Text style={[styles.recentProfit, { color: isPositive ? palette.emerald : palette.red }]}>
          {isPositive ? "+" : ""}{formatCurrency(txn.profit)}
        </Text>
        <Text style={styles.recentUsdt}>{formatCurrency(txn.sellAmountUSDT)} USDT</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, isLoading, totalProfit, totalRevenue, totalCost, customerStats, refresh } = useTransactions();

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const avgProfit = transactions.length > 0 ? totalProfit / transactions.length : 0;
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + webTopInset + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={palette.emerald} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>USDT Sales</Text>
            <Text style={styles.headerSubtitle}>{transactions.length} total transactions</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/add-transaction");
            }}
          >
            <Ionicons name="add" size={22} color={palette.white} />
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Total Profit" value={formatCurrency(totalProfit)} icon="trending-up" color={palette.emerald} subtitle={`${formatCurrency(avgMargin)}% margin`} />
          <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon="wallet-outline" color="#6366F1" />
          <StatCard title="Total Cost" value={formatCurrency(totalCost)} icon="cart-outline" color={palette.gold} />
          <StatCard title="Avg Profit" value={formatCurrency(avgProfit)} icon="analytics-outline" color="#EC4899" subtitle="per transaction" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Customers</Text>
        </View>
        {customerStats.slice(0, 4).map((c, i) => (
          <View key={c.name} style={styles.customerRow}>
            <View style={styles.customerLeft}>
              <View style={[styles.rankBadge, i === 0 && { backgroundColor: palette.gold + "20" }]}>
                <Text style={[styles.rankText, i === 0 && { color: palette.gold }]}>{i + 1}</Text>
              </View>
              <View>
                <Text style={styles.customerName}>{c.name}</Text>
                <Text style={styles.customerCount}>{c.count} sales</Text>
              </View>
            </View>
            <Text style={styles.customerProfit}>{formatCurrency(c.profit)}</Text>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
        </View>
        {transactions.slice(0, 5).map((txn) => (
          <RecentTransaction key={txn.id} txn={txn} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.offWhite },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.offWhite },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 28, fontFamily: "DMSans_700Bold", color: palette.navy, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", color: palette.textMuted, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.emerald, alignItems: "center", justifyContent: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  statCard: {
    width: "47%" as any,
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  statIconBg: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statTitle: { fontSize: 12, fontFamily: "DMSans_500Medium", color: palette.textMuted, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontFamily: "DMSans_700Bold", letterSpacing: -0.3 },
  statSubtitle: { fontSize: 11, fontFamily: "DMSans_400Regular", color: palette.textMuted, marginTop: 2 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "DMSans_700Bold", color: palette.navy },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  customerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: palette.offWhite, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 13, fontFamily: "DMSans_700Bold", color: palette.slate },
  customerName: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: palette.navy },
  customerCount: { fontSize: 12, fontFamily: "DMSans_400Regular", color: palette.textMuted },
  customerProfit: { fontSize: 15, fontFamily: "DMSans_700Bold", color: palette.emerald },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recentLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "DMSans_700Bold", color: palette.emerald },
  recentName: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: palette.navy },
  recentCard: { fontSize: 12, fontFamily: "DMSans_400Regular", color: palette.textMuted, marginTop: 1 },
  recentRight: { alignItems: "flex-end" },
  recentProfit: { fontSize: 15, fontFamily: "DMSans_700Bold" },
  recentUsdt: { fontSize: 12, fontFamily: "DMSans_400Regular", color: palette.textMuted, marginTop: 1 },
});
