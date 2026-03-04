// screens/MarketScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StockRow from '../components/StockRow';
import { colors } from '../constants/theme';
import { fetchStocks } from '../utils/api';

export default function MarketScreen() {
  const navigation = useNavigation();
  const [stocks, setStocks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks().then((s) => { setStocks(s); setLoading(false); });
    const iv = setInterval(() => fetchStocks().then(setStocks), 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const entries = stocks ? Object.entries(stocks) : [];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Market</Text>
        <Text style={styles.count}>{entries.length} stocks</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.blue} size="large" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={([name]) => name}
          contentContainerStyle={styles.list}
          renderItem={({ item: [name, d] }) => (
            <StockRow
              symbol={name}
              price={d.close}
              change={d.change}
              onPress={() => navigation.navigate('StockDetail', { ticker: name })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backText: { color: colors.blue, fontSize: 14, marginRight: 12 },
  title: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  count: { color: colors.textMuted, fontSize: 12 },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});