import type { LucideIcon } from "@lucide/svelte";
import Gamepad2 from "@lucide/svelte/icons/gamepad-2";
import Play from "@lucide/svelte/icons/play";

export interface Page {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const pages: Page[] = [
  { href: "/", label: "Play", icon: Play },
  { href: "/pokies", label: "Pokies", icon: Gamepad2 },
];
