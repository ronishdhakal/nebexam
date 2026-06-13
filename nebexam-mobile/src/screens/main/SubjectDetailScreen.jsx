import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSubject, getQuestionEntries, getImportantQuestions } from '../../api/content';
import { colors, radius, shadow } from '../../theme';
import { tiptapToHtml, tiptapToText, NOTES_HTML_WRAPPER } from '../../utils/tiptap';
import AnswerReveal from '../../components/question/AnswerReveal';

const SCREEN_H = Dimensions.get('window').height;

const STREAM_PILL = {
  science:    { bg: 'rgba(28,163,253,0.10)', text: colors.primary },
  management: { bg: 'rgba(28,163,253,0.10)', text: colors.primary },
};

// ─── SubjectHeader ────────────────────────────────────────────────────────────
function SubjectHeader({ subject, tab, setTab, tabs, onBack }) {
  const insets = useSafeAreaInsets();
  const totalChapters =
    (subject?.areas?.reduce((s, a) => s + (a.chapters?.length || 0), 0) || 0) +
    (subject?.direct_chapters?.length || 0);

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbItem}>Home</Text>
        <Text style={styles.breadcrumbSep}>/</Text>
        <Text style={styles.breadcrumbItem}>Class {subject?.class_level}</Text>
        <Text style={styles.breadcrumbSep}>/</Text>
        <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]} numberOfLines={1}>
          {subject?.name}
        </Text>
      </View>

      {/* Subject info */}
      <View style={styles.subjectInfo}>
        <View style={styles.badgeRow}>
          {subject?.subject_code && (
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{subject.subject_code}</Text>
            </View>
          )}
          {subject?.streams?.map((s) => (
            <View key={s} style={styles.streamBadge}>
              <Text style={styles.streamBadgeText}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.subjectName}>{subject?.name}</Text>
        <Text style={styles.subjectMeta}>
          Class {subject?.class_level} · {totalChapters} chapter{totalChapters !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBarScroll}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={t.icon}
              size={14}
              color={tab === t.key ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Chapters tab ─────────────────────────────────────────────────────────────
function ChaptersTab({ subject, navigation }) {
  const items = [];
  (subject?.areas ?? []).forEach((area, aIdx) => {
    items.push({ type: 'area', key: `a-${area.id}`, area, aIdx });
    (area.chapters ?? []).forEach((ch, cIdx) =>
      items.push({ type: 'chapter', key: `c-${ch.id}`, ch, cIdx })
    );
  });
  (subject?.direct_chapters ?? []).forEach((ch, cIdx) =>
    items.push({ type: 'chapter', key: `dc-${ch.id}`, ch, cIdx })
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.key}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        if (item.type === 'area') {
          return (
            <View style={styles.areaHeader}>
              <View style={styles.areaNumBadge}>
                <Text style={styles.areaNumText}>{item.aIdx + 1}</Text>
              </View>
              <Text style={styles.areaName}>{item.area.name}</Text>
              <View style={styles.areaCount}>
                <Text style={styles.areaCountText}>{item.area.chapters?.length || 0} chapters</Text>
              </View>
              <View style={styles.areaLine} />
            </View>
          );
        }
        const ch = item.ch;
        const hasNotes = Boolean(ch.rich_text_notes);
        const hasPdf   = Boolean(ch.pdf_notes);
        return (
          <TouchableOpacity
            style={styles.chapterCard}
            onPress={() => navigation.navigate('Chapter', { slug: ch.slug, name: ch.name })}
            activeOpacity={0.7}
          >
            <View style={styles.chapterNum}>
              <Text style={styles.chapterNumText}>
                {String(item.cIdx + 1).padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.chapterBody}>
              <Text style={styles.chapterName} numberOfLines={2}>{ch.name}</Text>
              {(hasNotes || hasPdf) && (
                <View style={styles.chapterBadges}>
                  {hasNotes && (
                    <View style={styles.notesBadge}>
                      <View style={styles.notesDot} />
                      <Text style={styles.notesBadgeText}>Notes</Text>
                    </View>
                  )}
                  {hasPdf && (
                    <View style={styles.pdfBadge}>
                      <View style={styles.pdfDot} />
                      <Text style={styles.pdfBadgeText}>PDF</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.border} />
          </TouchableOpacity>
        );
      }}
    />
  );
}

// ─── Question Bank tab ────────────────────────────────────────────────────────
function QuestionBankTab({ subjectSlug, navigation }) {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getQuestionEntries({ subject: subjectSlug })
      .then((res) => setEntries(res.data.results ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectSlug]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;

  const old   = entries.filter((e) => e.type === 'old_question');
  const model = entries.filter((e) => e.type === 'model_question');

  if (entries.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="help-circle-outline" size={28} color={colors.textMuted} />
        <Text style={styles.emptyText}>No question papers available yet.</Text>
      </View>
    );
  }

  const EntryRow = ({ entry }) => (
    <TouchableOpacity
      style={styles.entryRow}
      onPress={() => navigation.navigate('QuestionEntry', { slug: entry.slug, title: entry.title })}
      activeOpacity={0.7}
    >
      <View style={styles.entryLeft}>
        <Text style={styles.entryYear}>{entry.year ?? '—'}</Text>
        <View style={styles.entryDivider} />
        <View style={styles.entryInfo}>
          <Text style={styles.entryTitle} numberOfLines={1}>{entry.title}</Text>
          <View style={styles.entryMeta}>
            {entry.full_marks && <Text style={styles.entryMetaText}>Full: {entry.full_marks}</Text>}
            {entry.time       && <Text style={styles.entryMetaText}>Time: {entry.time}</Text>}
            {entry.pass_marks && <Text style={styles.entryMetaText}>Pass: {entry.pass_marks}</Text>}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.border} />
    </TouchableOpacity>
  );

  const Section = ({ title, count, accent, data }) => (
    <View style={styles.qbSection}>
      <View style={styles.qbSectionHeader}>
        <Text style={styles.qbSectionTitle}>{title}</Text>
        <View style={[styles.qbCount, { backgroundColor: accent.bg }]}>
          <Text style={[styles.qbCountText, { color: accent.text }]}>{count}</Text>
        </View>
      </View>
      <View style={styles.entryList}>
        {data.map((e) => <EntryRow key={e.slug} entry={e} />)}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.listContent}>
      {old.length > 0 && (
        <Section
          title="OLD QUESTIONS"
          count={old.length}
          accent={{ bg: '#F1F5F9', text: colors.textMuted }}
          data={old}
        />
      )}
      {model.length > 0 && (
        <Section
          title="MODEL QUESTIONS"
          count={model.length}
          accent={{ bg: colors.primaryLight, text: colors.primary }}
          data={model}
        />
      )}
    </ScrollView>
  );
}

// ─── Chapter-Wise tab ─────────────────────────────────────────────────────────
function ChapterWiseTab({ subject }) {
  const chapters = [];
  (subject?.areas ?? []).forEach((a) =>
    (a.chapters ?? []).forEach((ch) => chapters.push({ ...ch, area_name: a.name }))
  );
  (subject?.direct_chapters ?? []).forEach((ch) => chapters.push(ch));

  const [selected, setSelected] = useState(chapters[0]?.slug ?? null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedIdx = chapters.findIndex((c) => c.slug === selected);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setQuestions([]);
    getImportantQuestions(selected)
      .then((res) => setQuestions(res.data.results ?? res.data ?? []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [selected]);

  if (!chapters.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No chapters available.</Text>
      </View>
    );
  }

  const goPrev = () => { if (selectedIdx > 0) setSelected(chapters[selectedIdx - 1].slug); };
  const goNext = () => { if (selectedIdx < chapters.length - 1) setSelected(chapters[selectedIdx + 1].slug); };

  return (
    <View style={{ flex: 1 }}>
      {/* Chapter picker bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.chapterPicker} contentContainerStyle={styles.chapterPickerContent}>
        {chapters.map((ch, idx) => (
          <TouchableOpacity
            key={ch.slug}
            style={[styles.chapterPickerItem, selected === ch.slug && styles.chapterPickerItemActive]}
            onPress={() => setSelected(ch.slug)}
            activeOpacity={0.7}
          >
            <View style={[styles.chPickerNum, selected === ch.slug && styles.chPickerNumActive]}>
              <Text style={[styles.chPickerNumText, selected === ch.slug && { color: '#fff' }]}>
                {idx + 1}
              </Text>
            </View>
            <Text
              style={[styles.chPickerLabel, selected === ch.slug && styles.chPickerLabelActive]}
              numberOfLines={1}
            >
              {ch.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chapter nav bar */}
      <View style={styles.chNavBar}>
        <TouchableOpacity onPress={goPrev} disabled={selectedIdx === 0} style={styles.chNavBtn}>
          <Ionicons name="chevron-back" size={16} color={selectedIdx === 0 ? colors.border : colors.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          {chapters[selectedIdx]?.area_name && (
            <Text style={styles.chNavArea}>{chapters[selectedIdx].area_name}</Text>
          )}
          <Text style={styles.chNavTitle} numberOfLines={1}>
            <Text style={{ color: colors.textMuted, fontWeight: '400' }}>Ch {selectedIdx + 1}. </Text>
            {chapters[selectedIdx]?.name}
          </Text>
        </View>
        <Text style={styles.chNavCount}>{selectedIdx + 1}/{chapters.length}</Text>
        <TouchableOpacity onPress={goNext} disabled={selectedIdx === chapters.length - 1} style={styles.chNavBtn}>
          <Ionicons name="chevron-forward" size={16} color={selectedIdx === chapters.length - 1 ? colors.border : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Questions */}
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.cwContent}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
        ) : questions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="help-circle-outline" size={26} color={colors.textMuted} />
            <Text style={styles.emptyText}>No important questions yet.</Text>
            <Text style={styles.emptySubText}>Questions will appear here once added.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cwCount}>{questions.length} question{questions.length !== 1 ? 's' : ''} found</Text>
            {questions.map((q, i) => <CwQuestion key={q.id} node={q} index={i} />)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CwQuestion({ node, index }) {
  const text = tiptapToText(node.content);
  if (!text && node.question_type === 'or_separator') return (
    <Text style={styles.orSep}>— OR —</Text>
  );
  return (
    <View style={styles.cwQCard}>
      <View style={styles.cwQHeader}>
        <View style={styles.cwQNum}>
          <Text style={styles.cwQNumText}>{index + 1}</Text>
        </View>
        {node.entry_type && (
          <View style={styles.cwSourceBadge}>
            <Text style={styles.cwSourceText}>
              {node.entry_type === 'model_question' ? 'Model Question' : `Old Question${node.entry_year ? ` ${node.entry_year}` : ''}`}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.cwQText}>{text}</Text>
      <AnswerReveal node={node} />
      {node.question_type === 'mcq' && Array.isArray(node.options) && (
        <View style={styles.mcqList}>
          {node.options.map((opt, i) => (
            <View key={i} style={styles.mcqRow}>
              <View style={styles.mcqLetter}>
                <Text style={styles.mcqLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.mcqOptText}>
                {typeof opt === 'string' ? opt : tiptapToText(opt)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Syllabus tab ─────────────────────────────────────────────────────────────
function SyllabusTab({ subject }) {
  const [height, setHeight] = useState(300);
  const hasTiptap = Boolean(subject?.syllabus?.content?.length);
  const gradeMap = { '10': 'X', '11': 'XI', '12': 'XII' };
  const grade = gradeMap[subject?.class_level] ?? subject?.class_level ?? '';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F6F9' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {hasTiptap ? (
        <View style={styles.syllabusPaper}>
          {/* Paper-style header */}
          <View style={styles.syllabusHeader}>
            {subject?.subject_code && (
              <Text style={styles.syllabusSubCode}>Sub. code {subject.subject_code}</Text>
            )}
            <View style={styles.syllabusCenter}>
              {subject?.syllabus_university && (
                <Text style={styles.syllabusUniversity}>{subject.syllabus_university}</Text>
              )}
              <Text style={styles.syllabusGrade}>NEB — GRADE {grade}</Text>
              <Text style={styles.syllabusSubjectName}>{subject?.name}</Text>
              <Text style={styles.syllabusTitleLabel}>Syllabus</Text>
            </View>
            {(subject?.syllabus_time || subject?.syllabus_full_mark) && (
              <View style={styles.syllabusMetaRow}>
                <Text style={styles.syllabusMetaBold}>
                  {subject.syllabus_time ? `Time : ${subject.syllabus_time}` : ''}
                </Text>
                <View style={{ alignItems: 'flex-end' }}>
                  {subject.syllabus_full_mark != null && (
                    <Text style={styles.syllabusMetaBold}>Full Marks : {subject.syllabus_full_mark}</Text>
                  )}
                  {subject.syllabus_pass_mark != null && (
                    <Text style={styles.syllabusMetaLight}>Pass Marks : {subject.syllabus_pass_mark}</Text>
                  )}
                </View>
              </View>
            )}
          </View>
          {/* Rich text content */}
          <View style={[styles.syllabusBody, { minHeight: height }]}>
            <WebView
              originWhitelist={['*']}
              source={{ html: NOTES_HTML_WRAPPER(tiptapToHtml(subject.syllabus)) }}
              style={{ height }}
              scrollEnabled={false}
              onMessage={(e) => setHeight(Number(e.nativeEvent.data) + 8)}
              injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight.toString())"
            />
          </View>
        </View>
      ) : (
        <View style={styles.syllabusEmpty}>
          <View style={styles.syllabusEmptyIcon}>
            <Ionicons name="list-outline" size={24} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyText}>No syllabus available yet.</Text>
          <Text style={styles.emptySubText}>Check back later or contact your teacher.</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SubjectDetailScreen({ route, navigation }) {
  const { slug, name } = route.params;
  const [subject, setSubject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('chapters');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    getSubject(slug)
      .then((res) => setSubject(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const hasChapters  = !!(subject?.areas?.length || subject?.direct_chapters?.length);
  const hasSyllabus  = !!(subject?.syllabus?.content?.length);

  const TABS = [
    { key: 'chapters',  label: 'Chapters',      icon: 'book-outline',         show: hasChapters },
    { key: 'syllabus',  label: 'Syllabus',       icon: 'list-outline',         show: hasSyllabus },
    { key: 'qbank',     label: 'Question Bank',  icon: 'help-circle-outline',  show: true },
    { key: 'chapterwise', label: 'Chapter-Wise', icon: 'help-circle-outline',  show: hasChapters },
  ].filter((t) => t.show);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SubjectHeader subject={subject} tab={tab} setTab={setTab} tabs={TABS} onBack={() => navigation.goBack()} />

      <View style={{ flex: 1 }}>
        {tab === 'chapters'    && <ChaptersTab    subject={subject} navigation={navigation} />}
        {tab === 'syllabus'    && <SyllabusTab    subject={subject} />}
        {tab === 'qbank'       && <QuestionBankTab subjectSlug={slug} navigation={navigation} />}
        {tab === 'chapterwise' && <ChapterWiseTab  subject={subject} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  backText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  breadcrumb: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  breadcrumbItem: { fontSize: 11, color: colors.textMuted },
  breadcrumbSep:  { fontSize: 11, color: colors.border },
  breadcrumbActive: { color: colors.textSecondary, fontWeight: '600' },
  subjectInfo: { paddingHorizontal: 16, paddingBottom: 0 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  codeBadge: {
    backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  codeBadgeText: { fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, fontWeight: '500' },
  streamBadge: {
    backgroundColor: colors.primaryLight, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  streamBadgeText: { fontSize: 11, fontWeight: '600', color: colors.primary, textTransform: 'capitalize' },
  subjectName: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 3 },
  subjectMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  tabBarScroll: { marginTop: 6 },
  tabBar: { paddingHorizontal: 16, paddingBottom: 0, gap: 0 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 12, marginRight: 4,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, whiteSpace: 'nowrap' },
  tabTextActive: { color: colors.primary },

  // Chapters tab
  listContent: { padding: 16, paddingBottom: 40 },
  areaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, marginBottom: 8,
  },
  areaNumBadge: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  areaNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  areaName: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
  areaCount: {
    backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  areaCountText: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  areaLine: { flex: 1, height: 1, backgroundColor: colors.border },
  chapterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, marginBottom: 6, ...shadow.sm,
  },
  chapterNum: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  chapterNumText: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  chapterBody: { flex: 1, minWidth: 0 },
  chapterName: { fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: 18 },
  chapterBadges: { flexDirection: 'row', gap: 5, marginTop: 5 },
  notesBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#EEF6FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  notesDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
  notesBadgeText: { fontSize: 9, fontWeight: '600', color: colors.primary },
  pdfBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F1F5F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  pdfDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.textMuted },
  pdfBadgeText: { fontSize: 9, fontWeight: '600', color: colors.textMuted },

  // Question Bank tab
  qbSection: { marginBottom: 24 },
  qbSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  qbSectionTitle: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.8 },
  qbCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  qbCountText: { fontSize: 10, fontWeight: '600' },
  entryList: {
    borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  entryLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  entryYear: { fontSize: 14, fontWeight: '700', color: colors.text, width: 44, textAlign: 'center' },
  entryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  entryInfo: { flex: 1, minWidth: 0 },
  entryTitle: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 3 },
  entryMeta: { flexDirection: 'row', gap: 12 },
  entryMetaText: { fontSize: 10, color: colors.textMuted },

  // Chapter-Wise tab
  chapterPicker: {
    maxHeight: 40, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  chapterPickerContent: { paddingHorizontal: 12, paddingVertical: 5, gap: 6 },
  chapterPickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: 'transparent',
  },
  chapterPickerItemActive: {
    backgroundColor: colors.primaryLight, borderColor: 'rgba(28,163,253,0.2)',
    borderBottomWidth: 2, borderBottomColor: colors.primary,
  },
  chPickerNum: {
    width: 18, height: 18, borderRadius: 4,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
  },
  chPickerNumActive: { backgroundColor: colors.primary },
  chPickerNumText: { fontSize: 9, fontWeight: '700', color: colors.textMuted },
  chPickerLabel: { fontSize: 11, fontWeight: '500', color: colors.textSecondary, maxWidth: 100 },
  chPickerLabelActive: { color: colors.primary, fontWeight: '600' },
  chNavBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  chNavBtn: { padding: 4 },
  chNavArea: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  chNavTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  chNavCount: { fontSize: 11, color: colors.textMuted },
  cwContent: { padding: 14, paddingBottom: 40 },
  cwCount: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginBottom: 12 },
  cwQCard: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8, ...shadow.sm,
  },
  cwQHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cwQNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  cwQNumText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  cwSourceBadge: {
    backgroundColor: '#FFFBEB', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  cwSourceText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  cwQText: { fontSize: 13, color: colors.text, lineHeight: 20, marginBottom: 8 },
  mcqList: { gap: 6 },
  mcqRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mcqLetter: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  mcqLetterText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  mcqOptText: { fontSize: 13, color: colors.text, flex: 1 },
  orSep: { textAlign: 'center', fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginVertical: 6 },

  // Syllabus
  syllabusPaper: {
    backgroundColor: colors.white, borderRadius: 4,
    borderWidth: 1, borderColor: '#D1D5DB', overflow: 'hidden', ...shadow.md,
  },
  syllabusHeader: {
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 2, borderBottomColor: '#0F172A',
  },
  syllabusSubCode: { textAlign: 'right', fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 10 },
  syllabusCenter: { alignItems: 'center', gap: 3, marginBottom: 14 },
  syllabusUniversity: { fontSize: 12, color: colors.textSecondary },
  syllabusGrade: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5, color: colors.text },
  syllabusSubjectName: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 6, textAlign: 'center' },
  syllabusTitleLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  syllabusMetaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    borderTopWidth: 1, borderTopColor: '#D1D5DB', paddingTop: 10,
  },
  syllabusMetaBold: { fontSize: 12, fontWeight: '700', color: colors.text },
  syllabusMetaLight: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  syllabusBody: { backgroundColor: colors.white },
  syllabusEmpty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  syllabusEmptyIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },

  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
  emptySubText: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
});
