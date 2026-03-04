// components/Navbar.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { loginUser, logoutUser, getLoggedInUser } from '../utils/api';

export default function Navbar() {
  const navigation = useNavigation();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    getLoggedInUser().then(setLoggedInUser);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setLoggedInUser(null);
    navigation.navigate('Landing');
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginUser(username, password);
      setLoggedInUser(username);
      setShowLogin(false);
      setUsername('');
      setPassword('');
      navigation.navigate('Dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
          <Text style={styles.logo}>Kwatcha</Text>
        </TouchableOpacity>

        <View style={styles.navRight}>
          {loggedInUser ? (
            <>
              <Text style={styles.username}>@{loggedInUser}</Text>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={styles.btnOutlineText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnRed} onPress={handleLogout}>
                <Text style={styles.btnText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => { setShowLogin(true); setError(null); }}
              >
                <Text style={styles.btnOutlineText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnBlue}
                onPress={() => navigation.navigate('AccountCreation')}
              >
                <Text style={styles.btnText}>Get Started</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Login Modal */}
      <Modal
        visible={showLogin}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogin(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowLogin(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <Pressable style={styles.modal} onPress={() => {}}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalEyebrow}>Kwatcha</Text>
                  <Text style={styles.modalTitle}>Welcome back</Text>
                  <Text style={styles.modalSubtitle}>Sign in to your trading account</Text>
                </View>
                <TouchableOpacity onPress={() => setShowLogin(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Username */}
              <Text style={styles.fieldLabel}>Username</Text>
              <View style={[styles.inputRow, error && styles.inputRowError]}>
                <Text style={styles.inputPrefix}>@</Text>
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

              {/* Password */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Password</Text>
              <View style={[styles.inputRow, error && styles.inputRowError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(null); }}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.20)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              {/* Error */}
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.btnBlue, styles.submitBtn, loading && { opacity: 0.5 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnText}>Sign In</Text>
                }
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => { setShowLogin(false); navigation.navigate('AccountCreation'); }}>
                  <Text style={styles.footerLink}>Apply here</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: { color: 'rgba(255,255,255,0.40)', fontSize: 12, marginRight: 4 },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  btnOutlineText: { color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: '500' },
  btnBlue: { backgroundColor: colors.blue, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  btnRed: { backgroundColor: '#dc2626', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalWrapper: { width: '100%', maxWidth: 400 },
  modal: {
    backgroundColor: '#0a0a0f',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalEyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2.5,
    color: colors.blueMuted, textTransform: 'uppercase', marginBottom: 4,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 2 },
  closeBtn: { color: 'rgba(255,255,255,0.30)', fontSize: 16 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 2,
    color: 'rgba(147,197,253,0.80)', textTransform: 'uppercase', marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputRowError: { borderColor: 'rgba(239,68,68,0.50)' },
  inputPrefix: { color: 'rgba(255,255,255,0.20)', fontSize: 14, marginRight: 4 },
  input: { flex: 1, color: colors.textPrimary, fontSize: 14, paddingVertical: 11 },
  showPasswordText: { color: 'rgba(255,255,255,0.30)', fontSize: 12, paddingLeft: 8 },
  errorBox: {
    marginTop: 12,
    backgroundColor: colors.redBg,
    borderWidth: 1,
    borderColor: colors.redBorder,
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: colors.red, fontSize: 12 },
  submitBtn: { marginTop: 16, paddingVertical: 13, alignItems: 'center', borderRadius: 10 },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: { color: 'rgba(255,255,255,0.30)', fontSize: 12 },
  footerLink: { color: colors.blue, fontSize: 12, fontWeight: '500' },
});