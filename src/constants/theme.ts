// ==========================================
// Mivo Design System & Mobile Theme Tokens
// Human-crafted, tactile, and studio-grade
// ==========================================

export const THEME = {
  colors: {
    // Backgrounds & Surface Depth
    background: '#080B11',       // Deep obsidian with navy undertone
    surface: '#101726',          // Tactile dark card surface
    surfaceHover: '#1A2338',     // Pressed / hovered surface
    surfaceElevated: '#172033',  // Sheets, floating docks, modals
    surfaceSubtle: '#0D1321',    // Recessed containers, input boxes
    surfaceGlass: 'rgba(16, 23, 38, 0.75)', // Glassmorphism backdrop
    surfaceHighlight: 'rgba(255, 255, 255, 0.04)',

    // Borders & Dividers
    border: '#1E293B',           // Subtle separator
    borderLight: '#2A374D',      // Active / highlighted border
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    borderGlow: 'rgba(99, 102, 241, 0.25)',

    // Brand Accents
    primary: '#6366F1',          // Electric Indigo
    primaryHover: '#4F46E5',     // Deep Indigo
    primaryLight: '#818CF8',     // Muted highlight
    primaryGlow: 'rgba(99, 102, 241, 0.18)',

    accentRed: '#EF4444',        // Recording / End Call / Alert
    accentRuby: '#E11D48',
    accentGreen: '#10B981',      // Active Speaker / Online Green
    accentGreenGlow: 'rgba(16, 185, 129, 0.2)',
    accentAmber: '#F59E0B',      // Away / Warning
    accentCyan: '#06B6D4',       // Stream / Stage
    accentPurple: '#8B5CF6',     // Huddle / Stage boost

    // Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#080B11',

    // Status Dots & Accents
    statusOnline: '#10B981',
    statusIdle: '#F59E0B',
    statusDnd: '#EF4444',
    statusOffline: '#64748B',

    // Message Bubbles
    bubbleMe: '#4F46E5',         // Polished electric indigo
    bubbleOther: '#172033',      // Soft dark slate
    bubbleMeBorder: 'rgba(255, 255, 255, 0.12)',
    bubbleOtherBorder: 'rgba(255, 255, 255, 0.06)',
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, color: '#F8FAFC', letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as const, color: '#F8FAFC', letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600' as const, color: '#F8FAFC', letterSpacing: -0.2 },
    body: { fontSize: 15, fontWeight: '400' as const, color: '#F8FAFC', lineHeight: 21 },
    bodySm: { fontSize: 13, fontWeight: '400' as const, color: '#94A3B8', lineHeight: 18 },
    caption: { fontSize: 11, fontWeight: '500' as const, color: '#64748B', letterSpacing: 0.2 },
  },

  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    glowIndigo: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    glowGreen: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};
