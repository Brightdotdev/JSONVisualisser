// demo.tsx - Enhanced with shadcn components
'use client'

import { useTheme } from '@/contexts/themeContext'
import { colors, ColorToken, getChartColor, getColor } from '@/lib/designSystemTokens'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'

// Define proper types for the demo
interface ColorInfo {
  name: string
  token: ColorToken
  description: string
}

interface SemanticColorInfo {
  name: string
  token: ColorToken
  description: string
  usage: string[]
  psychology: string
}

interface AlternateColorInfo {
  name: string
  token: ColorToken
  harmony: string
  description: string
  usage: string[]
}

export function DesignSystemDemo() {
  const [activeTab, setActiveTab] = useState('colors')
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen w-[94vw] bg-background text-foreground transition-colors flex item-center 
    justify-start
    ">
      <div className="w-full space-y-8">
        
        {/* Header */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-4xl font-bold">Json Vissualizer Design System</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Current theme: <span className="font-medium capitalize text-foreground">{theme}</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <ThemeSelector theme={theme} onThemeChange={setTheme} />
              </div>
            </div>
            <CardDescription className="text-lg">
              A comprehensive design system built with semantic colors and harmonious palettes
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="colors" className="  text-xs md:text-sm">Colors</TabsTrigger>
            <TabsTrigger value="semantic" className="  text-xs md:text-sm">Semantic Colors</TabsTrigger>
            <TabsTrigger value="alternates" className="  text-xs md:text-sm">Alternate Palette</TabsTrigger>
            <TabsTrigger value="components" className="  text-xs md:text-sm">Components</TabsTrigger>
            <TabsTrigger value="tokens" className="  text-xs md:text-sm">Design Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-8 mt-6">
            <ColorsSection />
          </TabsContent>

          <TabsContent value="semantic" className="space-y-8 mt-6">
            <SemanticColorsSection />
          </TabsContent>

          <TabsContent value="alternates" className="space-y-8 mt-6">
            <AlternateColorsSection />
          </TabsContent>

          <TabsContent value="components" className="space-y-8 mt-6">
            <ComponentsSection />
          </TabsContent>

          <TabsContent value="tokens" className="space-y-8 mt-6">
            <TokensSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}




function ThemeSelector({ theme, onThemeChange }: { theme: string; onThemeChange: (theme: 'dark' | 'light' | 'system') => void }) {
  return (
    <Select value={theme} onValueChange={onThemeChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Colors Section
function ColorsSection() {
  const brandColors: ColorInfo[] = [
    { name: 'Primary', token: 'primary', description: 'Main brand color for primary actions' },
    { name: 'Secondary', token: 'secondary', description: 'Secondary brand color' },
    { name: 'Accent', token: 'accent', description: 'Accent color for highlights' },
    { name: 'Destructive', token: 'destructive', description: 'Error and destructive actions' },
  ]

  const uiColors: ColorInfo[] = [
    { name: 'Background', token: 'background', description: 'Main background color' },
    { name: 'Background (lighter)', token: 'background-lighter', description: 'lighter variant of the background color for depth' },
    { name: 'Foreground', token: 'foreground', description: 'Main text color' },
    { name: 'Card', token: 'card', description: 'Card background color' },
    { name: 'Muted', token: 'muted', description: 'Muted backgrounds' },
    { name: 'Border', token: 'border', description: 'Border and divider colors' },
    { name: 'Input', token: 'input', description: 'Input field backgrounds' },
  ]

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>Core brand identity colors</CardDescription>
        </CardHeader>
        <CardContent>
          <ColorGrid colors={brandColors} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UI Colors</CardTitle>
          <CardDescription>Foundation colors for user interface</CardDescription>
        </CardHeader>
        <CardContent>
          <ColorGrid colors={uiColors} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chart Colors</CardTitle>
          <CardDescription>Distinct colors for data visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <ColorCard
                key={num}
                name={`Chart ${num}`}
                color={getChartColor(num.toString() as any)}
                textColor={getColor('background')}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Semantic Colors Section
function SemanticColorsSection() {
  const semanticColors: SemanticColorInfo[] = [
    {
      name: 'Success',
      token: 'success',
      description: 'Positive actions, completion states',
      usage: ['Submit buttons', 'Completion badges', 'Positive metrics'],
      psychology: 'Trust, growth, security',
    },
    {
      name: 'Warning',
      token: 'warning',
      description: 'Cautionary states, attention needed',
      usage: ['Warning alerts', 'Unsaved changes', 'Medium priority'],
      psychology: 'Energy, caution, optimism',
    },
    {
      name: 'Info',
      token: 'info',
      description: 'Informational content, neutral states',
      usage: ['Tooltips', 'Instructional text', 'Neutral notifications'],
      psychology: 'Clarity, communication, calmness',
    },
    {
      name: 'Progress',
      token: 'progress',
      description: 'Ongoing processes, loading states',
      usage: ['Progress bars', 'Loading indicators', 'Status updates'],
      psychology: 'Movement, process, innovation',
    },
  ]

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Semantic Colors</CardTitle>
          <CardDescription>
            Colors with specific psychological meanings and use cases. Each semantic color conveys a particular message and emotional response.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {semanticColors.map((color) => (
          <SemanticColorCard key={color.token} color={color} />
        ))}
      </div>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <Badge variant="outline" className="bg-success-subtle text-success-foreground">Do</Badge>
                Recommended Usage
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-success rounded-full mt-1.5 flex-shrink-0" />
                  <span>Use success colors only for positive, completed actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-success rounded-full mt-1.5 flex-shrink-0" />
                  <span>Reserve warning colors for medium-priority attention needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-success rounded-full mt-1.5 flex-shrink-0" />
                  <span>Use info colors for neutral, informational content</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-success rounded-full mt-1.5 flex-shrink-0" />
                  <span>Apply progress colors to ongoing processes</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <Badge variant="outline" className="bg-destructive-subtle text-destructive-foreground">Don't</Badge>
                Usage to Avoid
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0" />
                  <span>Use semantic colors for decorative purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0" />
                  <span>Mix semantic color meanings (e.g., success for warnings)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0" />
                  <span>Overuse warning colors - reserve for actual cautions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0" />
                  <span>Use progress colors for completed states</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Alternate Colors Section
function AlternateColorsSection() {
  const alternateColors: AlternateColorInfo[] = [
    {
      name: 'Alt 1 - Complementary',
      token: 'alt1',
      harmony: 'Complementary (180° from primary)',
      description: 'High contrast complementary color',
      usage: ['Secondary CTAs', 'Marketing sections', 'High-impact elements'],
    },
    {
      name: 'Alt 2 - Analogous',
      token: 'alt2', 
      harmony: 'Analogous (-30° from primary)',
      description: 'Harmonious analogous color',
      usage: ['Category badges', 'Decorative elements', 'Subtle accents'],
    },
    {
      name: 'Alt 3 - Analogous', 
      token: 'alt3',
      harmony: 'Analogous (+30° from primary)',
      description: 'Harmonious analogous color',
      usage: ['Tags', 'Status indicators', 'Visual variety'],
    },
    {
      name: 'Alt 4 - Split Complementary',
      token: 'alt4',
      harmony: 'Split Complementary (+150° from primary)',
      description: 'Balanced split complementary',
      usage: ['Marketing graphics', 'Data visualization', 'Brand extensions'],
    },
    {
      name: 'Alt 5 - Tetradic',
      token: 'alt5',
      harmony: 'Tetradic (+90° from primary)',
      description: 'Tetradic color for diversity',
      usage: ['Charts', 'Illustrations', 'Creative elements'],
    },
  ]

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Alternate Color Palette</CardTitle>
          <CardDescription>
            Harmonious color extensions generated from your primary brand color using color theory principles.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {alternateColors.map((color) => (
          <AlternateColorCard key={color.token} color={color} />
        ))}
      </div>

      {/* Color Theory Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Color Theory Basis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Complementary</Badge>
              <p className="text-sm text-muted-foreground">Colors opposite on the color wheel. Creates high contrast and visual interest.</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Analogous</Badge>
              <p className="text-sm text-muted-foreground">Colors next to each other. Creates harmonious and comfortable schemes.</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Split Complementary</Badge>
              <p className="text-sm text-muted-foreground">A color plus the two adjacent to its complement. High contrast but less tension.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Components Section
function ComponentsSection() {
  const { theme } = useTheme()
  
  return (
    <div className="space-y-8">
      {/* Theme Info */}
      <Card>
        <CardHeader>
          <CardTitle>Component Showcase</CardTitle>
          <CardDescription>
            Current theme: <Badge variant="outline" className="ml-2 capitalize">{theme}</Badge>
          </CardDescription>
          <CardDescription>
            All components automatically adapt to the current theme using CSS variables.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Solid Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Solid Button Variants</CardTitle>
          <CardDescription>Primary button styles with semantic and alternate colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { variant: 'default' as const, label: 'Primary' },
              { variant: 'success' as const, label: 'Success' },
              { variant: 'warning' as const, label: 'Warning' },
              { variant: 'info' as const, label: 'Info' },
              { variant: 'progress' as const, label: 'Progress' },
              { variant: 'alt1' as const, label: 'Alt 1' },
              { variant: 'alt2' as const, label: 'Alt 2' },
              { variant: 'alt3' as const, label: 'Alt 3' },
            ].map(({ variant, label }) => (
              <Button
                key={variant}
                variant={variant}
                className="transition-all hover:scale-105 active:scale-95"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outline Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Outline Button Variants</CardTitle>
          <CardDescription>Secondary button styles with bordered appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { variant: 'outline' as const, label: 'Outline' },
              { variant: 'outline-success' as const, label: 'Success' },
              { variant: 'outline-warning' as const, label: 'Warning' },
              { variant: 'outline-info' as const, label: 'Info' },
              { variant: 'outline-progress' as const, label: 'Progress' },
            ].map(({ variant, label }) => (
              <Button
                key={variant}
                variant={variant}
                className="transition-all hover:scale-105 active:scale-95"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ghost Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Ghost Button Variants</CardTitle>
          <CardDescription>Subtle button styles for less prominent actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { variant: 'ghost' as const, label: 'Ghost' },
              { variant: 'ghost-success' as const, label: 'Success' },
              { variant: 'ghost-warning' as const, label: 'Warning' },
              { variant: 'ghost-info' as const, label: 'Info' },
              { variant: 'ghost-progress' as const, label: 'Progress' },
            ].map(({ variant, label }) => (
              <Button
                key={variant}
                variant={variant}
                className="transition-all hover:scale-105 active:scale-95"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants</CardTitle>
          <CardDescription>Different button sizes for various contexts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {[
              { size: 'sm' as const, label: 'Small' },
              { size: 'default' as const, label: 'Default' },
              { size: 'lg' as const, label: 'Large' },
            ].map(({ size, label }) => (
              <Button
                key={size}
                variant="success"
                size={size}
                className="transition-all hover:scale-105 active:scale-95"
              >
                {label}
              </Button>
            ))}
            <Button
              variant="warning"
              size="icon"
              className="transition-all hover:scale-105 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive States */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive States</CardTitle>
          <CardDescription>Different button states and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="success" className="hover:scale-105 active:scale-95">
              Hover & Active
            </Button>
            <Button variant="info" disabled>
              Disabled
            </Button>
            <Button variant="warning" className="focus:ring-2 focus:ring-warning">
              Focus State
            </Button>
            <Button variant="alt1" data-state="open">
              Data State
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tokens Section
function TokensSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>CSS Custom Properties</CardTitle>
          <CardDescription>All design tokens available as CSS variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-6 font-mono text-sm">
            <pre className="overflow-x-auto">
{`:root {
  /* Brand Colors */
  --primary: oklch(0.5393 0.2713 286.7462);
  --primary-foreground: oklch(1.0000 0 0);
  
  /* Semantic Colors */
  --success: oklch(0.5964 0.1450 163.2252);
  --success-foreground: oklch(0.9850 0 0);
  
  /* Alternate Colors */
  --alt1: oklch(0.5893 0.1983 106.7462);
  --alt1-foreground: oklch(0.1500 0 0);
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Using CSS Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <pre>
{`.success-button {
  background: var(--success);
  color: var(--success-foreground);
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Using TypeScript Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm">
              <pre>
{`import { colors } from './tokens'

const styles = {
  background: colors.success.main,
  color: colors.success.foreground
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Utility Components
function ColorGrid({ colors }: { colors: ColorInfo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {colors.map((color) => (
        <ColorCard
          key={color.token}
          name={color.name}
          color={getColor(color.token)}
          description={color.description}
        />
      ))}
    </div>
  )
}

function ColorCard({ name, color, description, textColor = 'var(--foreground)' }: { name: string; color: string; description?: string; textColor?: string }) {
  return (
    <Card className="overflow-hidden border-border">
      <div 
        className="h-20 flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <Badge variant="secondary" className="bg-black/10 text-foreground backdrop-blur-sm">
          {name}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-foreground mb-1">{name}</h4>
        {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{color}</code>
      </CardContent>
    </Card>
  )
}

function SemanticColorCard({ color }: { color: SemanticColorInfo }) {
  const colorData = colors[color.token] as any

  return (
    <Card className="border-border overflow-hidden">
      <div className="grid md:grid-cols-4">
        {/* Color Swatches */}
        <div className="md:col-span-1">
          <div className="h-32" style={{ backgroundColor: colorData.main }}>
            <div className="h-full flex items-center justify-center text-white font-medium">
              Main
            </div>
          </div>
          <div className="h-16" style={{ backgroundColor: colorData.subtle }}>
            <div className="h-full flex items-center justify-center text-foreground text-sm">
              Subtle
            </div>
          </div>
          <div className="h-12 border-t" style={{ backgroundColor: colorData.border }}>
            <div className="h-full flex items-center justify-center text-foreground text-xs">
              Border
            </div>
          </div>
        </div>
        
        {/* Information */}
        <div className="md:col-span-3 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <CardTitle className="text-xl mb-2">{color.name}</CardTitle>
              <CardDescription>{color.description}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-muted">
              {color.psychology}
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Usage Examples</h4>
              <ul className="space-y-2 text-sm">
                {color.usage.map((use: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">{use}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">CSS Variables</h4>
              <div className="space-y-2 text-sm font-mono">
                <code className="block text-muted-foreground bg-muted px-2 py-1 rounded">--{color.token.toLowerCase()}</code>
                <code className="block text-muted-foreground bg-muted px-2 py-1 rounded">--{color.token.toLowerCase()}-foreground</code>
                <code className="block text-muted-foreground bg-muted px-2 py-1 rounded">--{color.token.toLowerCase()}-subtle</code>
                <code className="block text-muted-foreground bg-muted px-2 py-1 rounded">--{color.token.toLowerCase()}-border</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function AlternateColorCard({ color }: { color: AlternateColorInfo }) {
  const colorData = colors[color.token] as any

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{color.name}</CardTitle>
            <CardDescription>{color.description}</CardDescription>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {color.harmony}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="h-16 rounded-lg border" style={{ backgroundColor: colorData.main }}>
            <div className="h-full flex items-center justify-center text-white text-sm font-medium">
              Main
            </div>
          </div>
          <div className="h-16 rounded-lg border" style={{ backgroundColor: colorData.subtle }}>
            <div className="h-full flex items-center justify-center text-foreground text-sm">
              Subtle
            </div>
          </div>
          <div className="h-16 rounded-lg border" style={{ backgroundColor: colorData.border }}>
            <div className="h-full flex items-center justify-center text-foreground text-sm">
              Border
            </div>
          </div>
          <div className="h-16 rounded-lg border bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Usage</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Recommended Usage</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {color.usage.map((use: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                <span className="text-muted-foreground">{use}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default DesignSystemDemo    