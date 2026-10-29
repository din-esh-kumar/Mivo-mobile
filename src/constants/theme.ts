// ==========================================
// Mivo Design System & Mobile Theme Tokens
// ==========================================

export const THEME = {
  colors: {
    // Backgrounds
    background: '#090D16',       // Deep space navy/slate
    surface: '#0F172A',          // Surface card background
    surfaceHover: '#1E293B',     // Active / pressed surface
    surfaceElevated: '#1E293B',  // Modals / sheets
    border: '#1E293B',
    borderLight: '#334155',

    // Brand Accents
    primary: '#6366F1',          // Electric Indigo
    primaryHover: '#4F46E5',
    accentRed: '#EF4444',        // Mivo Ruby / Recording / End Call
    accentRuby: '#E11D48',
    accentGreen: '#10B981',      // Active Speaker / Online Green
    accentAmber: '#F59E0B',      // Away / Warning
    accentCyan: '#06B6D4',       // Stream / Stage

    // Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#090D16',

    // Status
    statusOnline: '#10B981',
    statusIdle: '#F59E0B',
    statusDnd: '#EF4444',
    statusOffline: '#64748B',

    // Message Bubbles
    bubbleMe: '#4F46E5',
    bubbleOther: '#1E293B',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, color: '#F8FAFC' },
    h2: { fontSize: 22, fontWeight: '700' as const, color: '#F8FAFC' },
    h3: { fontSize: 18, fontWeight: '600' as const, color: '#F8FAFC' },
    body: { fontSize: 15, fontWeight: '400' as const, color: '#F8FAFC' },
    bodySm: { fontSize: 13, fontWeight: '400' as const, color: '#94A3B8' },
    caption: { fontSize: 11, fontWeight: '500' as const, color: '#64748B' },
  },
};
