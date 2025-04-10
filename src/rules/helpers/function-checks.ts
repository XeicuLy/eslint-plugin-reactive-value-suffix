import { COMPOSABLES_FUNCTION_PATTERN } from '../constants/constant';
import {
  isArrayExpression,
  isArrayPattern,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  isObjectPattern,
  isProperty,
  isVariableDeclarator,
} from './ast-helpers';
import type { TSESTree } from '@typescript-eslint/utils';

export const isPropertyValue = (node: TSESTree.Node): boolean => isProperty(node) && isObjectExpression(node.parent);

export const findAncestorCallExpression = (node: TSESTree.Node): TSESTree.CallExpression | null => {
  let currentNode: TSESTree.Node | undefined = node.parent;

  while (currentNode) {
    if (isCallExpression(currentNode)) {
      return currentNode;
    }
    currentNode = currentNode.parent;
  }

  return null;
};

export const isWatchArgument = (node: TSESTree.Identifier): boolean => {
  const callExpression = findAncestorCallExpression(node);
  if (!callExpression) return false;

  if (!isIdentifier(callExpression.callee) || callExpression.callee.name !== 'watch') {
    return false;
  }

  if (callExpression.arguments[0] === node) {
    return true;
  }

  return isArrayExpression(callExpression.arguments[0]) && callExpression.arguments[0].elements.includes(node);
};

export const isSpecialFunctionArgument = (node: TSESTree.Identifier, specialFunctions: Readonly<string[]>): boolean => {
  const callExpression = findAncestorCallExpression(node);
  if (!callExpression) return false;

  if (!isIdentifier(callExpression.callee) || !specialFunctions.includes(callExpression.callee.name)) {
    return false;
  }

  return callExpression.arguments.includes(node);
};

export const isComposablesFunctionArgument = (node: TSESTree.Identifier): boolean => {
  const callExpression = findAncestorCallExpression(node);
  if (!callExpression) return false;

  if (!isIdentifier(callExpression.callee) || !COMPOSABLES_FUNCTION_PATTERN.test(callExpression.callee.name)) {
    return false;
  }

  return callExpression.arguments.includes(node);
};

export const isArgumentOfFunction = (node: TSESTree.Identifier, ignoredFunctionNames: Readonly<string[]>): boolean => {
  const parent = node.parent;

  if (!isCallExpression(parent)) {
    return false;
  }

  return (
    parent.arguments.includes(node) && isIdentifier(parent.callee) && ignoredFunctionNames.includes(parent.callee.name)
  );
};

export const shouldSuppressWarning = (
  node: TSESTree.Identifier,
  parent: TSESTree.Node,
  composableFunctions: Readonly<string[]>,
  ignoredFunctionNames: Readonly<string[]>,
): boolean => {
  const isInDeclarationContext =
    isVariableDeclarator(parent) ||
    isArrayPattern(parent) ||
    (isProperty(parent) && parent.parent && isObjectPattern(parent.parent));

  const isPropertyAccess =
    (isMemberExpression(parent) && isIdentifier(parent.property) && parent.property.name === 'value') ||
    (isMemberExpression(parent) && parent.property !== node) ||
    (isProperty(parent) && parent.key === node) ||
    isPropertyValue(parent);

  const isSpecialArgument =
    isWatchArgument(node) ||
    isSpecialFunctionArgument(node, composableFunctions) ||
    isArgumentOfFunction(node, ignoredFunctionNames) ||
    isComposablesFunctionArgument(node);

  const isInLiteral = isArrayExpression(node.parent);

  return isInDeclarationContext || isPropertyAccess || isSpecialArgument || isInLiteral;
};
