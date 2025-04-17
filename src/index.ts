import { ESLint } from 'eslint';
import { reactiveValueSuffix } from './rules/reactive-value-suffix';

export const meta = {
  name: 'reactive-value-suffix',
};

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
  meta,
  rules,
  configs,
} as unknown as ESLint.Plugin;
