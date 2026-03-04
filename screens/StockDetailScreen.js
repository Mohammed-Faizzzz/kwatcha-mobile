// screens/StockDetailScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { fetchStocks } from '../utils/api';

function MetricCard({ label, value }) {
  return (
    <View style={metricStyles.card}>
      <Text style={metricStyles.label}>{label}</Text>
      <Text style={metricStyles.value}>{value}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    width: '47%', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  label: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.5,
    color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6,
  },
  value: { fontSize: 17, fontWeight: '700', color: '#fff' },
});

export default function StockDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { ticker } = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks().then((stocks) => {
      if (stocks && stocks[ticker]) setData(stocks[ticker]);
      setLoading(false);
    });
  }, [ticker]);

  const change = data ? parseFloat(data.change) || 0 : 0;
  const isPositive = change >= 0;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.blue} size="large" />
        </View>
      ) : !data ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No data found for {ticker}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <Text style={styles.exchange}>Malawi Stock Exchange</Text>
            <Text style={styles.ticker}>{ticker}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>MK {Number(data.close).toLocaleString()}</Text>
              <View style={[styles.changeBadge, isPositive ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
                <Text style={[styles.changeBadgeText, { color: isPositive ? colors.green : colors.red }]}>
                  {isPositive ? '+' : ''}{change.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard label="Last Close" value={`MK ${Number(data.close).toLocaleString()}`} />
            <MetricCard label="Opening" value={`MK ${Number(data.open).toLocaleString()}`} />
            <MetricCard label="Volume" value={Number(data.volume).toLocaleString()} />
            <MetricCard label="Turnover" value={`MK ${Number(data.turnover).toLocaleString()}`} />
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Company Insights</Text>
            <Text style={styles.insightBody}>
              {ticker} is showing a volume of {Number(data.volume).toLocaleString()} shares traded.
              Tap below to view the official listing on the MSE website.
            </Text>
            {data.url ? (
              <TouchableOpacity style={styles.insightLink} onPress={() => Linking.openURL(data.url)}>
                <Text style={styles.insightLinkText}>Official Company Profile →</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { color: colors.blue, fontSize: 14 },
  scroll: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  identity: { marginBottom: 28 },
  exchange: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  ticker: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  price: { fontSize: 28, fontWeight: '700', color: '#fff' },
  changeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, borderWidth: 1 },
  changeBadgeGreen: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
  changeBadgeRed: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  changeBadgeText: { fontSize: 13, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  insightBox: {
    backgroundColor: 'rgba(29,78,216,0.08)', borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.20)', borderRadius: 18, padding: 20, marginTop: 8,
  },
  insightTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(147,197,253,0.90)', marginBottom: 10 },
  insightBody: { fontSize: 13, color: 'rgba(147,197,253,0.70)', lineHeight: 20, marginBottom: 14 },
  insightLink: { borderTopWidth: 1, borderTopColor: 'rgba(59,130,246,0.20)', paddingTop: 12 },
  insightLinkText: { color: colors.blue, fontSize: 13, fontWeight: '600' },
});