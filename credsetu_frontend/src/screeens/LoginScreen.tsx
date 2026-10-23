import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function LoginScreen({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverOtpHint, setServerOtpHint] = useState<string | null>(null);

  async function sendOtp() {
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await api.sendOtp(cleanPhone);
      setStep('otp');
      if (res.data?.mockOtp) {
        setServerOtpHint(res.data.mockOtp);
      }
    } catch (err: any) {
      console.error('Send OTP error', err);
      const msg = err.response?.data?.error || 'Failed to send OTP. Is the server running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await api.verifyOtp(phone.trim(), otp.trim());

      if (res.data?.token) {
        await AsyncStorage.setItem('credsetu_token', res.data.token);
        await AsyncStorage.setItem('credsetu_phone', phone.trim());
        onLogin(phone.trim());
      } else {
        setError('Verification failed');
      }
    } catch (err: any) {
      console.error('Verify OTP error', err);
      const msg = err.response?.data?.error || 'Wrong OTP. Check server log or use 1234';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniLedger</Text>
      <Text style={styles.subtitle}>Money Borrowed / Lent Tracker</Text>

      {step === 'phone' ? (
        <View style={styles.card}>
          <Text style={styles.label}>Enter your mobile number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit phone number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
          />
          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={sendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>OTP sent to +91 {phone}</Text>
          <Text style={styles.hint}>
            Check backend console logs for OTP{serverOtpHint ? ` (or use: ${serverOtpHint})` : ' (or 1234)'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit OTP"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
          />
          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Verify & Login</Text>
            )}
          </Pressable>

          <Pressable onPress={() => { setStep('phone'); setOtp(''); setError(''); }}>
            <Text style={styles.link}>Change phone number</Text>
          </Pressable>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  btn: {
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
});
