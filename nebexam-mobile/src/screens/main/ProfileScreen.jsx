import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import { colors, TIER_CONFIG, radius, shadow } from '../../theme';

function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';
  const tier = TIER_CONFIG[user?.subscription_tier] ?? TIER_CONFIG.free;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await logout(); } catch { /* always clear locally */ }
          finally { await clearSession(); }
        },
      },
    ]);
  };

  const rows = [
    { label: 'Email',    value: user?.email },
    { label: 'Phone',    value: user?.phone },
    { label: 'District', value: user?.district },
    { label: 'Class',    value: user?.level ? `Class ${user.level}` : null },
    { label: 'Stream',   value: user?.stream },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Top banner */}
      <View style={styles.topBanner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tier.badgeBg }]}>
          <View style={[styles.tierDot, { backgroundColor: tier.dotColor }]} />
          <Text style={[styles.tierLabel, { color: tier.badgeText }]}>{tier.label}</Text>
        </View>
      </View>

      {/* Account info */}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <InfoRow key={row.label} label={row.label} value={row.value} last={i === rows.length - 1} />
        ))}
      </View>

      {/* Referral */}
      {user?.referral_code && (
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>Referral Code</Text>
          <Text style={styles.referralCode}>{user.referral_code}</Text>
          <Text style={styles.referralSub}>Earn 10% commission on every successful referral</Text>
          {user?.referral_balance > 0 && (
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>Rs. {user.referral_balance}</Text>
            </View>
          )}
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
        onPress={handleLogout}
        disabled={loggingOut}
        activeOpacity={0.8}
      >
        {loggingOut
          ? <ActivityIndicator color={colors.danger} />
          : <Text style={styles.logoutText}>Log Out</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },

  topBanner: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: 32, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '900', color: colors.primary },
  userName: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  tierLabel: { fontSize: 11, fontWeight: '700' },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 16,
    ...shadow.sm,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text, maxWidth: '60%', textAlign: 'right' },

  referralCard: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: 16,
    borderRadius: radius.lg,
    padding: 16, alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(28,163,253,0.15)',
  },
  referralTitle: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 6 },
  referralCode: { fontSize: 26, fontWeight: '900', color: colors.primary, letterSpacing: 3, marginBottom: 6 },
  referralSub: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  balanceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 10, backgroundColor: colors.white,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
  },
  balanceLabel: { fontSize: 12, color: colors.textSecondary },
  balanceValue: { fontSize: 15, fontWeight: '800', color: colors.primary },

  logoutBtn: {
    marginHorizontal: 16,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.danger,
    backgroundColor: colors.white,
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
