# Bliz Widget Studio — Developer Guide

Welcome to the **Bliz Widget Studio**. This playground is designed to help you build, test, and package high-fidelity gamified widgets for the Bliz platform using the `@blizcc/ui` library.

---

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Launch Preview Environment**:
   ```bash
   pnpm dev
   ```
3. **Open Explorer**: Visit `http://localhost:5173` to see your widgets in action.

---

## 🏗 Workflow: Building a Widget

We use automation scripts to keep widget architecture consistent across projects.

### 1. Generating a New Widget
Run the creation script to scaffold a new widget:
```bash
./create.sh
```
- **Prompt**: Enter a unique key (e.g., `lucky-wheel`).
- **Effect**: Creates a new folder in `src/widgets/[key]/` with:
  - `content.tsx`: The primary UI and animation logic (Stateless).
  - `schema.ts`: Standardized configuration and default props.

### 2. Developing in the Playground
The playground is configured to load your widget into a **centered preview container**. 
- Update `src/App.tsx` and render your specific widget component.
- Import your `SCHEMA` in `App.tsx` and spread it into the component props.
- All changes to your files will reflect instantly in the browser.

---

## 🧩 Widget Architecture

We follow a strict **Dual-File Pattern** to ensure widgets are portable and compatible with the Bliz Admin Studio.

### 1. The Content Layer (`content.tsx`)
This file contains the UI, hooks, and game mechanics. It should be **stateless** regarding configuration—meaning it receives its themes, texts, and promos as props.
- **Hooks**: Use `@blizcc/ui` hooks (e.g., `useGameSession`, `useAudio`) for orchestration.
- **Responsive**: Ensure the widget looks good in the mobile preview frame.

### 2. The Schema Layer (`schema.ts`)
This file defines the default "Standard View" of your widget. It contains the `SCHEMA` object which maps to the inputs seen by users in the Bliz Admin dashboard.
- **Identity**: Defines `widget_id` and `slug`.
- **Theme**: Defines brand colors (`theme_primary`) and typography.
- **Content**: Defines all text slots (`text1`, `text2`, etc.).

---

## 💅 Styling & Best Practices

- **Tailwind CSS**: Use Tailwind classes for all styling.
- **Premium Aesthetics**: Defaults should feel high-end. Use `backdrop-blur`, subtle borders (`border-white/10`), and gradients.
- **Encapsulation**: Keep your widget's internal state within `content.tsx` but pull configuration from props.
- **Animations**: Use `framer-motion` for smooth, performant game animations.

---

## 📚 Library Reference (`@blizcc/ui`)

The library provides all the specialized components for the Bliz ecosystem. You should **not** recreate these locally:
- **Overlays**: `WidgetStartOverlay`, `WidgetSuccessOverlay`, `WidgetErrorOverlay`.
- **Modals**: `WidgetUnifiedResultModal`, `WidgetRulesAcceptModal`.
- **Layout**: `WidgetBaseContainer`, `WidgetLayoutContent`, `WidgetDecorations`.

---

Happy Coding! 🚀
