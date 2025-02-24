/**
 * A list of function names that return reactive values
 */
export const REACTIVE_FUNCTIONS = ['ref', 'toRefs', 'storeToRefs', 'computed'] as const;

/**
 * Regular expression pattern for conventional composable function names
 *
 * A regular expression that starts with the prefix 'use', followed by an uppercase letter
 */
export const COMPOSABLES_FUNCTION_PATTERN = /^use[A-Z]/;
