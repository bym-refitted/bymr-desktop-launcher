import { derived, writable } from "svelte/store";
import { Builds } from "$lib/enums/Builds";
import { BASE_URL } from "$lib/globals";

export const selectedBuild = writable<Builds>(Builds.MULTIPLAYER);
export const localHost = writable<string>("localhost");
export const localPort = writable<number>(3001);

export const apiBaseUrl = derived([selectedBuild, localHost, localPort], ([$build, $host, $port]) =>
  $build === Builds.LOCAL ? `http://${$host}:${$port}` : BASE_URL
);
