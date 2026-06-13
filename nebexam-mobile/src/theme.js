export const colors = {
  primary: '#1CA3FD',
  primaryLight: 'rgba(28,163,253,0.10)',
  primaryDim: 'rgba(28,163,253,0.08)',
  primaryShadow: 'rgba(28,163,253,0.25)',
  background: '#F8FAFC',
  white: '#FFFFFF',
  surface: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#059669',
  warning: '#D97706',
  danger: '#E11D48',
};

// Cycling accent palette for subjects — matches the web site exactly
export const SUBJECT_ACCENTS = [
  { bg: 'rgba(28,163,253,0.08)', text: '#1CA3FD' },
  { bg: '#F5F3FF',               text: '#7C3AED' },
  { bg: '#ECFDF5',               text: '#059669' },
  { bg: '#FFFBEB',               text: '#D97706' },
  { bg: '#FFF1F2',               text: '#E11D48' },
  { bg: '#EEF2FF',               text: '#4F46E5' },
  { bg: '#F0FDFA',               text: '#0D9488' },
  { bg: '#FFF7ED',               text: '#EA580C' },
];

export const TIER_CONFIG = {
  free:     { label: 'Free Plan',     badgeBg: '#F1F5F9', badgeText: '#64748B', dotColor: '#94A3B8' },
  '1month': { label: '1 Month Plan',  badgeBg: '#EFF6FF', badgeText: '#2563EB', dotColor: '#3B82F6' },
  '3month': { label: '3 Months Plan', badgeBg: 'rgba(28,163,253,0.10)', badgeText: '#1CA3FD', dotColor: '#1CA3FD' },
  '1year':  { label: '1 Year Plan',   badgeBg: '#F5F3FF', badgeText: '#7C3AED', dotColor: '#7C3AED' },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
