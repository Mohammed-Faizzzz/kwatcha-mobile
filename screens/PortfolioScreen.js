// screens/PortfolioScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { fetchStocks, getLoggedInUser } from '../utils/api';

const MOCK_HOLDINGS = [
  { ticker: 'AIRTEL', shares: 500,  avgCost: 215.00  },
  { ticker: 'NBM',    shares: 120,  avgCost: 1840.00 },
  { ticker: 'TNM',    shares: 1000, avgCost: 38.50   },
  { ticker: 'FDHB',   shares: 300,  avgCost: 120.00  },
  { ticker: 'PCL',    shares: 80,   avgCost: 3200.00 },
];

const MOCK_ORDERS = [
  { id: 'ORD001', ticker: 'AIRTEL', type: 'buy',  shares: 500,  price: 215.00,  status: 'filled',    date: '2025-01-10' },
  { id: 'ORD002', ticker: 'NBM',    type: 'buy',  shares: 120,  price: 1840.00, status: 'filled',    date: '2025-01-15' },
  { id: 'ORD003', ticker: 'TNM',    type: 'buy',  shares: 1000, price: 38.50,   status: 'filled',    date: '2025-02-03' },
  { id: 'ORD004', ticker: 'TNM',    type: 'sell', shares: 200,  price: 42.00,   status: 'filled',    date: '2025-03-12' },
  { id: 'ORD005', ticker: 'FDHB',   type: 'buy',  shares: 300,  price: 120.00,  status: 'filled',    date: '2025-04-01' },
  { id: 'ORD006', ticker: 'PCL',    type: 'buy',  shares: 80,   price: 3200.00, status: 'filled',    date: '2025-05-20' },
  { id: 'ORD007', ticker: 'ILLOVO', type: 'buy',  shares: 150,  price: 890.00,  status: 'pending',   date: '2026-03-01' },
  { id: 'ORD008', ticker: 'NBM',    type: 'sell', shares: 50,   price: 2100.00, status: 'cancelled', date: '2026-02-14' },
];

const MOCK_CASH = 450000;
const BAR_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ec4899'];

const statusStyle = {
  filled:    { bg: 'rgba(74,222,128,0.10)',  text: '#4ade80', border: 'rgba(74,222,128,0.20)' },
  pending:   { bg: 'rgba(250,204,21,0.10)',  text: '#fbbf24', border: 'rgba(250,204,21,0.20)' },
  cancelled: { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.30)', border: colors.border },
};

export default function PortfolioScreen() {
  const navigation = useNavigation();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings');

  useEffect(() => {
    getLoggedInUser().then((u) => {
      if (!u) navigation.navigate('Landing');
      else setLoggedInUser(u);
    });
    fetchStocks().then((stocks) => {
      if (!stocks) return;
      const map = {};
      Object.entries(stocks).forEach(([t, d]) => { map[t] = { close: Number(d.close) }; });
      setPrices(map);
      setLoadingPrices(false);
    });
  }, []);

  const holdingsWithPnL = MOCK_HOLDINGS.map(h => {
    const currentPrice = prices[h.ticker]?.close ?? h.avgCost;
    const currentValue = currentPrice * h.shares;
    const costBasis = h.avgCost * h.shares;
    const pnl = currentValue - costBasis;
    const pnlPct = (pnl / costBasis) * 100;
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPct };
  });

  const totalInvested = holdingsWithPnL.reduce((s, h) => s + h.costBasis, 0);
  const totalValue = holdingsWithPnL.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const totalPortfolio = totalValue + MOCK_CASH;

  const fmt = (n) => n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtC = (n) => Math.abs(n) >= 1e6 ? `MK ${(n / 1e6).toFixed(2)}M` : `MK ${fmt(n)}`;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={styles.identityBlock}>
          <Text style={styles.eyebrow}>{loggedInUser ? `@${loggedInUser}` : 'Account'}</Text>
          <Text style={styles.pageTitle}>My Portfolio</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryGrid}>
          {[
            { label: 'Portfolio Value', value: fmtC(totalPortfolio), sub: 'Investments + Cash', color: '#fff' },
            { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}${fmtC(totalPnL)}`, sub: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}% all time`, color: totalPnL >= 0 ? colors.green : colors.red },
            { label: 'Invested', value: fmtC(totalValue), sub: `Cost: ${fmtC(totalInvested)}`, color: '#fff' },
            { label: 'Cash', value: fmtC(MOCK_CASH), sub: 'Ready to invest', color: '#93c5fd' },
          ].map(({ label, value, sub, color }) => (
            <View key={label} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={[styles.summaryValue, { color }]}>{value}</Text>
              <Text style={styles.summarySub}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Allocation bar */}
        <View style={styles.allocBox}>
          <Text style={styles.allocTitle}>Allocation</Text>
          <View style={styles.allocBar}>
            {holdingsWithPnL.map((h, i) => (
              <View
                key={h.ticker}
                style={[styles.allocSegment, {
                  width: `${(h.currentValue / totalPortfolio) * 100}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                }]}
              />
            ))}
            <View style={[styles.allocSegment, {
              width: `${(MOCK_CASH / totalPortfolio) * 100}%`,
              backgroundColor: 'rgba(255,255,255,0.20)',
            }]} />
          </View>
          <View style={styles.allocLegend}>
            {holdingsWithPnL.map((h, i) => (
              <View key={h.ticker} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]} />
                <Text style={styles.legendText}>{h.ticker} {((h.currentValue / totalPortfolio) * 100).toFixed(1)}%</Text>
              </View>
            ))}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.20)' }]} />
              <Text style={styles.legendText}>Cash {((MOCK_CASH / totalPortfolio) * 100).toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['holdings', 'orders'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Holdings */}
        {activeTab === 'holdings' && (
          <View style={styles.tableCard}>
            {loadingPrices ? (
              <ActivityIndicator color={colors.blue} style={{ margin: 20 }} />
            ) : holdingsWithPnL.map(h => (
              <TouchableOpacity
                key={h.ticker} style={styles.holdingRow}
                onPress={() => navigation.navigate('StockDetail', { ticker: h.ticker })}
              >
                <View style={styles.holdingLeft}>
                  <Text style={styles.holdingTicker}>{h.ticker}</Text>
                  <Text style={styles.holdingShares}>{h.shares.toLocaleString()} shares</Text>
                </View>
                <View style={styles.holdingMid}>
                  <Text style={styles.holdingCurrent}>MK {fmt(h.currentPrice)}</Text>
                  <Text style={styles.holdingAvg}>avg MK {fmt(h.avgCost)}</Text>
                </View>
                <View style={styles.holdingRight}>
                  <Text style={[styles.holdingPnL, { color: h.pnl >= 0 ? colors.green : colors.red }]}>
                    {h.pnl >= 0 ? '+' : ''}{fmtC(h.pnl)}
                  </Text>
                  <Text style={[styles.holdingPct, { color: h.pnlPct >= 0 ? 'rgba(74,222,128,0.70)' : 'rgba(248,113,113,0.70)' }]}>
                    {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={{ flex: 1 }} />
              <View style={styles.holdingRight}>
                <Text style={[styles.holdingPnL, { color: totalPnL >= 0 ? colors.green : colors.red }]}>
                  {totalPnL >= 0 ? '+' : ''}{fmtC(totalPnL)}
                </Text>
                <Text style={[styles.holdingPct, { color: totalPnLPct >= 0 ? 'rgba(74,222,128,0.70)' : 'rgba(248,113,113,0.70)' }]}>
                  {totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <View style={styles.tableCard}>
            {[...MOCK_ORDERS]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(order => {
                const s = statusStyle[order.status];
                return (
                  <View key={order.id} style={styles.orderRow}>
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderDate}>{order.date}</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('StockDetail', { ticker: order.ticker })}>
                        <Text style={styles.orderTicker}>{order.ticker}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.orderMid}>
                      <Text style={[styles.orderType, { color: order.type === 'buy' ? colors.green : colors.red }]}>
                        {order.type.toUpperCase()}
                      </Text>
                      <Text style={styles.orderShares}>{order.shares.toLocaleString()} shares</Text>
                      <Text style={styles.orderPrice}>MK {fmt(order.price)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                      <Text style={[styles.statusText, { color: s.text }]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* Demo notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoIcon}>⚠️</Text>
          <Text style={styles.demoText}>
            Portfolio data is currently demo data. Real holdings and orders will populate here once the database is connected.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backText: { color: colors.blue, fontSize: 14 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  identityBlock: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 8 },
  eyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 3,
    color: colors.blueMuted, textTransform: 'uppercase', marginBottom: 6,
  },
  pageTitle: { fontSize: 30, fontWeight: '700', color: '#fff' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginTop: 16, marginBottom: 16 },
  summaryCard: {
    width: '47%', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16,
  },
  summaryLabel: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.5,
    color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8,
  },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  summarySub: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  allocBox: {
    marginHorizontal: 16, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 16,
  },
  allocTitle: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.5,
    color: colors.textMuted, textTransform: 'uppercase', marginBottom: 12,
  },
  allocBar: { flexDirection: 'row', height: 10, borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  allocSegment: { height: '100%' },
  allocLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.40)', fontSize: 11 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16,
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderRadius: 12, padding: 4, marginBottom: 12, alignSelf: 'flex-start',
  },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 9 },
  tabActive: { backgroundColor: colors.blue },
  tabText: { color: 'rgba(255,255,255,0.40)', fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  tableCard: {
    marginHorizontal: 16, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden', marginBottom: 16,
  },
  holdingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  holdingLeft: { flex: 2 },
  holdingTicker: { color: '#fff', fontWeight: '600', fontSize: 14 },
  holdingShares: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  holdingMid: { flex: 2, alignItems: 'center' },
  holdingCurrent: { color: '#fff', fontSize: 13, fontWeight: '500' },
  holdingAvg: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  holdingRight: { flex: 2, alignItems: 'flex-end' },
  holdingPnL: { fontSize: 13, fontWeight: '700' },
  holdingPct: { fontSize: 11, marginTop: 2 },
  totalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' },
  orderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  orderLeft: { flex: 1 },
  orderDate: { color: colors.textMuted, fontSize: 11 },
  orderTicker: { color: '#fff', fontWeight: '600', fontSize: 14, marginTop: 2 },
  orderMid: { flex: 2 },
  orderType: { fontSize: 13, fontWeight: '700' },
  orderShares: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  orderPrice: { color: 'rgba(255,255,255,0.40)', fontSize: 11 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '600' },
  demoNotice: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: 16, padding: 14,
    backgroundColor: 'rgba(234,179,8,0.05)',
    borderWidth: 1, borderColor: 'rgba(234,179,8,0.15)',
    borderRadius: 14, gap: 10,
  },
  demoIcon: { fontSize: 14 },
  demoText: { flex: 1, color: 'rgba(250,204,21,0.60)', fontSize: 12, lineHeight: 18 },
});