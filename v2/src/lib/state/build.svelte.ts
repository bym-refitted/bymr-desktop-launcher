import { VITE_BASE_URL } from "$app/env/public";

export const Build = {
  stable: "stable",
  local: "local",
} as const;

export type Build = (typeof Build)[keyof typeof Build];

class BuildSettings {
  selected = $state<Build>(Build.stable);
  host = $state("localhost");
  port = $state(3001);

  apiBaseUrl = $derived(this.selected === Build.local ? `http://${this.host}:${this.port}` : VITE_BASE_URL);
}

export const build = new BuildSettings();
