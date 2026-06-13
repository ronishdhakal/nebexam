import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getQuestionEntry } from '../../api/content';
import { colors, radius, shadow } from '../../theme';
import { tiptapToText } from '../../utils/tiptap';
import AnswerReveal from '../../components/question/AnswerReveal';

const GRADE = { '10': 'X', '11': 'XI', '12': 'XII' };
const TYPE_LABEL = { old_question: 'Old Question', model_question: 'Model Question' };

// ─── Question node renderer ────────────────────────────────────────────────────
function QuestionNode({ node, index, depth = 0 }) {
  if (!node) return null;
  const text = tiptapToText(node.content);

  if (node.question_type === 'or_separator') {
    return <Text style={styles.orSep}>OR</Text>;
  }

  const isTopLevel = depth === 0;

  return (
    <View style={[styles.qNode, depth > 0 && styles.qNodeChild]}>
      <View style={styles.qRow}>
        {isTopLevel ? (
          <Text style={styles.qNumTop}>{index + 1}.</Text>
        ) : (
          <Text style={styles.qNumSub}>{String.fromCharCode(97 + index)}.</Text>
        )}
        <View style={{ flex: 1, gap: 6 }}>
          {Boolean(text) && <Text style={styles.qText}>{text}</Text>}

          {node.marks_label ? (
            <Text style={styles.qMarks}>[{node.marks_label}]</Text>
          ) : node.marks ? (
            <Text style={styles.qMarks}>[{node.marks} marks]</Text>
          ) : null}

          {/* MCQ */}
          {node.question_type === 'mcq' && Array.isArray(node.options) && node.options.length > 0 && (
            <View style={styles.mcqGrid}>
              {node.options.map((opt, i) => {
                const optText = typeof opt === 'string' ? opt : tiptapToText(opt);
                return (
                  <View key={i} style={styles.mcqOption}>
                    <View style={styles.mcqLetter}>
                      <Text style={styles.mcqLetterText}>{String.fromCharCode(65 + i)}</Text>
                    </View>
                    <Text style={styles.mcqText} numberOfLines={3}>{optText}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Answer reveal */}
      <AnswerReveal node={node} />

      {/* Sub-questions */}
      {node.children?.length > 0 && (
        <View style={styles.qChildren}>
          {node.children.map((child, ci) => (
            <QuestionNode key={child.id ?? ci} node={child} index={ci} depth={depth + 1} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Group renderer ────────────────────────────────────────────────────────────
function PaperGroup({ group, startIndex }) {
  const displayLabel = group.marks_label || null;
  let counter = startIndex;
  return (
    <View style={styles.group}>
      {/* Centered underlined group title */}
      <Text style={styles.groupTitle}>{group.group_title}</Text>

      {/* Disclaimer + marks */}
      {(group.group_disclaimer || group.marks != null || displayLabel) && (
        <View style={styles.groupMeta}>
          <Text style={styles.groupDisclaimer}>{group.group_disclaimer || ''}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {group.marks != null && <Text style={styles.groupMarks}>{group.marks} Marks</Text>}
            {displayLabel && <Text style={styles.groupMarks}>[{displayLabel}]</Text>}
          </View>
        </View>
      )}

      {/* Questions */}
      <View style={styles.groupQuestions}>
        {(group.questions ?? []).map((q) => {
          if (q.question_type === 'or_separator') return <Text key={q.id} style={styles.orSep}>OR</Text>;
          const idx = counter++;
          return <QuestionNode key={q.id} node={q} index={idx} depth={0} />;
        })}
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function QuestionEntryScreen({ route, navigation }) {
  const { slug, title } = route.params;
  const [entry, setEntry]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title });
    getQuestionEntry(slug)
      .then((res) => setEntry(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!entry)  return <View style={styles.center}><Text style={styles.err}>Could not load paper.</Text></View>;

  // Extract class level from subject_slug: "english-class-12" → "12"
  const classLevel = entry.subject_slug?.split('-class-').pop() ?? '';
  const grade      = GRADE[classLevel] ?? classLevel;
  const typeLabel  = TYPE_LABEL[entry.type] ?? entry.type;

  // Count question offset per group
  let groupOffset = 0;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {/* ── Exam Paper Card ── */}
      <View style={styles.paper}>

        {/* Header section — double bottom border */}
        <View style={styles.paperHeader}>
          {/* Sub code — right aligned */}
          {entry.sub_code && (
            <Text style={styles.subCode}>Sub. code {entry.sub_code}</Text>
          )}

          {/* Centered info */}
          <View style={styles.paperCenter}>
            {grade ? <Text style={styles.paperGrade}>NEB — GRADE {grade}</Text> : null}
            {entry.year && <Text style={styles.paperYear}>{entry.year}</Text>}
            <Text style={styles.paperType}>{typeLabel}</Text>
            <Text style={styles.paperSubject}>{entry.subject_name ?? entry.title}</Text>
          </View>

          {/* Disclaimer */}
          <Text style={styles.paperDisclaimer}>
            {tiptapToText(entry.disclaimer) ||
             'The candidates are required to give their answers in their own words as far as practicable. The figures in the margin indicate full marks.'}
          </Text>
          {entry.has_disclaimer_2 && entry.disclaimer_2 && (
            <Text style={styles.paperDisclaimer}>{tiptapToText(entry.disclaimer_2)}</Text>
          )}

          {/* Time / Marks row */}
          <View style={styles.paperMetaRow}>
            <Text style={styles.paperMetaBold}>{entry.time ? `Time : ${entry.time}` : ''}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              {entry.full_marks && <Text style={styles.paperMetaBold}>Full Marks : {entry.full_marks}</Text>}
              {entry.pass_marks && <Text style={styles.paperMetaLight}>Pass Marks : {entry.pass_marks}</Text>}
            </View>
          </View>

          <Text style={styles.attemptAll}>सबै प्रश्नको उत्तर दिनुहोस् । (Attempt All Questions)</Text>
        </View>

        {/* Questions body */}
        <View style={styles.paperBody}>
          {entry.has_group
            ? (entry.groups ?? []).map((g) => {
                const start = groupOffset;
                groupOffset += (g.questions ?? []).filter((q) => q.question_type !== 'or_separator').length;
                return <PaperGroup key={g.id} group={g} startIndex={start} />;
              })
            : (entry.questions ?? []).map((q, i) => (
                q.question_type === 'or_separator'
                  ? <Text key={q.id} style={styles.orSep}>OR</Text>
                  : <QuestionNode key={q.id} node={q} index={i} depth={0} />
              ))
          }
        </View>

        {/* Footer */}
        <View style={styles.paperFooter}>
          <Text style={styles.paperFooterText}>{entry.subject_name} — {typeLabel} {entry.year}</Text>
          <Text style={styles.paperFooterText}>NEB Exam</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F6F9' },
  pageContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  err: { color: colors.danger, fontSize: 13 },

  // Paper card — white, shadow, mimics printed exam paper
  paper: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1, borderColor: '#D1D5DB',
    ...shadow.md,
    overflow: 'hidden',
  },

  // Paper header
  paperHeader: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
    borderBottomWidth: 2, borderBottomColor: '#0F172A',
  },
  subCode: { textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  paperCenter: { alignItems: 'center', gap: 2, marginBottom: 14 },
  paperGrade: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5, color: colors.text },
  paperYear:  { fontSize: 13, fontWeight: '500', color: colors.text },
  paperType:  { fontSize: 13, fontWeight: '500', color: colors.text },
  paperSubject: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 6, textAlign: 'center' },
  paperDisclaimer: {
    fontSize: 12, fontStyle: 'italic', color: '#374151', lineHeight: 18, marginBottom: 6,
  },
  paperMetaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    borderTopWidth: 1, borderTopColor: '#D1D5DB', paddingTop: 10, marginTop: 8,
  },
  paperMetaBold:  { fontSize: 13, fontWeight: '700', color: colors.text },
  paperMetaLight: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  attemptAll: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 8 },

  // Paper body
  paperBody: { paddingHorizontal: 20, paddingVertical: 20, gap: 24 },

  // Group
  group: { gap: 8 },
  groupTitle: {
    textAlign: 'center', fontSize: 14, fontWeight: '800', color: colors.text,
    textDecorationLine: 'underline', letterSpacing: 0.5,
  },
  groupMeta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  groupDisclaimer: { fontSize: 12, fontStyle: 'italic', color: colors.textSecondary, flex: 1 },
  groupMarks: { fontSize: 13, fontWeight: '700', color: colors.text },
  groupQuestions: { gap: 14 },

  // Question node
  qNode: { gap: 4 },
  qNodeChild: { marginLeft: 16, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: colors.border },
  qRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  qNumTop: { fontSize: 14, fontWeight: '700', color: colors.text, width: 22, flexShrink: 0, marginTop: 1 },
  qNumSub: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, width: 18, flexShrink: 0, marginTop: 1 },
  qText:  { fontSize: 14, color: colors.text, lineHeight: 22 },
  qMarks: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textAlign: 'right' },
  qChildren: { marginTop: 8, gap: 10 },

  // MCQ
  mcqGrid: { gap: 6, marginTop: 4 },
  mcqOption: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mcqLetter: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  mcqLetterText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  mcqText: { fontSize: 13, color: colors.text, flex: 1, lineHeight: 20 },

  orSep: {
    textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 2, marginVertical: 4,
  },

  // Footer
  paperFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  paperFooterText: { fontSize: 10, color: colors.textMuted },
});
