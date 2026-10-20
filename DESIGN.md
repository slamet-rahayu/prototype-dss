# Design Direction: CareerPath TI

> Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi
> Berbasis Simple Additive Weighting (SAW) & Model Minat Holland RIASEC

---

## 1. Direction & Design Read

**Design Read**:
Reading this as: University Academic Decision Support System for IT Career Guidance for undergraduate students and academic advisors, in a structured institutional-editorial style, dial **ENERGY 1 / RHYTHM 2 / MOTION 1**.

- **ENERGY 1 (Calm)**: Grounded, trustworthy, academic authority. No tech-startup hype, no floating colored glow orbs, no pulsating badges.
- **RHYTHM 2 (Balanced)**: Disciplined section grids with purposeful breaks: metrics summaries, Holland Hexagon test flows, and transparent SAW formula ranking tables.
- **MOTION 1 (Calm Interaction)**: Immediate, crisp hover and focus transitions (150-200ms). Zero infinite animations, zero auto-pulsing dots, zero bouncy entrance tricks.

---

## 2. Visual Palette (R-29 Compliant)

Strict limit of 2 core colors, 1 neutral scale, and 1 deliberate accent:

| Role | Color Name | Hex (Light) | Hex (Dark) | Purpose & Usage |
|---|---|---|---|---|
| **Core 1** | Institutional Midnight Navy | `#0f172a` | `#f8fafc` (text) / `#0a0f1d` (canvas) | Brand foundation, primary text, high-contrast structural identity |
| **Core 2** | Academic Royal Blue | `#1d4ed8` | `#60a5fa` (text) / `#1d4ed8` (CTA) | **Primary Color**: interactive buttons, navigation active state, primary links (6.70:1 contrast) |
| **Accent** | Warm Ochre / Amber | `#d97706` | `#f59e0b` | **One deliberate accent**: reserved exclusively for #1 recommended career rank, top match score badge, and attention alerts |
| **Neutral Canvas** | Clean Slate | `#f8fafc` | `#0a0f1d` | Page background canvas with zero background grid or noise |
| **Neutral Surface** | Crisp Card Surface | `#ffffff` | `#111a2e` | Elevated card and container background |
| **Neutral Border** | Structural Divider | `#e2e8f0` | `#1f3052` | 1px clean separation borders |

---

## 3. Typography & Numerical Representation (R-06 & R-31)

- **Primary Typeface**: Inter / System Sans-Serif (`ui-sans-serif, system-ui, sans-serif`).
- **Headings**: Semibold (600) and Bold (700). No oversized tracking, no terminal-style monospace headings.
- **Tabular Data**: `font-mono tabular-nums` used strictly for:
  - SAW preference scores ($V_i$)
  - Normalized criteria values ($R_{i1}, R_{i2}, R_{i3}$)
  - Academic course percentage grades and GPA
- **No Em Dashes (`—`)**: Strict compliance with R-02. Use commas, colons, or parentheses.

---

## 4. Identity Motif & Iconography (R-04 & R-20)

- **Emblem**: Clean geometric compass/pathway mark (four interconnected orientation nodes) representing career orientation and decision pathways.
- **No Generic AI Glyphs**: Banned: Sparkles (`✦`, `✨`), Magic Wands, Orbs, Lightning bolts.
- **Icons**: Lucide icons used strictly with purpose and matched stroke weight (`1.75px`), chosen for exact semantics (e.g., `Compass` for exploration, `Layers` for criteria, `CheckCircle` for verification).

---

## 5. Decision Science Craftsmanship (C-1 to C-5 & R-31)

1. **Transparent SAW Formulation**:
   Instead of vague "AI recommendations", the system explicitly displays the mathematical components:
   $$V_i = \sum_{j=1}^{n} w_j \cdot R_{ij}$$
   - $C_1$: Skor Kesesuaian Minat RIASEC ($w_1$)
   - $C_2$: Skor Kemampuan Akademik Terkait ($w_2$)
   - $C_3$: Skor Kebutuhan Pasar Kerja ($w_3$)
2. **Honest States (R-27)**:
   - Clear empty states indicating exactly what data is missing (e.g. "Tes RIASEC belum diselesaikan" with a direct button to start).
   - Clear loading and calculation feedback.
3. **Resilient Dual Themes (R-21 & R-34)**:
   - Both Light and Dark themes implemented natively with high-contrast WCAG AA standards (4.5:1 text, 3:1 graphical elements).
   - Zero hacky `.dark .bg-slate-50:not(...)` CSS patching (R-33 compliant).
4. **Accessible Keyboard Navigation (R-32)**:
   - Visible `:focus-visible` ring on every button, radio, and input.
   - Escape closes all modals. Tab order strictly follows visual hierarchy.
