import { listen } from '@tauri-apps/api/event';
import { writable, derived } from 'svelte/store';

type LogEntry = { class: string; msg: string };
interface LogEvent {
  message: string;
}

// Readables:
export const debugLogs = writable<LogEntry[]>([]);

export const latestLog = derived(debugLogs, ($debugLogs) => {
  if ($debugLogs.length === 0) {
    return null;
  }
  return $debugLogs[$debugLogs.length - 1];
});

export const platform = derived(debugLogs, ($debugLogs) => $debugLogs.at(0));

// Actions:
export function addInfoLog(logEntry: string) {
  addLog({ msg: logEntry, class: '' });
}

export function addErrorLog(logEntry: string) {
  addLog({ msg: logEntry, class: 'text-red-500' });
}

export function addSuccessLog(logEntry: string) {
  addLog({ msg: logEntry, class: 'text-green-500' });
}

// Private functions:
function addLog(logEntry: LogEntry) {
  debugLogs.update((logs) => [...logs, logEntry]);
}

/**
 * Setup listeners for log events from rust
 * Needs to be called before the app is initialized
 */
export function setupLogListeners() {
  listen<LogEvent>('infoLog', (event) => addInfoLog(event.payload.message));
  listen<LogEvent>('errorLog', (event) => addErrorLog(event.payload.message));
}
