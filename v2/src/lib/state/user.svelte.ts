import { SavedUser } from "#lib/schemas.js";

const STORAGE_KEY = "user";

class User {
  token = $state("");
  userId = $state(0);
  username = $state("");
  language = $state("");
  avatar = $state("");
  remembered = $state(false);

  /**
   * Restores the user remembered on this device. Anything unreadable or invalid is cleared.
   */
  loadSaved() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      
      if (!saved) return;

      const result = SavedUser.safeParse(JSON.parse(saved));
      
      if (result.success) this.#apply(result.data, true);
      else this.clear();
    } catch {
      this.clear();
    }
  }

  /**
   * Sets the user for this session only, without remembering them on this device.
   *
   * @param {SavedUser} details - The user's token, id, username and language.
   */
  set(details: SavedUser) {
    this.#apply(details, false);
  }

  /**
   * Sets the user and remembers them on this device.
   *
   * @param {SavedUser} details - The user's token, id, username and language.
   */
  save(details: SavedUser) {
    this.#apply(details, true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch {}
  }

  /**
   * Updates the username, keeping the copy saved on this device in step if the user is remembered.
   *
   * @param {string} username - The new username.
   */
  rename(username: string) {
    const details = { token: this.token, userId: this.userId, username, language: this.language, avatar: this.avatar };

    if (this.remembered) this.save(details);
    else this.set(details);
  }

  /**
   * Signs the user out locally and forgets them on this device.
   */
  clear() {
    this.#apply({ token: "", userId: 0, username: "", language: "", avatar: "" }, false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  /**
   * @param {SavedUser} details - The values to set.
   * @param {boolean} remembered - Whether the user is saved on this device.
   */
  #apply(details: SavedUser, remembered: boolean) {
    this.token = details.token;
    this.userId = details.userId;
    this.username = details.username;
    this.language = details.language;
    this.avatar = details.avatar;
    this.remembered = remembered;
  }
}

export const user = new User();
