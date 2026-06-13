import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { register } from '../../api/auth';

const LEVELS = ['10', '11', '12'];
const STREAMS = ['science', 'management'];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    level: '11',
    stream: 'science',
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Name, email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      // Backend may require email verification
      navigation.navigate('VerifyEmail', { email: form.email });
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.email?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        'Registration failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>

        {[
          { key: 'name', label: 'Full Name', placeholder: 'Ram Sharma', type: 'default' },
          { key: 'email', label: 'Email', placeholder: 'ram@example.com', type: 'email-address' },
          { key: 'phone', label: 'Phone (optional)', placeholder: '98XXXXXXXX', type: 'phone-pad' },
          { key: 'password', label: 'Password', placeholder: 'Min 8 characters', secure: true },
        ].map(({ key, label, placeholder, type, secure }) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={(v) => set(key, v)}
              placeholder={placeholder}
              keyboardType={type || 'default'}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
              secureTextEntry={!!secure}
            />
          </View>
        ))}

        <Text style={styles.label}>Class Level</Text>
        <View style={styles.chips}>
          {LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.chip, form.level === l && styles.chipActive]}
              onPress={() => set('level', l)}
            >
              <Text style={[styles.chipText, form.level === l && styles.chipTextActive]}>
                Class {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Stream</Text>
        <View style={styles.chips}>
          {STREAMS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, form.stream === s && styles.chipActive]}
              onPress={() => set('stream', s)}
            >
              <Text style={[styles.chipText, form.stream === s && styles.chipTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.rowText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inner: { paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center' },
  rowText: { fontSize: 14, color: '#6B7280' },
  link: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
});
