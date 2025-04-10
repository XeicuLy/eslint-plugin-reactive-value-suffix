import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

export const isIdentifier = (node: TSESTree.Node): node is TSESTree.Identifier =>
  node.type === AST_NODE_TYPES.Identifier;

export const isMemberExpression = (node: TSESTree.Node): node is TSESTree.MemberExpression =>
  node.type === AST_NODE_TYPES.MemberExpression;

export const isProperty = (node: TSESTree.Node): node is TSESTree.Property => node.type === AST_NODE_TYPES.Property;

export const isVariableDeclarator = (node: TSESTree.Node): node is TSESTree.VariableDeclarator =>
  node.type === AST_NODE_TYPES.VariableDeclarator;

export const isArrayPattern = (node: TSESTree.Node): node is TSESTree.ArrayPattern =>
  node.type === AST_NODE_TYPES.ArrayPattern;

export const isArrayExpression = (node: TSESTree.Node): node is TSESTree.ArrayExpression =>
  node.type === AST_NODE_TYPES.ArrayExpression;

export const isCallExpression = (node: TSESTree.Node): node is TSESTree.CallExpression =>
  node.type === AST_NODE_TYPES.CallExpression;

export const isObjectPattern = (node: TSESTree.Node): node is TSESTree.ObjectPattern =>
  node.type === AST_NODE_TYPES.ObjectPattern;

export const isObjectExpression = (node: TSESTree.Node): node is TSESTree.ObjectExpression =>
  node.type === AST_NODE_TYPES.ObjectExpression;

export const isTSNonNullExpression = (node: TSESTree.Node): node is TSESTree.TSNonNullExpression =>
  node.type === AST_NODE_TYPES.TSNonNullExpression;

export const isVariableDeclaration = (node: TSESTree.Node): node is TSESTree.VariableDeclaration =>
  node.type === AST_NODE_TYPES.VariableDeclaration;
