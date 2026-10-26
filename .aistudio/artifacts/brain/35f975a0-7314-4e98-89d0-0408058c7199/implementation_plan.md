# Implementation Plan: Fullscreen & Exam Focus Mode

Integrate a comprehensive Fullscreen tool suite across IELTS PrepMaster, featuring an accessible top-navigation toggle and a dedicated **Exam Focus Mode** for Reading practice and simulation that mirrors official computer-delivered IELTS testing interfaces.

---

## 1. User Alignment & Architecture

Based on your preferences:
- **Placement**: Available globally in the top navigation bar and directly integrated into the Reading / Exam test toolbar.
- **Behavior**: When activated during a test session, the interface transitions into **Exam Focus Mode**—expanding the passage and questions to 100vh, eliminating peripheral banners/footers, and keeping the countdown timer and question palette prominently anchored.

---

## 2. Technical Design & Components

### A. Fullscreen State & API Service (`src/services/fullscreenService.ts` / Hook)
- Provides standard cross-browser Fullscreen API handling (`requestFullscreen`, `exitFullscreen`, `document.fullscreenElement`, `fullscreenchange` events).
- Graceful iframe fallback (if iframe policies restrict native fullscreen, expands to full-viewport modal overlay).
- Handles `Esc` key capture and synchronization.

### B. Navbar Global Fullscreen Toggle (`src/components/Navbar.tsx`)
- Add an accessible `Maximize2` / `Minimize2` icon button next to Dark Mode toggle and Streak badge.
- Interactive tooltip explaining "Toggle Fullscreen".
- Real-time icon sync based on `document.fullscreenElement`.

### C. Exam Focus Mode in Reading Module (`src/components/ReadingModule.tsx`)
- Dedicated **"Exam Focus (Fullscreen)"** button in the test toolbar.
- When active:
  - Container scales to `fixed inset-0 z-50 h-screen w-screen bg-white dark:bg-slate-950 p-4 sm:p-6 overflow-hidden`.
  - Passage and Question split view dynamically expands to fill full screen height.
  - Pinned top HUD keeps:
    - Test title & Mode (Practice / Simulation)
    - High-visibility Countdown Timer
    - 5-Minute Warning banner
    - Passage controls (Text Highlighter & Font Resizer `A- / A / A+`)
    - Exit Focus Mode button
  - Pinned bottom bar keeps question navigation palette (1, 2, 3...) and Submit button accessible.

### D. Daily Session Practice Flow Integration (`src/components/DailySessionView.tsx`)
- Allows test-takers to engage Fullscreen Exam Focus when practicing in Step 2 of the Daily Session routine.

---

## 3. Implementation Steps

1. **Create Fullscreen Utility**:
   - Write standard fullscreen helper in `src/services/fullscreenService.ts`.
2. **Update Navbar**:
   - Add fullscreen toggle button with `Maximize2`/`Minimize2` state and tooltip.
3. **Enhance ReadingModule with Exam Focus Layout**:
   - Add `isExamFocus` state.
   - Implement distraction-free 100vh layout with pinned exam HUD and question palette.
   - Support `Esc` key and custom button to exit.
4. **Verification & Testing**:
   - Run `lint_applet` and `compile_applet`.
   - Test toggle in regular navigation and during active 60-minute simulation.
