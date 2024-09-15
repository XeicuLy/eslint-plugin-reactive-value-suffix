import { reactiveValueSuffix } from './rules/reactive-value-suffix';
import { TSESLint } from '@typescript-eslint/utils';

export const rules: TSESLint.Linter.Plugin['rules'] = {
  suffix: reactiveValueSuffix,
};
