import { reactiveValueSuffix } from './rules/reactive-value-suffix';

export const rules = {
  suffix: reactiveValueSuffix,
};

export const configs = {
  recommended: {
    rules: {
      'reactive-value-suffix/suffix': 'error',
    },
  },

  flat: {
    rules: {
      'reactive-value-suffix/suffix': 'error',
    },
  },
};

export default {
  name: 'reactive-value-suffix',
  rules,
  configs,
};

/**
 * Usage examples:
 *
 * // .eslintrc.js (Traditional config)
 * module.exports = {
 *   plugins: ['reactive-value-suffix'],
 *   extends: ['plugin:reactive-value-suffix/recommended'],
 *   rules: {
 *     'reactive-value-suffix/suffix': 'error'
 *   }
 * };
 *
 * // ESLint v9+ (Flat config)
 * // eslint.config.js
 * import reactiveValueSuffixPlugin from 'eslint-plugin-reactive-value-suffix';
 *
 * export default [
 *   {
 *     plugins: {
 *       'reactive-value-suffix': reactiveValueSuffixPlugin,
 *     },
 *   },
 *   reactiveValueSuffixPlugin.configs.flat,
 *   {
 *     rules: {
 *       'reactive-value-suffix/suffix': ['error', {
 *         functionNamesToIgnoreValueCheck: ['someFunction']
 *       }]
 *     }
 *   }
 * ];
 */
