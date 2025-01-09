import { invoke } from "@tauri-apps/api/core";
import { writable } from "svelte/store";
import { addErrorLog } from "./debugLogStore";

export let isLaunching = writable(false);
export let launchError = writable({ code: "", show: false });

export const launchSwf = async (
  buildName: string,
  language: string | unknown = "english",
  token?: string
) => {
  const launchOptions = { buildName, language, token };
  //localStorage.setItem("lastLaunch", JSON.stringify(launchOptions));
  isLaunching.set(true);

  try {
    await invoke("launch_game", launchOptions);
    launchError.update(() => ({ code: "", show: false }));
  } catch (err) {
    console.log(err);
    const error = err?.code || "An unknown error occurred during the launch process.";
    launchError.update(() => ({ code: error, show: true }));
  } finally {
    isLaunching.set(false);
  }
};

export const isQuickLaunchEnabled = () => {
  return !!localStorage.getItem("lastLaunch");
};

export const quickLaunchSwf = async () => {
  const lastLaunch = localStorage.getItem("lastLaunch");
  if (lastLaunch) {
    const launchOptions = JSON.parse(lastLaunch);
    return launchSwf(launchOptions.buildName);
  }
  addErrorLog("Could not quick launch, no previous launch in storage");
};
