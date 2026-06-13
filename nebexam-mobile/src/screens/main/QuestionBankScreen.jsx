import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getQuestionEntries } from '../../api/content';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow } from '../../theme';

const TYPE_LABELS = { old_question: 'Old Question', model_question: 'Model Question' };
const TYPE_COLORS = {
  old_question:   { bg: '#EFF6FF', text: '#2563EB' },
  model_question: { bg: '#ECFDF5', text: '#059669' },
};

export default function QuestionBankScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | old_question | model_question

  useEffect(() => {
    const params = {};
    if (user?.level) params.class_level = user.level;
    getQuestionEntries(params)
      .then((res) => setEntries(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.subject_name || '').toLowerCase().includes(q) ||
      (e.year ? String(e.year) : '').includes(q)
    );
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Search */}
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={14} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search papers…"
                placeholderTextColor={colors.textMuted}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Type filters */}
            <View style={styles.filters}>
              {[
                { key: 'all',           label: 'All' },
                { key: 'old_question',  label: 'Old Questions' },
                { key: 'model_question',label: 'Model Questions' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, typeFilter === f.key && styles.filterChipActive]}
                  onPress={() => setTypeFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, typeFilter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.resultCount}>{filtered.length} paper{filtered.length !== 1 ? 's' : ''}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="help-circle-outline" size={24} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>No question papers found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const typeColor = TYPE_COLORS[item.type] ?? TYPE_COLORS.old_question;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('QuestionEntry', { slug: item.slug, title: item.title })}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  {item.subject_name && (
                    <Text style={styles.cardSubject}>{item.subject_name}</Text>
                  )}
                </View>
                {item.year && (
                  <Text style={styles.cardYear}>{item.year}</Text>
                )}
              </View>
              <View style={styles.cardFooter}>
                <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
                    {TYPE_LABELS[item.type] ?? item.type}
                  </Text>
                </View>
                {item.full_marks && (
                  <Text style={styles.cardMeta}>Full: {item.full_marks}</Text>
                )}
                {item.time && (
                  <Text style={styles.cardMeta}>{item.time}</Text>
                )}
                <Ionicons name="chevron-forward" size={14} color={colors.border} style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 10, ...shadow.sm,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, padding: 0 },

  filters: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.primary },

  resultCount: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginBottom: 10 },

  card: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 8, ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },
  cardSubject: { fontSize: 11, color: colors.textMuted, marginTop: 3, fontWeight: '500' },
  cardYear: { fontSize: 18, fontWeight: '800', color: colors.primary, flexShrink: 0 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  cardMeta: { fontSize: 11, color: colors.textMuted },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
