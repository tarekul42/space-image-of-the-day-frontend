/**
 * utils/theme.ts — Pure theme helpers + DOM application.
 * The DOM side is kept tiny and guarded so the rest stays unit-testable.
 */
import { Theme, THEMES } from './settings';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as string[]).includes(value);
}

/** Apply a theme by setting `data-theme` + a `.theme-light` flag on <html>. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('theme-light', theme === 'daylight');
}
