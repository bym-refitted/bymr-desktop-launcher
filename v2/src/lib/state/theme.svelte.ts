export type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

/** The saved theme, or dark when nothing is saved or storage is unavailable. */
const readSaved = (): Theme => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const theme = $state<{ current: Theme }>({ current: readSaved() });

/** Applies the theme and remembers it; if storage fails it still applies for this session. */
export const setTheme = (next: Theme) => {
  theme.current = next;
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
};

export const toggleTheme = () =>
  setTheme(theme.current === "dark" ? "light" : "dark");
