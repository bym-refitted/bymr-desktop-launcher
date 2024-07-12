import { invoke } from '@tauri-apps/api';
import { exit } from '@tauri-apps/api/process';
import { writable } from 'svelte/store';

export let isLaunching = writable(false);
export let launchError = writable({ code: '', show: false });

export const launchSwf = async (buildName: String) => {
  const launchOptions = { buildName };
  localStorage.setItem('lastLaunch', JSON.stringify(launchOptions));
  isLaunching.set(true);
  try {
    await invoke('launch_game', launchOptions);
    launchError.update(() => ({ code: '', show: false }));
    await exit(0);
  } catch (err) {
    launchError.update(() => ({ code: err.code, show: true }));
  } finally {
    isLaunching.set(false);
  }
};

export const quickLaunchSwf = async () => {
  const lastLaunch = localStorage.getItem('lastLaunch');
  if (lastLaunch) {
    const launchOptions = JSON.parse(lastLaunch);
    return launchSwf(launchOptions.buildName);
  }
  return new Error('Could not find last launch options in local storage');
};
