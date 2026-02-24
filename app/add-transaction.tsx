import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTransactions } from "@/lib/TransactionContext";
import { useTheme } from "@/lib/ThemeContext";
import { generateId, Transaction } from "@/lib/storage";
import Colors from "@/constants/colors";

const { palette } = Colors;

const CARD_TYPES = ["VISA DEBIT", "VISA CREDIT", "AMEX", "MASTERCARD", "CASH"];

export default function AddTransactionScreen() {
  const { addTransaction } = useTransactions();
  const { theme } = useTheme();

  const [customerName, setCustomerName] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [cardType, setCardType] = useState("VISA DEBIT");
  const [buyRate, setBuyRate] = useState("");
  const [buyAmountUSDT, setBuyAmountUSDT] = useState("");
  const [sellRate, setSellRate] = useState("");
  const [sellAmountUSDT, setSellAmountUSDT] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const calculations = useMemo(() => {
    const br = parseFloat(buyRate) || 0;
    const ba = parseFloat(buyAmountUSDT) || 0;
    const sr = parseFloat(sellRate) || 0;
    const sa = parseFloat(sellAmountUSDT) || 0;
    const cost = br * ba;
    const revenue = sr * sa;
    const profit = revenue - cost;
    return { cost, revenue, profit };
  }, [buyRate, buyAmountUSDT, sellRate, sellAmountUSDT]);

  const isValid = customerName.trim().length > 0 && parseFloat(buyRate) > 0 && parseFloat(buyAmountUSDT) > 0 && parseFloat(sellRate) > 0 && parseFloat(sellAmountUSDT) > 0;

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const txn: Transaction = {
      id: generateId(),
      customerName: customerName.trim(),
      cardLast4: cardLast4.trim() || "----",
      cardType,
      buyRate: parseFloat(buyRate),
      buyAmountUSDT: parseFloat(buyAmountUSDT),
      sellRate: parseFloat(sellRate),
      sellAmountUSDT: parseFloat(sellAmountUSDT),
      cost: calculations.cost,
      revenue: calculations.revenue,
      profit: calculations.profit,
      createdAt: new Date().toISOString(),
    };

    try {
      await addTransaction(txn);
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save transaction");
      setIsSaving(false);
    }
  };

  function formatCurrency(val: number): string {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Sale</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Customer</Text>
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="Customer name"
              placeholderTextColor={theme.textSecondary}
              value={customerName}
              onChangeText={setCustomerName}
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Card Last 4</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="0000"
              placeholderTextColor={theme.textSecondary}
              value={cardLast4}
              onChangeText={(t) => setCardLast4(t.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Card Type</Text>
        <View style={styles.chipRow}>
          {CARD_TYPES.map((ct) => (
            <Pressable
              key={ct}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setCardType(ct);
              }}
              style={[styles.chip, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, cardType === ct && styles.chipActive]}
            >
              <Text style={[styles.chipText, { color: theme.textMuted }, cardType === ct && styles.chipTextActive]}>{ct}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24, color: theme.text }]}>Buy Side</Text>
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Rate</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={buyRate}
              onChangeText={setBuyRate}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>USD Amount</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={buyAmountUSDT}
              onChangeText={setBuyAmountUSDT}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24, color: theme.text }]}>Sell Side</Text>
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Rate</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={sellRate}
              onChangeText={setSellRate}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>USDT Amount</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={sellAmountUSDT}
              onChangeText={setSellAmountUSDT}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={[styles.calcCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: theme.textMuted }]}>Cost</Text>
            <Text style={[styles.calcValue, { color: theme.text }]}>{formatCurrency(calculations.cost)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: theme.textMuted }]}>Revenue</Text>
            <Text style={[styles.calcValue, { color: theme.text }]}>{formatCurrency(calculations.revenue)}</Text>
          </View>
          <View style={[styles.calcDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabelBold, { color: theme.text }]}>Profit</Text>
            <Text style={[styles.calcValueBold, { color: calculations.profit >= 0 ? palette.emerald : palette.red }]}>
              {calculations.profit >= 0 ? "+" : ""}{formatCurrency(calculations.profit)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!isValid || isSaving}
          style={({ pressed }) => [
            styles.saveBtn,
            { opacity: (!isValid || isSaving) ? 0.5 : pressed ? 0.9 : 1, transform: [{ scale: pressed && isValid ? 0.98 : 1 }] },
          ]}
        >
          <Ionicons name="checkmark" size={20} color={palette.white} />
          <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Transaction"}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: "DMSans_700Bold" },
  form: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 16, fontFamily: "DMSans_700Bold", marginBottom: 10 },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  inputGroup: {},
  inputLabel: { fontSize: 12, fontFamily: "DMSans_500Medium", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 6 },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    borderWidth: 1,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipActive: { backgroundColor: palette.emerald + "15", borderColor: palette.emerald },
  chipText: { fontSize: 13, fontFamily: "DMSans_500Medium" },
  chipTextActive: { color: palette.emerald, fontFamily: "DMSans_600SemiBold" },
  calcCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
  },
  calcRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  calcLabel: { fontSize: 14, fontFamily: "DMSans_400Regular" },
  calcValue: { fontSize: 15, fontFamily: "DMSans_600SemiBold" },
  calcDivider: { height: 1, marginVertical: 6 },
  calcLabelBold: { fontSize: 15, fontFamily: "DMSans_700Bold" },
  calcValueBold: { fontSize: 18, fontFamily: "DMSans_700Bold" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: palette.emerald,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  saveBtnText: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: palette.white },
});
