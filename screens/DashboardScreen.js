// screens/DashboardScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { fetchStocks, calcMarketStatus, logoutUser, getLoggedInUser } from '../utils/api';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [stocks, setStocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const marketStatus = calcMarketStatus();

  useEffect(() => {
    getLoggedInUser().then(setLoggedInUser);
    fetchStocks().then((s) => { setStocks(s); setLoading(false); });
  }, []);

  const gainers = stocks
    ? Object.entries(stocks).filter(([, d]) => parseFloat(d.change) > 0)
        .sort((a, b) => parseFloat(b[1].change) - parseFloat(a[1].change)).slice(0, 3)
    : [];

  const losers = stocks
    ? Object.entries(stocks).filter(([, d]) => parseFloat(d.change) < 0)
        .sort((a, b) => parseFloat(a[1].change) - parseFloat(b[1].change)).slice(0, 3)
    : [];

  const handleSignOut = async () => {
    await logoutUser();
    navigation.navigate('Landing');
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Kwatcha</Text>
        <View style={styles.headerRight}>
          <View style={styles.marketIndicator}>
            <View style={[styles.dot, { backgroundColor: marketStatus === 'Open' ? colors.green : colors.red }]} />
            <Text style={styles.marketLabel}>Market {marketStatus}</Text>
          </View>
          {loggedInUser && <Text style={styles.username}>@{loggedInUser}</Text>}
          <TouchableOpacity style={styles.btnSmall} onPress={() => navigation.navigate('Portfolio')}>
            <Text style={styles.btnSmallText}>Portfolio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSmall, styles.btnSmallRed]} onPress={handleSignOut}>
            <Text style={styles.btnSmallText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.eyebrow}>Dashboard</Text>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSub}>Here's what's happening on the Malawi Stock Exchange today.</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Market Status', value: marketStatus, color: marketStatus === 'Open' ? colors.green : colors.red },
            { label: 'Listed Stocks', value: stocks ? String(Object.keys(stocks).length) : '—', color: '#fff' },
            { label: 'Gainers', value: String(gainers.length), color: colors.green },
            { label: 'Losers', value: String(losers.length), color: colors.red },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Gainers & Losers */}
        <View style={styles.glGrid}>
          <View style={styles.glCard}>
            <View style={styles.glHeader}>
              <View style={[styles.dot, { backgroundColor: colors.green }]} />
              <Text style={styles.glTitle}>Top Gainers</Text>
            </View>
            {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 12 }} /> :
              gainers.length === 0 ? <Text style={styles.emptyText}>No gainers today</Text> :
              gainers.map(([name, d]) => (
                <TouchableOpacity key={name} style={styles.glRow} onPress={() => navigation.navigate('StockDetail', { ticker: name })}>
                  <View>
                    <Text style={styles.glName}>{name}</Text>
                    <Text style={styles.glPrice}>MK {Number(d.close).toLocaleString()}</Text>
                  </View>
                  <Text style={[styles.glChange, { color: colors.green }]}>+{parseFloat(d.change).toFixed(2)}%</Text>
                </TouchableOpacity>
              ))
            }
          </View>

          <View style={styles.glCard}>
            <View style={styles.glHeader}>
              <View style={[styles.dot, { backgroundColor: colors.red }]} />
              <Text style={styles.glTitle}>Top Losers</Text>
            </View>
            {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 12 }} /> :
              losers.length === 0 ? <Text style={styles.emptyText}>No losers today</Text> :
              losers.map(([name, d]) => (
                <TouchableOpacity key={name} style={styles.glRow} onPress={() => navigation.navigate('StockDetail', { ticker: name })}>
                  <View>
                    <Text style={styles.glName}>{name}</Text>
                    <Text style={styles.glPrice}>MK {Number(d.close).toLocaleString()}</Text>
                  </View>
                  <Text style={[styles.glChange, { color: colors.red }]}>{parseFloat(d.change).toFixed(2)}%</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>

        {/* All stocks table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>All Listed Stocks</Text>
            <Text style={styles.tableCount}>{stocks ? Object.keys(stocks).length : '—'} companies</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[styles.colHeader, { flex: 2 }]}>Company</Text>
            <Text style={[styles.colHeader, { textAlign: 'right' }]}>Close</Text>
            <Text style={[styles.colHeader, { textAlign: 'right' }]}>Vol</Text>
            <Text style={[styles.colHeader, { textAlign: 'right' }]}>Chg</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.blue} style={{ margin: 20 }} />
          ) : (
            stocks && Object.entries(stocks).map(([name, d]) => {
              const change = parseFloat(d.change) || 0;
              const isPos = change >= 0;
              return (
                <TouchableOpacity
                  key={name} style={styles.tableRow}
                  onPress={() => navigation.navigate('StockDetail', { ticker: name })}
                >
                  <Text style={[styles.tableName, { flex: 2 }]}>{name}</Text>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>MK {Number(d.close).toLocaleString()}</Text>
                  <Text style={[styles.tableCellMuted, { textAlign: 'right' }]}>{Number(d.volume || 0).toLocaleString()}</Text>
                  <Text style={[styles.tableChange, { textAlign: 'right', color: isPos ? colors.green : colors.red }]}>
                    {isPos ? '+' : ''}{change.toFixed(2)}%
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logo: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  marketIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  marketLabel: { color: 'rgba(255,255,255,0.40)', fontSize: 11 },
  username: { color: 'rgba(255,255,255,0.30)', fontSize: 11 },
  btnSmall: {
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  btnSmallRed: { backgroundColor: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.30)' },
  btnSmallText: { color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: '500' },
  welcomeBlock: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20 },
  eyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 3,
    color: colors.blueMuted, textTransform: 'uppercase', marginBottom: 6,
  },
  welcomeTitle: { fontSize: 30, fontWeight: '700', color: '#fff' },
  welcomeSub: { fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 6, lineHeight: 19 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statCard: {
    width: '47%', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18,
  },
  statLabel: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.5,
    color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  glGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 20 },
  glCard: {
    flex: 1, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16,
  },
  glHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 14 },
  glTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)' },
  glRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  glName: { color: '#fff', fontWeight: '500', fontSize: 13 },
  glPrice: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  glChange: { fontWeight: '700', fontSize: 13 },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  tableCard: {
    marginHorizontal: 16, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 16, overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tableTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)' },
  tableCount: { color: colors.textMuted, fontSize: 11 },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  colHeader: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.textMuted, flex: 1 },
  tableName: { color: '#fff', fontSize: 13, fontWeight: '500' },
  tableCell: { color: 'rgba(255,255,255,0.70)', fontSize: 13, flex: 1 },
  tableCellMuted: { color: 'rgba(255,255,255,0.40)', fontSize: 13, flex: 1 },
  tableChange: { fontSize: 13, fontWeight: '600', flex: 1 },
});