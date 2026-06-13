import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { getSubjects } from '../../api/content';
import { colors, radius, shadow } from '../../theme';

const LEVELS = ['8', '9', '10', '11', '12'];

const LEVEL_ACCENT = { '10': '#f59e0b', '11': '#8b5cf6', '12': '#1CA3FD' };
const LEVEL_ICON_BG = { '10': '#FFFBEB', '11': '#F5F3FF', '12': '#EEF6FF' };

const STREAM_PILL = {
  science:    { bg: '#DBEAFE', text: '#1D4ED8' },
  management: { bg: '#D1FAE5', text: '#065F46' },
};

function SubjectCard({ subject, onPress }) {
  const accent   = LEVEL_ACCENT[subject.class_level]  ?? colors.primary;
  const iconBg   = LEVEL_ICON_BG[subject.class_level] ?? '#EEF6FF';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Top accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: accent }]} />

      <View style={styles.cardBody}>
        {/* Icon row */}
        <View style={styles.cardIconRow}>
          <View style={[styles.bookIconWrap, { backgroundColor: iconBg }]}>
            <Ionicons name="book-outline" size={18} color={accent} />
          </View>
          {subject.subject_code ? (
            <View style={styles.codeWrap}>
              <Text style={styles.codeText}>{subject.subject_code}</Text>
            </View>
          ) : null}
        </View>

        {/* Name */}
        <Text style={styles.cardName} numberOfLines={2}>{subject.name}</Text>

        {/* Stream pills */}
        {subject.streams?.length > 0 && (
          <View style={styles.streamRow}>
            {subject.streams.map((s) => {
              const pill = STREAM_PILL[s] ?? { bg: '#F1F5F9', text: '#64748B' };
              return (
                <View key={s} style={[styles.streamPill, { backgroundColor: pill.bg }]}>
                  <Text style={[styles.streamText, { color: pill.text }]}>{s}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardClass}>Class {subject.class_level}</Text>
          <View style={styles.studyNow}>
            <Text style={[styles.studyNowText, { color: accent }]}>Study now</Text>
            <Ionicons name="arrow-forward" size={12} color={accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [level, setLevel]   = useState(String(user?.level ?? '12'));
  const [stream, setStream] = useState(user?.stream ?? 'science');
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isStreamed = level === '11' || level === '12';

  const loadSubjects = useCallback(async (lvl) => {
    setLoading(true);
    try {
      const res = await getSubjects({ class_level: lvl });
      setSubjects(res.data.results ?? res.data);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadSubjects(level); }, [level]);

  const onRefresh = () => { setRefreshing(true); loadSubjects(level); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Filter by stream for 11/12
  const displayed = isStreamed
    ? subjects.filter((s) => {
        if (!s.streams?.length) return true;
        return s.streams.includes(stream);
      })
    : subjects;

  const isFree = !user?.subscription_tier || user.subscription_tier === 'free';

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* ── Greeting header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.greetSmall}>{greeting}</Text>
            <Text style={styles.greetName}>{user?.name?.split(' ')[0] ?? 'Student'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {isFree ? (
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
              <Ionicons name="flash" size={12} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{user?.subscription_tier?.replace('month', 'mo')}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.dashboardLink}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.dashboardLinkText}>Dashboard</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Class selector ── */}
      <View style={styles.classRow}>
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.classChip, level === l && styles.classChipActive]}
            onPress={() => setLevel(l)}
            activeOpacity={0.7}
          >
            <Text style={[styles.classChipText, level === l && styles.classChipTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Stream selector (11/12 only) ── */}
      {isStreamed && (
        <View style={styles.streamSelector}>
          {['science', 'management'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.streamBtn,
                s === 'science'
                  ? (stream === s ? styles.streamBtnScienceActive : styles.streamBtnScienceInactive)
                  : (stream === s ? styles.streamBtnMgmtActive : styles.streamBtnMgmtInactive),
              ]}
              onPress={() => setStream(s)}
              activeOpacity={0.8}
            >
              <View style={[styles.streamDot, {
                backgroundColor: s === 'science' ? '#3B82F6' : '#10B981',
                opacity: stream === s ? 1 : 0.4,
              }]} />
              <Text style={[
                styles.streamBtnText,
                s === 'science'
                  ? (stream === s ? { color: '#1D4ED8', fontWeight: '700' } : { color: '#64748B' })
                  : (stream === s ? { color: '#065F46', fontWeight: '700' } : { color: '#64748B' }),
              ]}>
                {s === 'science' ? 'Science' : 'Management'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Section header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Class {level} Subjects
          {isStreamed ? (
            <Text style={{ color: colors.textMuted }}> · {stream === 'science' ? 'Science' : 'Management'}</Text>
          ) : null}
        </Text>
        {displayed.length > 0 && (
          <Text style={styles.sectionCount}>{displayed.length}</Text>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Subjects')} style={styles.seeAll}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Subject cards ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : displayed.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No subjects available yet.</Text>
        </View>
      ) : (
        displayed.map((s) => (
          <SubjectCard
            key={s.slug}
            subject={s}
            onPress={() => navigation.navigate('Subject', { slug: s.slug, name: s.name })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pageContent: { paddingBottom: 40 },

  // Header — paddingTop comes from insets, applied inline
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  greetSmall: { fontSize: 11, color: colors.textMuted },
  greetName: { fontSize: 16, fontWeight: '800', color: colors.text },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, ...shadow.sm, shadowColor: colors.primaryShadow,
  },
  upgradeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  planBadge: {
    backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  planBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  dashboardLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  dashboardLinkText: { fontSize: 12, color: colors.primary, fontWeight: '500' },

  // Class selector
  classRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  classChip: {
    minWidth: 40, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white, alignItems: 'center',
  },
  classChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  classChipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  classChipTextActive: { color: '#fff', fontWeight: '700' },

  // Stream selector
  streamSelector: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  streamBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  streamBtnScienceActive:   { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' },
  streamBtnScienceInactive: { backgroundColor: colors.white, borderColor: colors.border },
  streamBtnMgmtActive:   { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  streamBtnMgmtInactive: { backgroundColor: colors.white, borderColor: colors.border },
  streamDot: { width: 7, height: 7, borderRadius: 4 },
  streamBtnText: { fontSize: 13 },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  sectionCount: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' },
  seeAllText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  // Subject card — matches SubjectCard.jsx
  card: {
    backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.sm,
  },
  cardAccent: { height: 4 },
  cardBody: { padding: 16 },
  cardIconRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  bookIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  codeWrap: {
    backgroundColor: '#F8FAFC', borderRadius: 4, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  codeText: { fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, fontWeight: '500' },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10, lineHeight: 22 },
  streamRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  streamPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  streamText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize', letterSpacing: 0.2 },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12,
  },
  cardClass: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  studyNow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  studyNowText: { fontSize: 12, fontWeight: '700' },

  loadingWrap: { paddingVertical: 40, alignItems: 'center' },
  emptyWrap: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
