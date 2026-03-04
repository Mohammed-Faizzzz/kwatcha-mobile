// screens/AccountCreationScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { API_BASE } from '../utils/api';

export default function AccountCreationScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.error || 'Registration failed.');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.eyebrow}>Kwatcha</Text>
            <Text style={styles.title}>Open an Account</Text>
            <Text style={styles.subtitle}>Join the Malawi Stock Exchange platform</Text>

            {success ? (
              <View style={{ gap: 12 }}>
                <Text style={styles.successTitle}>✓ Account created!</Text>
                <Text style={styles.successText}>
                  Your application has been submitted. You'll be notified when your account is approved.
                </Text>
                <TouchableOpacity style={styles.btnBlue} onPress={() => navigation.goBack()}>
                  <Text style={styles.btnText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Username</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.prefix}>@</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={(v) => { setUsername(v); setError(null); }}
                    placeholder="your_username"
                    placeholderTextColor="rgba(255,255,255,0.20)"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Email</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setError(null); }}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.20)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={(v) => { setPassword(v); setError(null); }}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.20)"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.btnBlue, { marginTop: 20 }, loading && { opacity: 0.5 }]}
                  onPress={handleCreate}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.btnText}>Create Account</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, paddingBottom: 60 },
  back: { marginBottom: 20 },
  backText: { color: colors.blue, fontSize: 14 },
  card: {
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderRadius: 22, padding: 28,
  },
  eyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.5,
    color: colors.blueMuted, textTransform: 'uppercase', marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2,
    color: 'rgba(147,197,253,0.80)', textTransform: 'uppercase', marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12,
  },
  prefix: { color: 'rgba(255,255,255,0.20)', fontSize: 14, marginRight: 4 },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 11 },
  errorBox: {
    marginTop: 14, backgroundColor: colors.redBg,
    borderWidth: 1, borderColor: colors.redBorder,
    borderRadius: 10, padding: 12,
  },
  errorText: { color: colors.red, fontSize: 12 },
  btnBlue: { backgroundColor: colors.blue, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  successTitle: { color: colors.green, fontSize: 20, fontWeight: '700' },
  successText: { color: 'rgba(255,255,255,0.50)', fontSize: 13, lineHeight: 20 },
});