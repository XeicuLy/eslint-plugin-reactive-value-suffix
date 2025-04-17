import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

const nodeTypeGuardFactory = <T extends TSESTree.Node>(type: T['type']) => {
  return (node: TSESTree.Node): node is T => node.type === type;
};

export const isIdentifier = nodeTypeGuardFactory<TSESTree.Identifier>(AST_NODE_TYPES.Identifier);
export const isMemberExpression = nodeTypeGuardFactory<TSESTree.MemberExpression>(AST_NODE_TYPES.MemberExpression);
export const isProperty = nodeTypeGuardFactory<TSESTree.Property>(AST_NODE_TYPES.Property);
export const isVariableDeclarator = nodeTypeGuardFactory<TSESTree.VariableDeclarator>(
  AST_NODE_TYPES.VariableDeclarator,
);
export const isArrayPattern = nodeTypeGuardFactory<TSESTree.ArrayPattern>(AST_NODE_TYPES.ArrayPattern);
export const isArrayExpression = nodeTypeGuardFactory<TSESTree.ArrayExpression>(AST_NODE_TYPES.ArrayExpression);
export const isCallExpression = nodeTypeGuardFactory<TSESTree.CallExpression>(AST_NODE_TYPES.CallExpression);
export const isObjectPattern = nodeTypeGuardFactory<TSESTree.ObjectPattern>(AST_NODE_TYPES.ObjectPattern);
export const isObjectExpression = nodeTypeGuardFactory<TSESTree.ObjectExpression>(AST_NODE_TYPES.ObjectExpression);
export const isTSNonNullExpression = nodeTypeGuardFactory<TSESTree.TSNonNullExpression>(
  AST_NODE_TYPES.TSNonNullExpression,
);
export const isVariableDeclaration = nodeTypeGuardFactory<TSESTree.VariableDeclaration>(
  AST_NODE_TYPES.VariableDeclaration,
);
