// src/utils/helpers.ts

import { useState } from "react";

/**
 * Custom hook om localStorage te gebruiken met React state.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setValue = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch { }
  };

  return [storedValue, setValue] as const;
}

/**
 * Simpele debounce functie voor async gebruik.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  } as T;
}

/**
 * Beperkt tekstlengte met ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}


export function formatHtml(text: string): string {
  if (!text) return "";
  const parts = text.split("|").map((p) => p.trim());
  if (parts.length === 1) return `<p>${parts[0]}</p>`;
  return `<ul>${parts.map((p) => `<li>${p}</li>`).join("\n")}</ul>`;
}