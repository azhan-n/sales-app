import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
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

const CARD_COLORS: Record<string, string> = {
  "VISA DEBIT": "#1A73E8",
  "VISA CREDIT": "#6366F1",
  "AMEX": "#F59E0B",
  "CASH": "#10B981",
};

function TransactionCard({ item, onDelete }: { item: any; onDelete: (id: string) => void }) {
  const cardColor = CARD_COLORS[item.cardType] || palette.slate;

  const handleLongPress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Delete Transaction", `Remove this ${formatCurrency(item.sellAmountUSDT)} USDT sale to ${item.customerName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <Pressable
      onLongPress={handleLongPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={[styles.cardAvatar, { backgroundColor: cardColor + "15" }]}>
            <Text style={[styles.cardAvatarText, { color: cardColor }]}>{item.customerName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.cardName}>{item.customerName}</Text>
            <View style={styles.cardTypeRow}>
              <View style={[styles.cardTypeBadge, { backgroundColor: cardColor + "15" }]}>
                <Text style={[styles.cardTypeText, { color: cardColor }]}>{item.cardType}</Text>
              </View>
              {item.cardLast4 !== "----" && <Text style={styles.cardLast4}>****{item.cardLast4}</Text>}
            </View>
          </View>
        </View>
        <View style={styles.cardTopRight}>
          <Text style={[styles.profitValue, { color: item.profit > 0 ? palette.emerald : palette.red }]}>
            {item.profit > 0 ? "+" : ""}{formatCurrency(item.profit)}
          </Text>
          <Text style={styles.profitLabel}>profit</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottom}>
        <View style={styles.cardDetail}>
          <Text style={styles.detailLabel}>Buy</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.buyAmountUSDT)} USDT</Text>
          <Text style={styles.detailRate}>@ {item.buyRate}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color={palette.slateLight} />
        </View>
        <View style={[styles.cardDetail, { alignItems: "flex-end" }]}>
          <Text style={styles.detailLabel}>Sell</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.sellAmountUSDT)} USDT</Text>
          <Text style={styles.detailRate}>@ {item.sellRate}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Cost</Text>
          <Text style={styles.footerValue}>{formatCurrency(item.cost)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Revenue</Text>
          <Text style={styles.footerValue}>{formatCurrency(item.revenue)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Margin</Text>
          <Text style={[styles.footerValue, { color: palette.emerald }]}>
            {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : "0"}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, isLoading, deleteTransaction, refresh } = useTransactions();
  const [search, setSearch] = useState("");
  const [filterCard, setFilterCard] = useState<string | null>(null);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const cardTypes = useMemo(() => {
    const set = new Set(transactions.map((t) => t.cardType));
    return Array.from(set);
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = transactions;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.customerName.toLowerCase().includes(q) || t.cardType.toLowerCase().includes(q) || t.cardLast4.includes(q)
      );
    }
    if (filterCard) {
      result = result.filter((t) => t.cardType === filterCard);
    }
    return result;
  }, [transactions, search, filterCard]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Sales</Text>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/add-transaction");
            }}
          >
            <Ionicons name="add" size={22} color={palette.white} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={palette.slateLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, card..."
            placeholderTextColor={palette.slateLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={palette.slateLight} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={[null, ...cardTypes]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item || "all"}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const isActive = item === filterCard || (item === null && filterCard === null);
            return (
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setFilterCard(item);
                }}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {item || "All"}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={palette.emerald} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color={palette.slateLight} />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={filtered.length > 0}
          renderItem={({ item }) => <TransactionCard item={item} onDelete={deleteTransaction} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.offWhite },
  header: { paddingHorizontal: 20, paddingBottom: 4, backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", color: palette.navy, letterSpacing: -0.5 },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: palette.emerald, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.offWhite,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "DMSans_400Regular", color: palette.navy, padding: 0 },
  filterRow: { gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: palette.offWhite, borderWidth: 1, borderColor: "#E2E8F0" },
  filterChipActive: { backgroundColor: palette.emerald + "15", borderColor: palette.emerald },
  filterChipText: { fontSize: 13, fontFamily: "DMSans_500Medium", color: palette.textMuted },
  filterChipTextActive: { color: palette.emerald },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: palette.navy },
  emptySubtext: { fontSize: 13, fontFamily: "DMSans_400Regular", color: palette.textMuted },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTopLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cardAvatar: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardAvatarText: { fontSize: 17, fontFamily: "DMSans_700Bold" },
  cardName: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: palette.navy },
  cardTypeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  cardTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardTypeText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  cardLast4: { fontSize: 12, fontFamily: "DMSans_400Regular", color: palette.textMuted },
  cardTopRight: { alignItems: "flex-end" },
  profitValue: { fontSize: 17, fontFamily: "DMSans_700Bold" },
  profitLabel: { fontSize: 11, fontFamily: "DMSans_400Regular", color: palette.textMuted, textTransform: "uppercase" as const },
  cardDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardDetail: { flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", color: palette.textMuted, textTransform: "uppercase" as const, marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: palette.navy },
  detailRate: { fontSize: 12, fontFamily: "DMSans_400Regular", color: palette.slateLight, marginTop: 1 },
  arrowContainer: { paddingHorizontal: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  footerItem: { alignItems: "center" },
  footerLabel: { fontSize: 10, fontFamily: "DMSans_500Medium", color: palette.textMuted, textTransform: "uppercase" as const, marginBottom: 2 },
  footerValue: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: palette.navy },
});
