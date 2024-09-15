import type { TSESTree, TSESLint } from '@typescript-eslint/utils';

type Node = TSESTree.Node;
type Identifier = TSESTree.Identifier;
type VariableDeclarator = TSESTree.VariableDeclarator;
type ArrowFunctionExpression = TSESTree.ArrowFunctionExpression;
type FunctionDeclaration = TSESTree.FunctionDeclaration;
type CallExpression = TSESTree.CallExpression;
type MemberExpression = TSESTree.MemberExpression;
type ASTNodeType = TSESTree.AST_NODE_TYPES;
type Property = TSESTree.Property;
type RestElement = TSESTree.RestElement;
type ObjectPattern = TSESTree.ObjectPattern;
type AssignmentPattern = TSESTree.AssignmentPattern;

type RuleListener = TSESLint.RuleListener;

export type {
  Node,
  Identifier,
  VariableDeclarator,
  ArrowFunctionExpression,
  FunctionDeclaration,
  CallExpression,
  MemberExpression,
  RuleListener,
  ASTNodeType,
  Property,
  RestElement,
  ObjectPattern,
  AssignmentPattern,
};
