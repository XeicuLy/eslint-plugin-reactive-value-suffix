import type { TSESTree } from '@typescript-eslint/utils';

export type CallExpressionWithIdentifierCallee = TSESTree.CallExpression & { callee: TSESTree.Identifier };
export type ObjectPatternCallExpressionDeclarator = TSESTree.VariableDeclarator & {
  id: TSESTree.ObjectPattern;
  init: CallExpressionWithIdentifierCallee;
};
export type PropertyWithIdentifierObject = TSESTree.Property & { key: TSESTree.Identifier; value: TSESTree.Identifier };
