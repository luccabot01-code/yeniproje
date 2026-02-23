import { Inter } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const themeFonts: Record<string, { variable: string; family: string }> = {
    default: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    minimalist: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    rustic: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    floral: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    ocean: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    vintage: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    lavender: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    emerald: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
    midnight: { variable: inter.variable, family: 'var(--font-geist-sans), sans-serif' },
}

export type ThemeStyle = 'default' | 'minimalist' | 'rustic' | 'floral' | 'ocean' | 'vintage' | 'lavender' | 'emerald' | 'midnight'
