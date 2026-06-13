import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { revealAnswer } from '../../api/auth';
import { colors, radius, shadow } from '../../theme';
import { tiptapToText } from '../../utils/tiptap';

const FREE_LIMIT = 4;
const { height: SCREEN_H } = Dimensions.get('window');

function AnswerSection({ label, labelColor, bgColor, borderColor, content }) {
  if (!content) return null;
  const text = tiptapToText(content);
  if (!text) return null;
  return (
    <View style={[styles.answerSection, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.answerSectionLabel, { color: labelColor }]}>{label}</Text>
      <Text style={styles.answerSectionText}>{text}</Text>
    </View>
  );
}

function AnswerModal({ node, onClose }) {
  const questionText = tiptapToText(node.content);
  const MCQ_LABELS = ['A', 'B', 'C', 'D', 'E'];

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalSheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.answerIcon}>
                <Ionicons name="checkmark" size={13} color={colors.primary} />
              </View>
              <Text style={styles.modalHeaderTitle}>Answer</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>

            {/* Question recap */}
            {Boolean(questionText) && (
              <View style={styles.questionRecap}>
                <Text style={styles.recapLabel}>QUESTION</Text>
                <Text style={styles.recapText}>{questionText}</Text>

                {/* MCQ options */}
                {node.question_type === 'mcq' && Array.isArray(node.options) && node.options.length > 0 && (
                  <View style={styles.mcqList}>
                    {node.options.map((opt, i) => (
                      <View key={i} style={styles.mcqRow}>
                        <View style={styles.mcqLetter}>
                          <Text style={styles.mcqLetterText}>{MCQ_LABELS[i]}</Text>
                        </View>
                        <Text style={styles.mcqText}>
                          {typeof opt === 'string' ? opt : tiptapToText(opt)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Answer */}
            <AnswerSection
              label="ANSWER"
              labelColor={colors.primary}
              bgColor="rgba(28,163,253,0.06)"
              borderColor="rgba(28,163,253,0.2)"
              content={node.answer}
            />

            {/* Hint / Explanation */}
            <AnswerSection
              label="HINT"
              labelColor="#D97706"
              bgColor="#FFFBEB"
              borderColor="#FDE68A"
              content={node.explanation}
            />

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function AnswerReveal({ node }) {
  const { answer, explanation } = node;
  const user        = useAuthStore((s) => s.user);
  const updateUser  = useAuthStore((s) => s.updateUser);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(null); // null | 'login' | 'limit'

  if (!answer && !explanation) return null;

  const isPaid = user?.subscription_tier && user.subscription_tier !== 'free' &&
    (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date());
  const used = user?.free_answers_used ?? 0;

  const handleReveal = async () => {
    if (!accessToken) { setBlocked('login'); return; }
    if (isPaid)       { setOpen(true);       return; }
    if (used >= FREE_LIMIT) { setBlocked('limit'); return; }

    setLoading(true);
    try {
      const { data } = await revealAnswer();
      if (data.allowed) {
        updateUser({ free_answers_used: data.free_answers_used });
        setOpen(true);
      } else {
        setBlocked('limit');
      }
    } catch {
      setBlocked('limit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {/* Reveal button */}
      {!blocked && (
        <TouchableOpacity
          style={styles.revealBtn}
          onPress={handleReveal}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textMuted} style={{ marginRight: 4 }} />
          ) : (
            <Ionicons name="chevron-forward" size={11} color={colors.textMuted} />
          )}
          <Text style={styles.revealBtnText}>{loading ? '…' : 'Answer'}</Text>
        </TouchableOpacity>
      )}

      {/* Login gate */}
      {blocked === 'login' && (
        <Text style={styles.gateText}>Sign in to see the answer.</Text>
      )}

      {/* Limit gate */}
      {blocked === 'limit' && (
        <View style={styles.limitWrap}>
          <Text style={styles.gateText}>Free limit reached ({FREE_LIMIT} answers).</Text>
          <View style={styles.upgradePill}>
            <Ionicons name="flash" size={10} color={colors.primary} />
            <Text style={styles.upgradeText}>Upgrade Plan</Text>
          </View>
        </View>
      )}

      {/* Answer modal */}
      {open && <AnswerModal node={node} onClose={() => setOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },

  // Reveal button — subtle, like website
  revealBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start',
  },
  revealBtnText: { fontSize: 11, fontWeight: '500', color: colors.textMuted },

  // Gate messages
  gateText: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  limitWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  upgradePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  upgradeText: { fontSize: 11, fontWeight: '700', color: colors.primary },

  // Modal overlay
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: SCREEN_H * 0.88,
    ...shadow.md,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },

  // Modal header
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  answerIcon: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  modalHeaderTitle: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 0.8, textTransform: 'uppercase' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
  },

  // Modal body
  modalBody: { flex: 0 },
  modalBodyContent: { padding: 20, gap: 14 },

  // Question recap
  questionRecap: {
    backgroundColor: colors.background, borderRadius: radius.md, padding: 14, gap: 8,
  },
  recapLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  recapText: { fontSize: 13, color: colors.text, lineHeight: 20 },

  // MCQ in modal
  mcqList: { gap: 6, marginTop: 6 },
  mcqRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mcqLetter: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(28,163,253,0.10)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  mcqLetterText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  mcqText: { fontSize: 13, color: colors.text, flex: 1 },

  // Answer / hint sections
  answerSection: {
    borderRadius: radius.md, borderWidth: 1, padding: 14, gap: 8,
  },
  answerSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  answerSectionText: { fontSize: 13, color: colors.text, lineHeight: 20 },
});
