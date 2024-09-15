/**
 * Function to add items to a list
 * @param {string[]} items - Array of items to add
 * @param {string[]} list - List to add to
 * @returns {string[]} The updated list
 */
export function addToList(items: string[], list: string[]): string[] {
  return [...list, ...items];
}
