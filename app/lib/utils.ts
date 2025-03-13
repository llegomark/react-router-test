import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
* Fisher-Yates (Knuth) shuffle algorithm
* @param array The array to shuffle
* @returns A new shuffled array, original array is not modified
*/
export function shuffleArray<T>(array: T[]): T[] {
  // Create a copy of the array to avoid modifying the original
  const shuffled = [...array];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}