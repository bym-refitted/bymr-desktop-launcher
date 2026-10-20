export type ThemeName = "dark" | "light";

const STORAGE_KEY = "theme";

/**
 * @returns {ThemeName} The saved theme, or dark when nothing is saved or storage is unavailable.
 */
const readSaved = (): ThemeName => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

class Theme {
  current = $state<ThemeName>(readSaved());

  /**
   * Applies the theme and remembers it; if storage fails it still applies for this session.
   *
   * @param {ThemeName} next - The theme to switch to.
   */
  set(next: ThemeName) {
    this.current = next;
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  /**
   * Switches between the dark and light themes.
   */
  toggle() {
    this.set(this.current === "dark" ? "light" : "dark");
  }
}

export const theme = new Theme();
