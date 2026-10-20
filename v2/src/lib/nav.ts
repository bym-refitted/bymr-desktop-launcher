import type { LucideIcon } from "@lucide/svelte";
import Play from "@lucide/svelte/icons/play";

export interface Page {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const pages: Page[] = [{ href: "/", label: "Play", icon: Play }];
