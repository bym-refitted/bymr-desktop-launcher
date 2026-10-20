import type { LucideIcon } from "@lucide/svelte";
import Gamepad2 from "@lucide/svelte/icons/gamepad-2";
import Play from "@lucide/svelte/icons/play";
import Swords from "@lucide/svelte/icons/swords";
import Trophy from "@lucide/svelte/icons/trophy";
import UserRound from "@lucide/svelte/icons/user-round";
import Users from "@lucide/svelte/icons/users";

export interface Page {
  href: string;
  label: string;
  icon: LucideIcon;
  signedIn?: boolean;
  menu?: boolean;
}

export const pages: Page[] = [
  { href: "/", label: "Play", icon: Play },
  { href: "/pokies", label: "Pokies", icon: Gamepad2 },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/attack-logs", label: "Attack Logs", icon: Swords, signedIn: true },
  { href: "/friends", label: "Friends", icon: Users, signedIn: true },
  { href: "/account", label: "Account", icon: UserRound, signedIn: true, menu: true },
];
