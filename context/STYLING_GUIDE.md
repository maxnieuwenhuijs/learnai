# 🎨 Agentschap Design System - Styling Guide

## 📋 Overzicht
Deze gids bevat alle styling patterns, kleuren en componenten uit het Agentschap Design System, geoptimaliseerd voor gebruik met **Tailwind CSS** en **shadcn/ui**.

---

## 🎯 Kleurenschema

### Core Kleuren
```css
/* Primary (Blauw) - Intelligence & Stability */
--primary-100: #DBEAFE
--primary-200: #BFDBFE  
--primary-300: #93C5FD
--primary-400: #3B82F6
--primary-500: #1E3A8A  /* Main brand color */
--primary-600: #1E40AF
--primary-700: #1D4ED8
--primary-800: #1E3A8A
--primary-900: #1E293B

/* Secondary (Rood) - Passion & Energy */
--secondary-100: #FEE2E2
--secondary-200: #FECACA
--secondary-300: #FCA5A5
--secondary-400: #EF4444
--secondary-500: #B91C1C  /* Main secondary */
--secondary-600: #DC2626
--secondary-700: #991B1B
--secondary-800: #7F1D1D
--secondary-900: #450A0A

/* Accent (Geel) - Innovation & Optimism */
--accent-100: #FEF3C7
--accent-200: #FDE68A
--accent-300: #FDE68A
--accent-400: #F59E0B
--accent-500: #D97706  /* Main accent */
--accent-600: #B45309
--accent-700: #92400E
--accent-800: #78350F
--accent-900: #451A03
```

### Semantic Kleuren
```css
/* Success */
--success-300: #6EE7B7
--success-500: #10B981
--success-700: #047857

/* Warning */
--warning-300: #FCD34D
--warning-500: #F59E0B
--warning-700: #B45309

/* Error */
--error-300: #FCA5A5
--error-500: #EF4444
--error-700: #B91C1C

/* Info */
--info-300: #93C5FD
--info-500: #3B82F6
--info-700: #1D4ED8
```

---

## 🔘 Button Componenten

### Primary Button
```tsx
// Standaard Primary Button
<button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-primary-500 hover:border-primary-600 active:border-primary-700">
  Primary Button
</button>

// Primary Ghost Button
<button className="px-6 py-3 bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-600 hover:text-primary-700 active:text-primary-800 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-primary-500 hover:border-primary-600 active:border-primary-700">
  Primary Ghost
</button>
```

### Secondary Button
```tsx
// Standaard Secondary Button
<button className="px-6 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 hover:text-gray-800 active:text-gray-900 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-gray-300 hover:border-gray-400 active:border-gray-500">
  Secondary Button
</button>

// Secondary Ghost Button
<button className="px-6 py-3 bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-600 hover:text-gray-700 active:text-gray-800 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-gray-300 hover:border-gray-400 active:border-gray-500">
  Secondary Ghost
</button>
```

### Danger Button
```tsx
// Standaard Danger Button
<button className="px-6 py-3 bg-error-500 hover:bg-error-600 active:bg-error-700 text-white rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 border border-error-500 hover:border-error-600 active:border-error-700">
  Danger Button
</button>

// Danger Ghost Button
<button className="px-6 py-3 bg-transparent hover:bg-error-50 active:bg-error-100 text-error-600 hover:text-error-700 active:text-error-800 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 border border-error-500 hover:border-error-600 active:border-error-700">
  Danger Ghost
</button>
```

### Button Groottes
```tsx
// Small
<button className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-primary-500 hover:border-primary-600">
  Small
</button>

// Medium (default)
<button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-primary-500 hover:border-primary-600">
  Medium
</button>

// Large
<button className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white text-lg rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-primary-500 hover:border-primary-600">
  Large
</button>
```

---

## 🃏 Card Componenten

### Basic Card
```tsx
<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
  <h3 className="text-h4 text-gray-900 mb-4">Card Title</h3>
  <p className="text-gray-600">Card content goes here...</p>
</div>
```

### Interactive Card
```tsx
<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer">
  <h3 className="text-h4 text-gray-900 mb-4">Interactive Card</h3>
  <p className="text-gray-600">Hover me for effects...</p>
</div>
```

### Feature Card met Gradient
```tsx
<div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200 shadow-sm hover:shadow-md transition-all duration-200">
  <div className="w-12 h-12 bg-primary-500 rounded-lg mb-4 flex items-center justify-center">
    <span className="text-white text-xl">🚀</span>
  </div>
  <h3 className="text-h4 text-primary-900 mb-2">Feature Title</h3>
  <p className="text-primary-700">Feature description...</p>
</div>
```

---

## 📝 Form Componenten

### Text Input
```tsx
// Standaard Input
<input 
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
  placeholder="Enter text..."
/>

// Input met Label
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Label
  </label>
  <input 
    type="text"
    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
    placeholder="Enter text..."
  />
</div>
```

### Select Dropdown
```tsx
<select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white">
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

### Textarea
```tsx
<textarea 
  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-vertical"
  rows={4}
  placeholder="Enter your message..."
/>
```

### Checkbox
```tsx
<label className="flex items-center space-x-3 cursor-pointer">
  <input 
    type="checkbox"
    className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
  />
  <span className="text-gray-700">Checkbox label</span>
</label>
```

### Form States
```tsx
// Error State
<input 
  type="text"
  className="w-full px-4 py-3 border border-error-300 rounded-md focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-error-500 transition-all duration-200"
  placeholder="Error state..."
/>
<p className="mt-1 text-sm text-error-600">Error message</p>

// Success State
<input 
  type="text"
  className="w-full px-4 py-3 border border-success-300 rounded-md focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all duration-200"
  placeholder="Success state..."
/>
<p className="mt-1 text-sm text-success-600">Success message</p>

// Disabled State
<input 
  type="text"
  disabled
  className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
  placeholder="Disabled input..."
/>
```

---

## 🧭 Navigation Componenten

### Tab Navigation
```tsx
<div className="border-b border-gray-200">
  <nav className="flex space-x-8">
    <button className="py-4 px-1 border-b-2 border-primary-500 text-primary-600 font-medium">
      Active Tab
    </button>
    <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium">
      Inactive Tab
    </button>
  </nav>
</div>
```

### Breadcrumbs
```tsx
<nav className="flex" aria-label="Breadcrumb">
  <ol className="flex items-center space-x-2">
    <li>
      <a href="#" className="text-gray-500 hover:text-gray-700">Home</a>
    </li>
    <li className="flex items-center">
      <span className="mx-2 text-gray-400">/</span>
      <a href="#" className="text-gray-500 hover:text-gray-700">Section</a>
    </li>
    <li className="flex items-center">
      <span className="mx-2 text-gray-400">/</span>
      <span className="text-gray-900">Current</span>
    </li>
  </ol>
</nav>
```

### Pagination
```tsx
<nav className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <button className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
      Previous
    </button>
    <button className="px-3 py-2 text-white bg-primary-500 border border-primary-500 rounded-md">
      1
    </button>
    <button className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
      2
    </button>
    <button className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
      Next
    </button>
  </div>
</nav>
```

---

## 📊 Data Display Componenten

### Statistics Card
```tsx
<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
  <div className="flex items-center">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
        <span className="text-primary-600 text-lg">📈</span>
      </div>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
      <p className="text-2xl font-semibold text-gray-900">€45,231</p>
    </div>
  </div>
</div>
```

### Progress Bar
```tsx
<div className="w-full">
  <div className="flex justify-between text-sm text-gray-600 mb-2">
    <span>Progress</span>
    <span>75%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{width: '75%'}}></div>
  </div>
</div>
```

### Badge/Tag
```tsx
// Primary Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
  Primary
</span>

// Success Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
  Success
</span>

// Warning Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
  Warning
</span>

// Error Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
  Error
</span>
```

### Alert Messages
```tsx
// Success Alert
<div className="rounded-md bg-success-50 p-4 border border-success-200">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-success-400">✅</span>
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-success-800">Success message</p>
    </div>
  </div>
</div>

// Warning Alert
<div className="rounded-md bg-warning-50 p-4 border border-warning-200">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-warning-400">⚠️</span>
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-warning-800">Warning message</p>
    </div>
  </div>
</div>

// Error Alert
<div className="rounded-md bg-error-50 p-4 border border-error-200">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-error-400">❌</span>
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-error-800">Error message</p>
    </div>
  </div>
</div>
```

---

## 🎨 Typography

### Headings
```tsx
<h1 className="text-h1 text-gray-900 font-bold">Heading 1</h1>
<h2 className="text-h2 text-gray-900 font-semibold">Heading 2</h2>
<h3 className="text-h3 text-gray-800 font-semibold">Heading 3</h3>
<h4 className="text-h4 text-gray-800 font-medium">Heading 4</h4>
<h5 className="text-h5 text-gray-700 font-medium">Heading 5</h5>
<h6 className="text-h6 text-gray-700 font-medium">Heading 6</h6>
```

### Body Text
```tsx
<p className="text-body text-gray-700">Regular body text</p>
<p className="text-body-small text-gray-600">Small body text</p>
<p className="text-caption text-gray-500">Caption text</p>
```

---

## 🔧 Utility Classes

### Spacing
```tsx
// Padding
className="p-1 p-2 p-3 p-4 p-6 p-8 p-12 p-16 p-20 p-24"
className="px-1 px-2 px-3 px-4 px-6 px-8 px-12 px-16 px-20 px-24"
className="py-1 py-2 py-3 py-4 py-6 py-8 py-12 py-16 py-20 py-24"

// Margin
className="m-1 m-2 m-3 m-4 m-6 m-8 m-12 m-16 m-20 m-24"
className="mx-1 mx-2 mx-3 mx-4 mx-6 mx-8 mx-12 mx-16 mx-20 mx-24"
className="my-1 my-2 my-3 my-4 my-6 my-8 my-12 my-16 my-20 my-24"
```

### Transitions
```tsx
// Basis transitions
className="transition-all duration-200"
className="transition-colors duration-300"
className="transition-transform duration-200"

// Hover effects
className="hover:scale-105 hover:shadow-lg"
className="hover:bg-primary-50 hover:text-primary-700"
```

### Focus States
```tsx
// Focus ring
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"

// Focus border
className="focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
```

---

## 📱 Responsive Design

### Breakpoints
```tsx
// Mobile first approach
className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4"

// Responsive text
className="text-sm md:text-base lg:text-lg xl:text-xl"

// Responsive spacing
className="p-4 md:p-6 lg:p-8 xl:p-12"
```

---

## 🚀 Integratie met shadcn/ui

### Button Component
```tsx
import { Button } from "@/components/ui/button"

// Primary Button
<Button className="bg-primary-500 hover:bg-primary-600 text-white border-primary-500 hover:border-primary-600">
  Primary Button
</Button>

// Secondary Button
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  Secondary Button
</Button>

// Danger Button
<Button className="bg-error-500 hover:bg-error-600 text-white border-error-500 hover:border-error-600">
  Danger Button
</Button>
```

### Card Component
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
  <CardHeader>
    <CardTitle className="text-gray-900">Card Title</CardTitle>
    <CardDescription className="text-gray-600">Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-gray-700">Card content...</p>
  </CardContent>
</Card>
```

---

## 📋 Tailwind Config

Voeg dit toe aan je `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#DBEAFE',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#3B82F6',
          500: '#1E3A8A',
          600: '#1E40AF',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#1E293B',
        },
        secondary: {
          50: '#FEE2E2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#EF4444',
          500: '#B91C1C',
          600: '#DC2626',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        accent: {
          50: '#FEF3C7',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FDE68A',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '2.5rem' }],
        'h2': ['1.875rem', { lineHeight: '2.25rem' }],
        'h3': ['1.5rem', { lineHeight: '2rem' }],
        'h4': ['1.25rem', { lineHeight: '1.75rem' }],
        'h5': ['1.125rem', { lineHeight: '1.75rem' }],
        'h6': ['1rem', { lineHeight: '1.5rem' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        'body-small': ['0.875rem', { lineHeight: '1.25rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
```

---

## 💡 Best Practices

1. **Consistentie**: Gebruik altijd dezelfde kleuren en spacing
2. **Accessibility**: Zorg voor voldoende contrast en focus states
3. **Responsive**: Begin altijd met mobile-first design
4. **Performance**: Gebruik Tailwind's JIT compiler voor optimale bundle size
5. **Documentatie**: Houd je component library up-to-date

---

## 🔗 Nuttige Links

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Carbon Design System](https://carbondesignsystem.com/)
- [Agentschap Brand Guidelines](./design-system/brand-guidelines/)

---

*Deze gids is gebaseerd op het Agentschap Design System en kan worden gebruikt als referentie voor alle projecten die Tailwind CSS en shadcn/ui implementeren.*
