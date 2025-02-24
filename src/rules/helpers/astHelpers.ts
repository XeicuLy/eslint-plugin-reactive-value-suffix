import { addToList } from '../utils/arrayUtils';
import { COMPOSABLES_FUNCTION_PATTERN, REACTIVE_FUNCTIONS } from '../constants/constant';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type {
  Node,
  ArrowFunctionExpression,
  CallExpression,
  FunctionDeclaration,
  Identifier,
  VariableDeclarator,
  ObjectPattern,
  Property,
  MemberExpression,
  ASTNodeType,
  AssignmentPattern,
  ArrayExpression,
  TSNonNullExpression,
} from '../types/eslint';

const {
  Identifier,
  ObjectPattern,
  Property,
  CallExpression,
  VariableDeclarator,
  MemberExpression,
  AssignmentPattern,
  ArrayExpression,
  TSNonNullExpression,
} = AST_NODE_TYPES;

/**
 * Function to check whether the specified node is of a particular type
 * @template T Type of the node
 * @param node The node to check
 * @param type Node type (e.g., Identifier, ObjectPattern, etc.)
 * @returns Whether it matches the specified type
 */
export function isNodeOfType<T extends Node>(node: Node | undefined | null, type: ASTNodeType): node is T {
  return node !== undefined && node !== null && node.type === type;
}

/**
 * Function to check whether a node is an Identifier
 * @param node The node to check
 * @returns Whether the node is an Identifier
 */
export const isIdentifier = (node: Node | undefined): node is Identifier => isNodeOfType<Identifier>(node, Identifier);

/**
 * Function to check whether a node is an ObjectPattern
 * @param node The node to check
 * @returns Whether the node is an ObjectPattern
 */
export const isObjectPattern = (node: Node | undefined): node is ObjectPattern =>
  isNodeOfType<ObjectPattern>(node, ObjectPattern);

/**
 * Function to check whether a node is a Property
 * @param node The node to check
 * @returns Whether the node is a Property
 */
export const isProperty = (node: Node | undefined): node is Property => isNodeOfType<Property>(node, Property);

/**
 * Function to check whether a node is a CallExpression (function call)
 * @param node The node to check
 * @returns Whether the node is a CallExpression
 */
export const isCallExpression = (node: Node | undefined | null): node is CallExpression =>
  isNodeOfType<CallExpression>(node, CallExpression);

/**
 * Function to check whether a node is a VariableDeclarator (variable declaration)
 * @param node The node to check
 * @returns Whether the node is a VariableDeclarator
 */
export const isVariableDeclarator = (node: Node | undefined): node is VariableDeclarator =>
  isNodeOfType<VariableDeclarator>(node, VariableDeclarator);

/**
 * Function to check whether a node is a MemberExpression
 * @param node The node to check
 * @returns Whether the node is a MemberExpression
 */
export const isMemberExpression = (node: Node | undefined): node is MemberExpression =>
  isNodeOfType<MemberExpression>(node, MemberExpression);

/**
 * Function to check whether a node is an AssignmentPattern
 * @param node The node to check
 * @returns Whether the node is an AssignmentPattern
 */
export const isAssignmentPattern = (node: Node | undefined): node is AssignmentPattern =>
  isNodeOfType<AssignmentPattern>(node, AssignmentPattern);

/**
 * Function to check whether a node is an ArrayExpression
 * @param node The node to check
 * @returns Whether the node is an ArrayExpression
 */
export const isArrayExpression = (node: Node | undefined): node is ArrayExpression =>
  isNodeOfType<ArrayExpression>(node, ArrayExpression);

/**
 * Checks if the node's parent is a TSNonNullExpression
 * @param node - The node whose parent to check
 * @returns - True if the parent is a TSNonNullExpression, false otherwise
 */
export const isParentNonNullAssertion = (node: Node): node is TSNonNullExpression =>
  isNodeOfType<TSNonNullExpression>(node.parent, TSNonNullExpression);

/**
 * Add function parameters to a list
 * @param node Function declaration
 * @param list Existing list
 * @returns List with parameters added
 */
export function addArgumentsToList(node: FunctionDeclaration | ArrowFunctionExpression, list: string[]): string[] {
  return addToList(
    node.params.reduce<string[]>((acc, param) => (isIdentifier(param) ? [...acc, param.name] : acc), []),
    list,
  );
}

/**
 * Add reactive variables to a list
 * @param node Variable declarator node
 * @param list Existing list
 * @returns List with variables added
 */
export function addReactiveVariables(node: VariableDeclarator, list: string[]): string[] {
  return isFunctionCall(node, REACTIVE_FUNCTIONS) && isIdentifier(node.id) ? addToList([node.id.name], list) : list;
}

/**
 * If the variable's initializer is obtained from a reactive function, add the variable names to the list
 * @param node Variable declarator node
 * @param list Existing list
 * @returns List with variable names added
 */
export function addToVariablesListFromCalleeWithArgument(node: VariableDeclarator, list: string[]): string[] {
  if (!isFunctionCall(node, REACTIVE_FUNCTIONS) || !isObjectPattern(node.id)) {
    return list;
  }

  const variableNames = node.id.properties.reduce<string[]>((acc, property) => {
    if (isIdentifier(property.value)) {
      acc.push(property.value.name);
    }
    return acc;
  }, []);

  return addToList(variableNames, list);
}

/**
 * Add functions destructured from functions starting with 'use' (e.g., composables) to a list
 * @param node Variable declarator node
 * @param list Existing list
 * @returns List with function names added
 */
export function addDestructuredFunctionNames(node: VariableDeclarator, list: string[]): string[] {
  if (
    !isObjectPattern(node.id) ||
    !isCallExpression(node.init) ||
    !isIdentifier(node.init.callee) ||
    !COMPOSABLES_FUNCTION_PATTERN.test(node.init.callee.name)
  ) {
    return list;
  }

  const functionNames = node.id.properties.reduce<string[]>((acc, property) => {
    if (isProperty(property) && isIdentifier(property.key)) {
      acc.push(property.key.name);
    }
    return acc;
  }, []);

  return addToList(functionNames, list);
}

/**
 * Check whether the node is an argument of the specified function
 * @param node Node
 * @param ignoredFunctionNames List of function names to ignore
 * @returns Whether it is an argument of the specified function
 */
export function isArgumentOfFunction(node: Identifier, ignoredFunctionNames: string[]): boolean {
  const callExpression = getAncestorCallExpression(node);
  if (!isIdentifier(callExpression?.callee)) {
    return false;
  }

  const isMatchingName = isMatchingFunctionName(callExpression.callee.name, ignoredFunctionNames);
  if (!isMatchingName) {
    return false;
  }

  return callExpression.arguments.some(
    (argument) => isIdentifier(argument) && argument.type === node.type && argument.name === node.name,
  );
}

/**
 * Check whether the function name matches the specified pattern
 * @param name Function name
 * @param ignoredFunctionNames List of function names to ignore
 * @returns Whether the function name matches
 */
export function isMatchingFunctionName(name: string, ignoredFunctionNames: string[]): boolean {
  return COMPOSABLES_FUNCTION_PATTERN.test(name) || ignoredFunctionNames.includes(name);
}

/**
 * Check whether the node is an argument of the 'watch' function
 * @param node Node
 * @returns Whether it is an argument of the 'watch' function
 */
export function isWatchArgument(node: Identifier): boolean {
  const callExpression = getAncestorCallExpression(node);

  if (!isIdentifier(callExpression?.callee) || callExpression.callee.name !== 'watch') {
    return false;
  }

  const isFirstArgument = callExpression.arguments?.indexOf(node) === 0;
  const isInArrayExpression =
    isArrayExpression(callExpression.arguments?.[0]) && callExpression.arguments?.[0]?.elements?.includes(node);

  return isFirstArgument || isInArrayExpression;
}

/**
 * Check whether the node is a call to the specified function
 * @param node Variable declarator node
 * @param functionNames List of function names to check
 * @returns Whether it is a function call
 */
export function isFunctionCall(node: VariableDeclarator, functionNames: typeof REACTIVE_FUNCTIONS): boolean {
  return (
    isCallExpression(node.init) &&
    isIdentifier(node.init.callee) &&
    functionNames.includes(node.init.callee?.name as (typeof REACTIVE_FUNCTIONS)[number])
  );
}

/**
 * Traverse up the parent nodes to find the first CallExpression node
 * @param node Node
 * @returns The first CallExpression node found, or null if none
 */
export function getAncestorCallExpression(node: Node): CallExpression | null {
  let currentNode = node.parent;
  while (currentNode && !isCallExpression(currentNode)) {
    currentNode = currentNode.parent;
  }
  return isCallExpression(currentNode) ? currentNode : null;
}

/**
 * Check whether the node is a property value
 * @param node The node to check
 * @returns Whether it is a property value
 */
export function isPropertyValue(node: Node): boolean {
  return isMemberExpression(node) && isIdentifier(node.property) && node.property.name === 'value';
}

/**
 * Check whether the node is a function argument
 * @param node Node
 * @param functionArguments List of function arguments
 * @returns Whether it is an argument
 */
export function isFunctionArgument(node: Identifier, functionArguments: string[]): boolean {
  return functionArguments.includes(node.name);
}

/**
 * Check whether the node is a key of an object
 * @param node The node to check
 * @param identifierNode The identifier node to check
 * @returns Whether it is a key of an object
 */
export function isObjectKey(node: Node, identifierNode: Identifier): boolean {
  return isProperty(node) && isIdentifier(node.key) && node.key.name === identifierNode.name;
}

/**
 * Check whether the node is the original declaration
 * @param node The node to check
 * @returns Whether it is the original declaration
 */
export function isOriginalDeclaration(node: Node): boolean {
  return isMemberExpression(node) || isProperty(node);
}

/**
 * Check whether the node is an argument of a destructured function
 * @param parent Parent node
 * @param grandParent Grandparent node
 * @param destructuredFunctions List of destructured functions
 * @returns Whether it is an argument of a destructured function
 */
export function isDestructuredFunctionArgument(
  parent: Node,
  grandParent: Node | undefined,
  destructuredFunctions: string[],
): boolean {
  if (isNodeDestructuredFunction(parent, destructuredFunctions)) {
    return true;
  }

  if (!grandParent) {
    return false;
  }

  return isNodeDestructuredFunction(grandParent, destructuredFunctions);
}
/**
 * Check whether the node is a destructured function call
 * @param node Node to check
 * @param destructuredFunctions List of destructured functions
 * @returns Whether the node is a destructured function call
 */
export function isNodeDestructuredFunction(node: Node, destructuredFunctions: string[]): boolean {
  if (!isCallExpression(node)) {
    return false;
  }
  return isIdentifier(node.callee) && destructuredFunctions.includes(node.callee.name);
}
