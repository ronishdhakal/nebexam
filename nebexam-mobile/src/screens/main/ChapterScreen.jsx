import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getChapter, getImportantQuestions } from '../../api/content';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadow } from '../../theme';
import { tiptapToHtml, tiptapToText, NOTES_HTML_WRAPPER } from '../../utils/tiptap';
import AnswerReveal from '../../components/question/AnswerReveal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FREE_PREVIEW = 4;

function TiptapWebView({ json }) {
  const html = NOTES_HTML_WRAPPER(tiptapToHtml(json));
  const [height, setHeight] = useState(300);
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ height }}
      scrollEnabled={false}
      onMessage={(e) => setHeight(Number(e.nativeEvent.data) + 8)}
      injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight.toString())"
    />
  );
}

function PdfViewer({ uri }) {
  const [loading, setLoading] = useState(true);
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`;
  return (
    <View style={styles.pdfWrap}>
      {loading && (
        <View style={styles.pdfLoader}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.pdfLoaderText}>Loading PDF…</Text>
        </View>
      )}
      <WebView
        source={{ uri: viewerUrl }}
        style={{ flex: 1 }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const ENTRY_TYPE_LABEL = { old_question: 'Old Question', model_question: 'Model Question' };

function QuestionNode({ node, index, isFree, isLocked }) {
  const text = tiptapToText(node.content);
  if (node.question_type === 'or_separator') {
    return <Text style={styles.orSep}>— OR —</Text>;
  }

  const sourceLabel =
    node.entry_type === 'model_question' ? 'Model Question' :
    node.entry_type === 'old_question'   ? `Old Question${node.entry_year ? ` ${node.entry_year}` : ''}` :
    null;

  return (
    <View style={[styles.qNode, isLocked && styles.qLocked]}>
      {/* Number + source badge row */}
      <View style={styles.qHeaderRow}>
        <View style={styles.qCircle}>
          <Text style={styles.qCircleText}>{index + 1}</Text>
        </View>
        {sourceLabel && (
          <View style={styles.qSourceBadge}>
            <Text style={styles.qSourceText}>{sourceLabel}</Text>
          </View>
        )}
        {node.marks_label && (
          <Text style={styles.qMarks}>{node.marks_label}</Text>
        )}
      </View>

      {/* Question text */}
      {Boolean(text) && (
        <Text style={[styles.qText, isLocked && { opacity: 0.5 }]} numberOfLines={isLocked ? 2 : undefined}>
          {text}
        </Text>
      )}

      {/* MCQ options — styled A B C circles */}
      {node.question_type === 'mcq' && Array.isArray(node.options) && node.options.length > 0 && (
        <View style={styles.mcqOptions}>
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

      {/* Answer reveal */}
      {!isLocked && <AnswerReveal node={node} />}

      {/* Children */}
      {node.children?.map((child, ci) => (
        <View key={child.id ?? ci} style={styles.qChild}>
          <QuestionNode node={child} index={ci} isFree={isFree} isLocked={false} />
        </View>
      ))}
    </View>
  );
}

function ImportantQuestionsSection({ questions, isFree }) {
  const total = questions.length;
  const showLock = isFree && total > FREE_PREVIEW;
  const visible = showLock ? questions.slice(0, FREE_PREVIEW) : questions;

  // Group by source (manual vs bank groups)
  const manual = visible.filter((q) => q.source === 'manual');
  const bankMap = {};
  visible.filter((q) => q.source !== 'manual').forEach((q) => {
    const key = `${q.entry_type ?? 'unknown'}__${q.entry_year ?? ''}`;
    if (!bankMap[key]) bankMap[key] = { entry_type: q.entry_type, entry_year: q.entry_year, qs: [] };
    bankMap[key].qs.push(q);
  });
  const bankGroups = Object.values(bankMap);

  let globalIdx = 0;

  return (
    <View style={styles.iqSection}>
      {manual.length > 0 && (
        <View style={styles.iqCard}>
          {manual.map((q) => (
            <QuestionNode key={q.id} node={q} index={globalIdx++} isFree={isFree} isLocked={false} />
          ))}
        </View>
      )}

      {bankGroups.map((group) => {
        const typeLabel = ENTRY_TYPE_LABEL[group.entry_type] ?? 'Question Bank';
        const header = group.entry_year ? `${typeLabel} · ${group.entry_year}` : typeLabel;
        return (
          <View key={`${group.entry_type}__${group.entry_year}`}>
            <View style={styles.bankHeader}>
              <View style={styles.bankBadge}>
                <Text style={styles.bankBadgeText}>{header}</Text>
              </View>
              <View style={styles.bankLine} />
            </View>
            <View style={styles.iqCard}>
              {group.qs.map((q) => (
                <QuestionNode key={q.id} node={q} index={globalIdx++} isFree={isFree} isLocked={false} />
              ))}
            </View>
          </View>
        );
      })}

      {/* Lock gate */}
      {showLock && (
        <View style={styles.lockWrap}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={22} color={colors.primary} />
          </View>
          <Text style={styles.lockTitle}>
            {total - FREE_PREVIEW} more question{total - FREE_PREVIEW !== 1 ? 's' : ''} locked
          </Text>
          <Text style={styles.lockSub}>Upgrade to a paid plan to view all important questions</Text>
        </View>
      )}
    </View>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <View style={styles.sectionHeading}>
      <Ionicons name={icon} size={15} color={colors.text} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

export default function ChapterScreen({ route, navigation }) {
  const { slug, name } = route.params;
  const [chapter, setChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfMode, setPdfMode] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isFree = !user?.subscription_tier || user.subscription_tier === 'free';

  useEffect(() => {
    navigation.setOptions({ title: name });
    Promise.all([
      getChapter(slug),
      getImportantQuestions(slug).catch(() => ({ data: [] })),
    ]).then(([chRes, iqRes]) => {
      setChapter(chRes.data);
      const iq = iqRes.data.results ?? iqRes.data;
      setQuestions(Array.isArray(iq) ? iq : []);
      if (!chRes.data.rich_text_notes && chRes.data.pdf_notes) setPdfMode(true);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!chapter) {
    return <View style={styles.center}><Text style={styles.errorText}>Could not load chapter.</Text></View>;
  }

  const hasNotes     = Boolean(chapter.rich_text_notes);
  const hasPdf       = Boolean(chapter.pdf_notes);
  const hasQuestions = questions.length > 0;

  return (
    <View style={styles.root}>
      {/* PDF/Notes toggle if both exist */}
      {hasNotes && hasPdf && (
        <View style={styles.tabBar}>
          {[
            { key: false, label: 'Notes' },
            { key: true,  label: 'PDF' },
          ].map((t) => (
            <TouchableOpacity
              key={String(t.key)}
              style={[styles.tab, pdfMode === t.key && styles.tabActive]}
              onPress={() => setPdfMode(t.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, pdfMode === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {pdfMode && hasPdf ? (
        <PdfViewer uri={chapter.pdf_notes} />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

          {/* PDF shortcut when no notes */}
          {hasPdf && !hasNotes && (
            <TouchableOpacity style={styles.pdfBtn} onPress={() => setPdfMode(true)} activeOpacity={0.8}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={styles.pdfBtnText}>Open PDF Notes</Text>
            </TouchableOpacity>
          )}

          {/* Text notes */}
          {hasNotes && (
            <View style={styles.section}>
              <SectionHeading icon="document-text-outline" title="Notes" />
              <View style={styles.notesCard}>
                <TiptapWebView json={chapter.rich_text_notes} />
              </View>
            </View>
          )}

          {/* Important Questions */}
          {hasQuestions && (
            <View style={styles.section}>
              <SectionHeading icon="star-outline" title="Important Questions" />
              <ImportantQuestionsSection questions={questions} isFree={isFree} />
            </View>
          )}

          {!hasNotes && !hasPdf && !hasQuestions && (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="book-outline" size={26} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyText}>No content available for this chapter yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.danger, fontSize: 13 },

  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16,
  },
  tab: { paddingVertical: 12, paddingHorizontal: 4, marginRight: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },

  section: { marginBottom: 24 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },

  notesCard: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow.sm,
  },

  pdfWrap: { flex: 1, minHeight: SCREEN_HEIGHT - 120 },
  pdfLoader: {
    position: 'absolute', inset: 0, zIndex: 1,
    justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: colors.background,
  },
  pdfLoaderText: { fontSize: 13, color: colors.textSecondary },

  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md, padding: 13, marginBottom: 20,
    alignSelf: 'flex-start',
  },
  pdfBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  // Important questions
  iqSection: { gap: 12 },
  iqCard: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 14, ...shadow.sm,
  },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  bankBadge: {
    backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#FDE68A',
  },
  bankBadgeText: { fontSize: 10, fontWeight: '700', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5 },
  bankLine: { flex: 1, height: 1, backgroundColor: '#FDE68A' },

  qNode: { gap: 6, marginBottom: 4 },
  qLocked: { opacity: 0.4 },
  qHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  qCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  qCircleText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  qSourceBadge: {
    backgroundColor: '#FFFBEB', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  qSourceText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  qText: { fontSize: 14, color: colors.text, lineHeight: 22 },
  qMarks: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginLeft: 'auto' },
  mcqOptions: { gap: 6, marginTop: 6 },
  mcqRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mcqLetter: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  mcqLetterText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  mcqOptText: { fontSize: 13, color: colors.text, flex: 1, lineHeight: 20 },
  qChild: { marginLeft: 16, marginTop: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.border },
  orSep: { fontSize: 11, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic', marginVertical: 6 },

  lockWrap: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', padding: 24, gap: 8, ...shadow.sm,
  },
  lockIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  lockTitle: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },
  lockSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
