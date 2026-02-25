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
import { useTheme } from "@/lib/ThemeContext";
import Colors from "@/constants/colors";

const { palette } = Colors;

function formatCurrency(val: number): string {
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ title, value, icon, color, subtitle, theme }: { title: string; value: string; icon: string; color: string; subtitle?: string; theme: any }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconBg, { backgroundColor: color + "18" }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={[styles.statTitle, { color: theme.textMuted }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}


export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, isLoading, totalProfit, totalRevenue, totalCost, customerStats, refresh } = useTransactions();
  const { isDark, theme, toggleTheme } = useTheme();

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const avgProfit = transactions.length > 0 ? totalProfit / transactions.length : 0;
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + webTopInset + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={palette.emerald} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>USDT Sales</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{transactions.length} total transactions</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.themeBtn, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTheme();
              }}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? palette.gold : palette.slate} />
            </Pressable>
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
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Total Profit" value={formatCurrency(totalProfit)} icon="trending-up" color={palette.emerald} subtitle={`${formatCurrency(avgMargin)}% margin`} theme={theme} />
          <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon="wallet-outline" color="#6366F1" theme={theme} />
          <StatCard title="Total Cost" value={formatCurrency(totalCost)} icon="cart-outline" color={palette.gold} theme={theme} />
          <StatCard title="Avg Profit" value={formatCurrency(avgProfit)} icon="analytics-outline" color="#EC4899" subtitle="per transaction" theme={theme} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Customers</Text>
        </View>
        {customerStats.slice(0, 4).map((c, i) => (
          <View key={c.name} style={[styles.customerRow, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
            <View style={styles.customerLeft}>
              <View style={[styles.rankBadge, { backgroundColor: theme.surfaceAlt }, i === 0 && { backgroundColor: palette.gold + "20" }]}>
                <Text style={[styles.rankText, { color: theme.textMuted }, i === 0 && { color: palette.gold }]}>{i + 1}</Text>
              </View>
              <View>
                <Text style={[styles.customerName, { color: theme.text }]}>{c.name}</Text>
                <Text style={[styles.customerCount, { color: theme.textMuted }]}>{c.count} sales</Text>
              </View>
            </View>
            <Text style={styles.customerProfit}>{formatCurrency(c.profit)}</Text>
          </View>
        ))}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 28, fontFamily: "DMSans_700Bold", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  themeBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.emerald, alignItems: "center", justifyContent: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  statCard: {
    width: "47%" as any,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  statIconBg: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statTitle: { fontSize: 12, fontFamily: "DMSans_500Medium", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontFamily: "DMSans_700Bold", letterSpacing: -0.3 },
  statSubtitle: { fontSize: 11, fontFamily: "DMSans_400Regular", marginTop: 2 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "DMSans_700Bold" },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  customerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 13, fontFamily: "DMSans_700Bold" },
  customerName: { fontSize: 15, fontFamily: "DMSans_600SemiBold" },
  customerCount: { fontSize: 12, fontFamily: "DMSans_400Regular" },
  customerProfit: { fontSize: 15, fontFamily: "DMSans_700Bold", color: palette.emerald },
});
