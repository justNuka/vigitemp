# Vigitemp Light - Design Guidelines

## Design Approach
**System-Based Professional UI** - Function-first monitoring application inspired by modern data visualization tools (Grafana, Linear) with clean, accessible interfaces optimized for laboratory professionals requiring 24/7 monitoring capabilities.

## Core Design Principles

### Visual Identity
- **Style**: Modern, minimal, professional with subtle glassmorphism
- **Forms**: Rounded corners throughout (rounded-lg to rounded-xl)
- **Transparency**: Light backdrop blur effects on cards and overlays (bg-white/80 dark:bg-gray-900/80)
- **Airiness**: Generous whitespace, never cramped interfaces
- **Animation Philosophy**: Purposeful micro-interactions only - no decorative effects

### Brand Elements
- **Logo**: ViGiTEMP minimalist geometric design (thin lines, horizontal E-bar)
- **Primary Colors**: 
  - Blue MC2 (Professional credibility): `#3B82F6` (primary actions, headers)
  - Yellow/Amber (Differentiation): `#F59E0B` (alerts, upgrade prompts, accent)
- **Palette Accents**:
  - `#8BDED8` (Teal - info states)
  - `#DCE0BF` (Sage - success states)
  - `#AD7385` (Mauve - warning states)
  - `#EEDCE5` (Blush - light backgrounds)
  - `#6A5E51` (Taupe - neutral text)
  - `#EDE2D1` (Cream - light cards)

### Dark/Light Theme Implementation
- Use next-themes with CSS class strategy
- Semantic color variables for theme switching
- Maintain WCAG AA contrast ratios in both themes
- Dark mode: Deep grays (#0f172a, #1e293b), not pure black
- Light mode: Off-white backgrounds (#f8fafc, #f1f5f9)

## Typography System

### Font Families
- **Primary**: Inter (via Google Fonts CDN) - UI text, data displays
- **Monospace**: JetBrains Mono - sensor values, timestamps, technical data

### Hierarchy
- **H1**: text-3xl md:text-4xl font-bold (Page titles)
- **H2**: text-2xl md:text-3xl font-semibold (Section headers)
- **H3**: text-xl md:text-2xl font-semibold (Card titles)
- **Body**: text-sm md:text-base (Primary content)
- **Small**: text-xs md:text-sm (Metadata, timestamps)
- **Data Display**: text-2xl md:text-3xl font-mono font-bold (Sensor readings)

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistency
- Component padding: p-4 md:p-6
- Section spacing: space-y-6 md:space-y-8
- Card gaps: gap-4 md:gap-6
- Page margins: mx-4 md:mx-6 lg:mx-8

### Grid Structure
- **Dashboard**: 12-column responsive grid
- **Surveillance Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- **Alarm Tables**: Full-width with horizontal scroll on mobile
- **Settings Forms**: max-w-2xl centered

### Containers
- Max width: max-w-7xl for main content
- Sidebars: w-64 md:w-72 (collapsible on mobile)
- Modal dialogs: max-w-lg to max-w-2xl depending on content

## Component Library

### Navigation
- **Sidebar**: Fixed left navigation, collapsible with hamburger on mobile, glassmorphism effect
- **Top Bar**: Sticky header with breadcrumbs, user menu, theme toggle, alarm status indicator
- **Mobile**: Bottom tab bar for core functions (Dashboard, Surveillance, Alarms)

### Data Display
- **Status Cards**: Glassmorphic cards with icon, value, label, trend indicator
- **Sensor Cards**: Real-time value display with min/max consignes, color-coded status (green/amber/red)
- **Alarm Tables**: Striped rows, sortable columns, inline actions, badge status indicators
- **Charts**: Chart.js line graphs with zoom/pan controls, time-series data, threshold annotations

### Forms & Inputs
- **Text Inputs**: heroui Input with label, helper text, error states
- **Selectors**: heroui Select with search capability
- **Toggles**: heroui Switch for alarm mute, settings
- **Buttons**: 
  - Primary: Blue gradient with subtle shadow
  - Secondary: Border with transparent background
  - Danger: Red for critical actions (alarm ack)
  - Icon buttons: Lucide-react icons, rounded-full

### Alerts & Notifications
- **Toast**: Sonner toasts for system notifications (top-right)
- **Alarm Banners**: Persistent top banner for active critical alarms (red background, pulse animation)
- **Status Badges**: Pill-shaped with background color matching severity
- **Modals**: shadcn Dialog with backdrop blur

### Monitoring-Specific Components
- **Real-Time Value Display**: Large monospace numbers with unit suffix, color-coded background
- **Threshold Indicators**: Visual min/max markers on value displays
- **Time Series Graph**: Chart.js with configurable zoom, annotation plugin for thresholds
- **Alarm Timeline**: Chronological list with timestamp, location, sensor, value, duration

## Accessibility Standards

### WCAG Compliance
- Maintain AA level contrast (4.5:1 for normal text, 3:1 for large)
- Keyboard navigation for all interactive elements (tab order, focus rings)
- ARIA labels on all icons and data visualizations
- Screen reader announcements for alarm state changes
- Focus visible: ring-2 ring-offset-2 ring-blue-500

### Interactive States
- Focus: Visible ring with offset
- Hover: Subtle background change, cursor pointer
- Active: Slight scale transform (scale-[0.98])
- Disabled: opacity-50 cursor-not-allowed

## Animation Guidelines

### Approved Animations
- **Page Transitions**: Fade-in on route change (framer-motion)
- **Data Updates**: Subtle pulse on sensor value change
- **Loading States**: Spinner or skeleton loaders (heroui Skeleton)
- **Alarm Trigger**: Single flash + border pulse (critical only)

### Duration & Easing
- Micro-interactions: 150-200ms ease-in-out
- Page transitions: 300ms ease-out
- Data refresh: Instant with subtle highlight fade

### Forbidden Effects
- No parallax scrolling
- No scroll-triggered animations
- No decorative particle effects
- No autoplay carousels

## Responsive Strategy

### Mobile-First Breakpoints
- Base (mobile): 0-640px - Single column, bottom navigation, condensed data cards
- sm: 640px+ - Two-column grids where appropriate
- md: 768px+ - Sidebar visible, three-column grids
- lg: 1024px+ - Full desktop layout, expanded data tables
- xl: 1280px+ - Wider containers, more horizontal space

### Critical Mobile Adaptations
- Collapsible sidebar → hamburger menu
- Tables → horizontal scroll or card view
- Charts → touch-friendly zoom/pan
- Forms → stacked inputs with large touch targets (min-h-12)

## Images
**Minimal Image Usage** - This is a data-focused application:
- No hero images (utility app, not marketing)
- Icon-only approach with Lucide React library
- Optional: Company logo in top-left sidebar
- Optional: Empty state illustrations for zero-data scenarios (simple line art)
- Charts and data visualizations replace traditional imagery

## Internationalization
- French (primary, complete)
- English (secondary, in development - show "En développement" chip next to language toggle)
- Use i18n-ready component structure with translation keys
- Number/date formatting respects locale (FR: dd/mm/yyyy, EN: mm/dd/yyyy)