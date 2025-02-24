/**
 * Function to add items to a list
 * @param items - Array of items to add
 * @param list - List to add to
 * @returns The updated list
 */
export function addToList(items: string[], list: string[]): string[] {
  return [...list, ...items];
}
