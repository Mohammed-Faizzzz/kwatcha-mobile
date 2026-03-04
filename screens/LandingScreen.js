// screens/LandingScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { colors } from '../constants/theme';
import { fetchStocks, calcMarketStatus } from '../utils/api';

export default function LandingScreen() {
  const navigation = useNavigation();
  const [stocks, setStocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const marketStatus = calcMarketStatus();

  useEffect(() => {
    fetchStocks().then((s) => { setStocks(s); setLoading(false); });
    const interval = setInterval(() => fetchStocks().then(setStocks), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Malawi Stock Exchange</Text>
          <Text style={styles.heroTitle}>
            Invest in Malawi's{'\n'}
            <Text style={styles.heroTitleMuted}>Stock Market</Text>
          </Text>
          <Text style={styles.heroSub}>
            Track prices, analyze companies, and understand the Malawi Stock Exchange — all in one clean, modern platform.
          </Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.btnBlue} onPress={() => navigation.navigate('Market')}>
              <Text style={styles.btnBlueText}>Explore Market →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('AccountCreation')}>
              <Text style={styles.btnOutlineText}>Open Account</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pills}>
            {[
              { label: 'Exchange', value: 'MSE' },
              { label: 'Currency', value: 'MWK' },
              { label: 'Timezone', value: 'UTC+2' },
            ].map(({ label, value }) => (
              <View key={label} style={styles.pill}>
                <Text style={styles.pillLabel}>{label}</Text>
                <Text style={styles.pillValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>Market Snapshot</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Snapshot cards */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📈</Text>
              <View style={[styles.statusBadge, marketStatus === 'Open' ? styles.statusOpen : styles.statusClosed]}>
                <Text style={[styles.statusText, { color: marketStatus === 'Open' ? colors.green : colors.red }]}>
                  {marketStatus}
                </Text>
              </View>
            </View>
            <Text style={styles.cardLabel}>Market Status</Text>
            <Text style={styles.cardValue}>{marketStatus}</Text>
            <Text style={styles.cardMeta}>Mon–Fri · 09:00–17:00 CAT</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardLabel}>Total Turnover</Text>
              <Text style={styles.cardValue}>MK 1.2B</Text>
              <Text style={styles.cardMeta}>Latest session</Text>
            </View>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.cardIcon}>🏢</Text>
              <Text style={styles.cardLabel}>Listed</Text>
              <Text style={styles.cardValue}>{stocks ? Object.keys(stocks).length : '—'}</Text>
              <Text style={styles.cardMeta}>Active on MSE</Text>
            </View>
          </View>
        </View>

        {/* Companies preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Listed Companies</Text>
              <Text style={styles.sectionTitle}>Browse the Market</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Market')}>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.blue} size="large" style={{ marginTop: 40 }} />
          ) : (
            stocks && Object.entries(stocks).slice(0, 6).map(([name, details]) => {
              const change = parseFloat(details.change) || 0;
              const isPositive = change >= 0;
              return (
                <TouchableOpacity
                  key={name}
                  style={styles.stockCard}
                  onPress={() => navigation.navigate('StockDetail', { ticker: name })}
                  activeOpacity={0.75}
                >
                  <View style={styles.stockCardTop}>
                    <Text style={styles.stockExchange}>MSE</Text>
                    <View style={[styles.changeBadge, isPositive ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
                      <Text style={[styles.changeBadgeText, { color: isPositive ? colors.green : colors.red }]}>
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.stockName}>{name}</Text>
                  <Text style={styles.stockPrice}>MK {Number(details.close).toLocaleString()}</Text>
                  <View style={styles.stockFooter}>
                    <Text style={styles.stockVol}>Vol: {Number(details.volume || 0).toLocaleString()}</Text>
                    <Text style={styles.viewLink}>View →</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 24 },
  hero: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  eyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 3,
    color: colors.blueMuted, textTransform: 'uppercase', marginBottom: 12,
  },
  heroTitle: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, lineHeight: 44, marginBottom: 14 },
  heroTitleMuted: { color: 'rgba(255,255,255,0.30)' },
  heroSub: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  heroBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  btnBlue: { backgroundColor: colors.blue, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  btnBlueText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnOutline: {
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14,
  },
  btnOutlineText: { color: 'rgba(255,255,255,0.80)', fontWeight: '500', fontSize: 14 },
  pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: colors.border, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6,
  },
  pillLabel: { color: 'rgba(255,255,255,0.30)', fontSize: 11 },
  pillValue: { color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(59,130,246,0.20)' },
  dividerLabel: {
    marginHorizontal: 12, fontSize: 10, fontWeight: '700',
    letterSpacing: 2, color: 'rgba(96,165,250,0.80)', textTransform: 'uppercase',
  },
  section: { paddingHorizontal: 16, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  viewAll: { color: colors.blue, fontSize: 13, fontWeight: '500' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderRadius: 20, padding: 20, marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardIcon: { fontSize: 18 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100, borderWidth: 1 },
  statusOpen: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
  statusClosed: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2,
    color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4,
  },
  cardValue: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  cardMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  stockCard: {
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderRadius: 20, padding: 20, marginBottom: 12,
  },
  stockCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stockExchange: { fontSize: 10, color: colors.textMuted, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  changeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100, borderWidth: 1 },
  changeBadgeGreen: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
  changeBadgeRed: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  changeBadgeText: { fontSize: 11, fontWeight: '700' },
  stockName: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  stockPrice: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.90)', marginBottom: 14 },
  stockFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  stockVol: { fontSize: 12, color: colors.textMuted },
  viewLink: { fontSize: 12, color: 'rgba(96,165,250,0.60)' },
});