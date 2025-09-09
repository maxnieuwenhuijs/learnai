Apple-Style Design System
Een minimalistisch, elegant design systeem geïnspireerd door Apple's Human Interface Guidelines. Gericht op rust, ruimte en intuïtieve interacties.

Typografie
Font Stack
system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif

Font Weights
Light (300) - Grote headers

Regular (400) - Body tekst

Medium (500) - Labels

Semibold (600) - Knoppen

Bold (700) - Zeer belangrijk

Type Scale
Main Header (text-4xl)

Section Header (text-3xl)

Subtitle (text-xl)

Large body (text-lg)

Default body (text-base)

Small text (text-sm)

Caption (text-xs)

Kleuren
Grijstinten (Primary Palette)
white (#ffffff)

gray-50 (#f9fafb)

gray-100 (#f3f4f6)

gray-200 (#e5e7eb)

gray-500 (#6b7280)

gray-600 (#4b5563)

gray-700 (#374151)

gray-800 (#1f2937)

gray-900 (#111827)

Accent Kleuren
Blue (Accent): bg-blue-600

Green (Success): bg-green-500

Amber (Warning): bg-amber-600

Componenten
Knoppen
Primary Action: Donkere achtergrond met witte tekst.

Secondary Action: Witte achtergrond met een subtiele rand en donkere tekst.

Icon Button: Lichte grijze achtergrond zonder tekst, alleen een icoon.

Cards
Basic Card: Simpele witte kaart met een subtiele rand en schaduw.

Interactive Card: Reageert op hover en kan een "geselecteerde" staat hebben.

Feature Card: Lichte grijze achtergrond, vaak gebruikt om statistieken of kernfuncties te benadrukken.

Formulier Elementen
Input Field: Strak invoerveld met afgeronde hoeken en een subtiele rand die oplicht bij focus.

Selectie Knoppen: Aangepaste radio- en checkbox-knoppen die de primaire donkere kleur gebruiken om de selectie aan te geven.

Code Voorbeelden
Primary Button Component
<button
  class="bg-gray-900 text-white px-8 py-4
         rounded-xl font-medium transition-all
         duration-200 hover:bg-gray-800
         hover:shadow-md active:scale-98">
  Primary Action
</button>

Tailwind Config (Animatie)
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'pop-in': 'popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
}

Multiple Choice Voorbeeld
Wat is het kernprincipe van dit design system?
Maximale kleur en energie

Complexe, data-rijke interfaces

Minimalisme, witruimte en subtiele interacties

Grote, luide animaties