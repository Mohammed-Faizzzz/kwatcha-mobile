// components/StockRow.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function StockRow({ symbol, price, change, onPress }) {
  const changeNum = Number(change);
  const isPositive = changeNum >= 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.avatar, isPositive ? styles.avatarGreen : styles.avatarRed]}>
        <Text style={styles.avatarText}>{symbol.substring(0, 2)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.meta}>MSE • Malawi</Text>
      </View>

      <View style={styles.priceBlock}>
        <Text style={styles.price}>
          <Text style={styles.priceCurrency}>MK </Text>
          {Number(price).toLocaleString()}
        </Text>
        <View style={[styles.badge, isPositive ? styles.badgeGreen : styles.badgeRed]}>
          <Text style={[styles.badgeText, { color: isPositive ? colors.green : colors.red }]}>
            {isPositive ? '+' : ''}{changeNum.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    marginRight: 12,
  },
  avatarGreen: { backgroundColor: 'rgba(5,150,105,0.20)' },
  avatarRed: { backgroundColor: 'rgba(239,68,68,0.20)' },
  avatarText: { color: 'rgba(255,255,255,0.70)', fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  symbol: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  meta: {
    color: 'rgba(255,255,255,0.40)', fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 2,
  },
  priceBlock: { alignItems: 'flex-end' },
  price: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  priceCurrency: { color: 'rgba(255,255,255,0.40)', fontWeight: '500', fontSize: 12 },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  badgeGreen: { backgroundColor: 'rgba(74,222,128,0.15)' },
  badgeRed: { backgroundColor: 'rgba(239,68,68,0.15)' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});