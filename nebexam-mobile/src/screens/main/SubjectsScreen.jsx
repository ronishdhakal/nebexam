import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSubjects } from '../../api/content';
import { useAuthStore } from '../../store/authStore';
import { colors, SUBJECT_ACCENTS, radius, shadow } from '../../theme';

export default function SubjectsScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSubjects({ class_level: user?.level })
      .then((res) => setSubjects(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.subject_code || '').toLowerCase().includes(search.toLowerCase())
  );

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
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {user?.level ? `Class ${user.level} Subjects` : 'Subjects'}
              </Text>
              {subjects.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{subjects.length}</Text>
                </View>
              )}
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={14} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search subjects…"
                placeholderTextColor={colors.textMuted}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={22} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>
              {search ? 'No subjects match your search.' : 'No subjects available.'}
            </Text>
            {search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearSearch}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const accent = SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length];
          const abbr = item.subject_code?.slice(0, 2) || item.name.slice(0, 2).toUpperCase();
          const isLast = index === filtered.length - 1;
          return (
            <View style={[styles.itemWrap, !isLast && styles.itemBorder]}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('Subject', { slug: item.slug, name: item.name })}
                activeOpacity={0.6}
              >
                <View style={[styles.iconCircle, { backgroundColor: accent.bg }]}>
                  <Text style={[styles.abbr, { color: accent.text }]}>{abbr}</Text>
                </View>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  {item.subject_code && (
                    <Text style={styles.itemCode}>{item.subject_code}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </TouchableOpacity>
            </View>
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

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 0,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  countBadge: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  countText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    marginHorizontal: 12, marginBottom: 10,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, padding: 0 },

  itemWrap: { backgroundColor: colors.white },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.background },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  abbr: { fontSize: 11, fontWeight: '800' },
  itemMeta: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 13, fontWeight: '600', color: colors.text },
  itemCode: { fontSize: 10, color: colors.textMuted, fontWeight: '500', marginTop: 1 },

  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  clearSearch: { marginTop: 8, fontSize: 12, color: colors.primary, fontWeight: '600' },
});
