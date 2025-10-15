// tokens.ts - Complete TypeScript token definitions for the enhanced design system

// Color Token Types
export type ColorToken = 
  | 'primary' | 'secondary' | 'accent' | 'destructive' 
  | 'success' | 'warning' | 'info' | 'progress'
  | 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5'
  | 'background' | 'foreground' | 'border' | 'input' | 'ring' | 'muted' | "card" | "background-lighter"

export type SemanticColor = 'success' | 'warning' | 'info' | 'progress'
export type AlternateColor = 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5'
export type ChartColor = '1' | '2' | '3' | '4' | '5' | '6'
export type SpacingScale = keyof typeof spacing
export type BorderRadiusScale = keyof typeof borderRadius
export type ShadowScale = keyof typeof shadows

// Color value types
interface ColorValue {
  main: string
  foreground: string
}

interface ExtendedColorValue extends ColorValue {
  subtle?: string
  border?: string
}

interface ChartColors {
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
}

interface SidebarColors {
  main: string
  foreground: string
  primary: ColorValue
  accent: ColorValue
  border: string
  ring: string
}

// Color Tokens
export const colors = {
  // Brand Colors
  primary: {
    main: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
  },
  secondary: {
    main: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)',
  },
  accent: {
    main: 'var(--accent)',
    foreground: 'var(--accent-foreground)',
  },
  destructive: {
    main: 'var(--destructive)',
    foreground: 'var(--destructive-foreground)',
  },

  // Semantic Colors
  success: {
    main: 'var(--success)',
    foreground: 'var(--success-foreground)',
    subtle: 'var(--success-subtle)',
    border: 'var(--success-border)',
  },
  warning: {
    main: 'var(--warning)',
    foreground: 'var(--warning-foreground)',
    subtle: 'var(--warning-subtle)',
    border: 'var(--warning-border)',
  },
  info: {
    main: 'var(--info)',
    foreground: 'var(--info-foreground)',
    subtle: 'var(--info-subtle)',
    border: 'var(--info-border)',
  },
  progress: {
    main: 'var(--progress)',
    foreground: 'var(--progress-foreground)',
    subtle: 'var(--progress-subtle)',
    border: 'var(--progress-border)',
  },

  // Alternate Colors
  alt1: {
    main: 'var(--alt1)',
    foreground: 'var(--alt1-foreground)',
    subtle: 'var(--alt1-subtle)',
    border: 'var(--alt1-border)',
  },
  alt2: {
    main: 'var(--alt2)',
    foreground: 'var(--alt2-foreground)',
    subtle: 'var(--alt2-subtle)',
    border: 'var(--alt2-border)',
  },
  alt3: {
    main: 'var(--alt3)',
    foreground: 'var(--alt3-foreground)',
    subtle: 'var(--alt3-subtle)',
    border: 'var(--alt3-border)',
  },
  alt4: {
    main: 'var(--alt4)',
    foreground: 'var(--alt4-foreground)',
    subtle: 'var(--alt4-subtle)',
    border: 'var(--alt4-border)',
  },
  alt5: {
    main: 'var(--alt5)',
    foreground: 'var(--alt5-foreground)',
    subtle: 'var(--alt5-subtle)',
    border: 'var(--alt5-border)',
  },

  // Chart Colors
  chart: {
    1: 'var(--chart-1)',
    2: 'var(--chart-2)',
    3: 'var(--chart-3)',
    4: 'var(--chart-4)',
    5: 'var(--chart-5)',
    6: 'var(--chart-6)',
  } as ChartColors,

  // UI Colors
  background: 'var(--background)',
  "background-lighter": 'var(--background-lighter)',
  foreground: 'var(--foreground)',
  card: {
    main: 'var(--card)',
    foreground: 'var(--card-foreground)',
  },
  popover: {
    main: 'var(--popover)',
    foreground: 'var(--popover-foreground)',
  },
  muted: {
    main: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
  },
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',

  // Sidebar Colors
  sidebar: {
    main: 'var(--sidebar)',
    foreground: 'var(--sidebar-foreground)',
    primary: {
      main: 'var(--sidebar-primary)',
      foreground: 'var(--sidebar-primary-foreground)',
    },
    accent: {
      main: 'var(--sidebar-accent)',
      foreground: 'var(--sidebar-accent-foreground)',
    },
    border: 'var(--sidebar-border)',
    ring: 'var(--sidebar-ring)',
  } as SidebarColors,
} as const

// Spacing Scale (4px base unit)
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
} as const

// Border Radius
export const borderRadius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-extraLarge)',
  full: '9999px',
} as const

// Shadows
export const shadows = {
  '2xs': 'var(--shadow-2xs)',
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  base: 'var(--shadow)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-extraLarge)',
  '2xl': 'var(--shadow-2extraLarge)',
} as const

// Typography
export const typography = {
  fontFamily: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  letterSpacing: {
    tighter: 'var(--tracking-tighter)',
    tight: 'var(--tracking-tight)',
    normal: 'var(--tracking-normal)',
    wide: 'var(--tracking-wide)',
    wider: 'var(--tracking-wider)',
    widest: 'var(--tracking-widest)',
  },
} as const

// Component-specific tokens
export const components = {
  button: {
    padding: {
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 24px',
    },
    borderRadius: 'var(--radius)',
  },
  card: {
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
  },
  alert: {
    padding: '16px',
    borderRadius: 'var(--radius)',
  },
} as const

// Type guard to check if a color token has extended properties
function isExtendedColor(token: any): token is ExtendedColorValue {
  return token && typeof token === 'object' && 'main' in token && 'foreground' in token
}

// Utility function to get color value with proper typing
export function getColor(token: ColorToken, variant?: keyof ExtendedColorValue): string {
  const color = colors[token]
  
  if (typeof color === 'string') {
    return color
  }
  
  if (isExtendedColor(color)) {
    return variant ? color[variant] || color.main : color.main
  }
  
  return color.main
}

// Get chart color
export function getChartColor(number: ChartColor): string {
  return colors.chart[number]
}