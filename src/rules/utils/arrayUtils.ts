/**
 * Adds items to the end of a list, returning a new concatenated list.
 *
 * This function combines the provided items with the original list, yielding a new array that preserves the order of elements while leaving the original list unmodified.
 *
 * @param items - The items to append.
 * @param list - The original list.
 * @returns A new array containing the elements of the original list followed by the appended items.
 */
export function addToList(items: string[], list: string[]): string[] {
  return [...list, ...items];
}
