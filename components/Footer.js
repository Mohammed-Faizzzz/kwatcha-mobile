// components/Footer.js
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© {new Date().getFullYear()} Kwatcha</Text>
      <Text style={styles.text}>Data from Malawi Stock Exchange</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  text: { color: 'rgba(255,255,255,0.40)', fontSize: 12 },
});