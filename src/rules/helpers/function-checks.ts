import { COMPOSABLES_FUNCTION_PATTERN } from '../constants/constant';
import {
  isArrayExpression,
  isArrayPattern,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  isProperty,
  isVariableDeclarator,
} from './ast-helpers';
import type { TSESTree } from '@typescript-eslint/utils';
import type { PropertyWithIdentifierObject } from '../types/ast';

export const isPropertyValue = (node: TSESTree.Node): boolean => isProperty(node) && isObjectExpression(node.parent);

export const isPropertyWithIdentifierObject = (
  property: TSESTree.Property | TSESTree.RestElement,
): property is PropertyWithIdentifierObject => {
  return isProperty(property) && isIdentifier(property.key) && isIdentifier(property.value);
};

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

export const checkFunctionArgument = (
  node: TSESTree.Identifier,
  targetNode: TSESTree.CallExpression | null,
  functionNames: Readonly<string[]>,
): boolean => {
  if (!targetNode) return false;

  return (
    targetNode.arguments.includes(node) &&
    isIdentifier(targetNode.callee) &&
    functionNames.includes(targetNode.callee.name)
  );
};

export const isSpecialFunctionArgument = (
  node: TSESTree.Identifier,
  specialFunctionNames: Readonly<string[]>,
): boolean => {
  const targetNode = findAncestorCallExpression(node);
  return checkFunctionArgument(node, targetNode, specialFunctionNames);
};

export const isArgumentOfIgnoredFunction = (
  node: TSESTree.Identifier,
  ignoredFunctionNames: Readonly<string[]>,
): boolean => {
  const parent = isCallExpression(node.parent) ? node.parent : null;
  return checkFunctionArgument(node, parent, ignoredFunctionNames);
};

export const isComposablesFunctionArgument = (node: TSESTree.Identifier): boolean => {
  const callExpression = findAncestorCallExpression(node);
  if (!callExpression) return false;

  if (!isIdentifier(callExpression.callee) || !COMPOSABLES_FUNCTION_PATTERN.test(callExpression.callee.name)) {
    return false;
  }

  return callExpression.arguments.includes(node);
};

export const shouldSuppressWarning = (
  node: TSESTree.Identifier,
  parent: TSESTree.Node,
  composableFunctions: Readonly<string[]>,
  ignoredFunctionNames: Readonly<string[]>,
): boolean => {
  const isInDeclarationContext =
    isVariableDeclarator(parent) || isArrayPattern(parent) || (parent.parent && isPropertyValue(parent));

  const isPropertyAccess =
    (isMemberExpression(parent) && isIdentifier(parent.property) && parent.property.name === 'value') ||
    (isMemberExpression(parent) && parent.property !== node) ||
    (isProperty(parent) && parent.key === node) ||
    isPropertyValue(parent);

  const isSpecialArgument =
    isWatchArgument(node) ||
    isSpecialFunctionArgument(node, composableFunctions) ||
    isArgumentOfIgnoredFunction(node, ignoredFunctionNames) ||
    isComposablesFunctionArgument(node);

  const isInLiteral = isArrayExpression(node.parent);

  return isInDeclarationContext || isPropertyAccess || isSpecialArgument || isInLiteral;
};
