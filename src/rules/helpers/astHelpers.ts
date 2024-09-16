import { addToList } from '../utils/arrayUtils';
import { COMPOSABLES_FUNCTION_PATTERN, REACTIVE_FUNCTIONS } from '../constants/constant.js';
import { TSESTree } from '@typescript-eslint/utils';
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
} from '../types/eslint';

const { AST_NODE_TYPES } = TSESTree;

/**
 * Function to check whether the specified node is of a particular type
 * @template T Type of the node
 * @param {Node | undefined | null} node The node to check
 * @param {ASTNodeType} type Node type (e.g., Identifier, ObjectPattern, etc.)
 * @returns {node is T} Whether it matches the specified type
 */
function isNodeOfType<T extends Node>(node: Node | undefined | null, type: ASTNodeType): node is T {
  return node !== undefined && node !== null && node.type === type;
}

/**
 * Function to check whether a node is an Identifier
 * @param {Node | undefined} node The node to check
 * @returns {node is Identifier} Whether the node is an Identifier
 */
export const isIdentifier = (node: Node | undefined): node is Identifier =>
  isNodeOfType<Identifier>(node, AST_NODE_TYPES.Identifier);

/**
 * Function to check whether a node is an ObjectPattern
 * @param {Node | undefined} node The node to check
 * @returns {node is ObjectPattern} Whether the node is an ObjectPattern
 */
export const isObjectPattern = (node: Node | undefined): node is ObjectPattern =>
  isNodeOfType<ObjectPattern>(node, AST_NODE_TYPES.ObjectPattern);

/**
 * Function to check whether a node is a Property
 * @param {Node | undefined} node The node to check
 * @returns {node is Property} Whether the node is a Property
 */
export const isProperty = (node: Node | undefined): node is Property =>
  isNodeOfType<Property>(node, AST_NODE_TYPES.Property);

/**
 * Function to check whether a node is a CallExpression (function call)
 * @param {Node | undefined | null} node The node to check
 * @returns {node is CallExpression} Whether the node is a CallExpression
 */
export const isCallExpression = (node: Node | undefined | null): node is CallExpression =>
  isNodeOfType<CallExpression>(node, AST_NODE_TYPES.CallExpression);

/**
 * Function to check whether a node is a VariableDeclarator (variable declaration)
 * @param {Node | undefined} node The node to check
 * @returns {node is VariableDeclarator} Whether the node is a VariableDeclarator
 */
export const isVariableDeclarator = (node: Node | undefined): node is VariableDeclarator =>
  isNodeOfType<VariableDeclarator>(node, AST_NODE_TYPES.VariableDeclarator);

/**
 * Function to check whether a node is a MemberExpression
 * @param {Node | undefined} node The node to check
 * @returns {node is MemberExpression} Whether the node is a MemberExpression
 */
export const isMemberExpression = (node: Node | undefined): node is MemberExpression =>
  isNodeOfType<MemberExpression>(node, AST_NODE_TYPES.MemberExpression);

/**
 * Function to check whether a node is an AssignmentPattern
 * @param {Node | undefined} node The node to check
 * @returns {node is AssignmentPattern} Whether the node is an AssignmentPattern
 */
export const isAssignmentPattern = (node: Node | undefined): node is AssignmentPattern =>
  isNodeOfType<AssignmentPattern>(node, AST_NODE_TYPES.AssignmentPattern);

/**
 * Add function parameters to a list
 * @param {FunctionDeclaration | ArrowFunctionExpression} node Function declaration
 * @param {string[]} list Existing list
 * @returns {string[]} List with parameters added
 */
export function addArgumentsToList(node: FunctionDeclaration | ArrowFunctionExpression, list: string[]): string[] {
  return addToList(
    node.params.reduce<string[]>((acc, param) => (isIdentifier(param) ? [...acc, param.name] : acc), []),
    list,
  );
}

/**
 * Add reactive variables to a list
 * @param {VariableDeclarator} node Variable declarator node
 * @param {string[]} list Existing list
 * @returns {string[]} List with variables added
 */
export function addReactiveVariables(node: VariableDeclarator, list: string[]): string[] {
  return isFunctionCall(node, REACTIVE_FUNCTIONS) && isIdentifier(node.id) ? addToList([node.id.name], list) : list;
}

/**
 * If the variable's initializer is obtained from a reactive function, add the variable names to the list
 * @param {VariableDeclarator} node Variable declarator node
 * @param {string[]} list Existing list
 * @returns {string[]} List with variable names added
 */
export function addToVariablesListFromCalleeWithArgument(node: VariableDeclarator, list: string[]): string[] {
  if (isFunctionCall(node, REACTIVE_FUNCTIONS) && isObjectPattern(node.id)) {
    const variableNames = node.id.properties.reduce<string[]>((acc, property) => {
      if (isIdentifier(property.value)) acc.push(property.value.name);
      return acc;
    }, []);
    return addToList(variableNames, list);
  }
  return list;
}

/**
 * Add functions destructured from functions starting with 'use' (e.g., composables) to a list
 * @param {VariableDeclarator} node Variable declarator node
 * @param {string[]} list Existing list
 * @returns {string[]} List with function names added
 */
export function addDestructuredFunctionNames(node: VariableDeclarator, list: string[]): string[] {
  if (isObjectPattern(node.id) && isCallExpression(node.init)) {
    if (isIdentifier(node.init.callee) && COMPOSABLES_FUNCTION_PATTERN.test(node.init.callee.name)) {
      const functionNames = node.id.properties.reduce<string[]>((acc, property) => {
        if (isProperty(property) && isIdentifier(property.key)) acc.push(property.key.name);
        return acc;
      }, []);
      return addToList(functionNames, list);
    }
  }
  return list;
}

/**
 * Check whether the node is an argument of the specified function
 * @param {Identifier} node Node
 * @param {string[]} ignoredFunctionNames List of function names to ignore
 * @returns {boolean} Whether it is an argument of the specified function
 */
export function isArgumentOfFunction(node: Identifier, ignoredFunctionNames: string[]): boolean {
  const callExpression = getAncestorCallExpression(node);
  return (
    isIdentifier(callExpression?.callee) &&
    isMatchingFunctionName(callExpression.callee.name, ignoredFunctionNames) &&
    callExpression.arguments.includes(node)
  );
}

/**
 * Check whether the function name matches the specified pattern
 * @param {string} name Function name
 * @param {string[]} ignoredFunctionNames List of function names to ignore
 * @returns {boolean} Whether the function name matches
 */
export function isMatchingFunctionName(name: string, ignoredFunctionNames: string[]): boolean {
  return COMPOSABLES_FUNCTION_PATTERN.test(name) || ignoredFunctionNames.includes(name);
}

/**
 * Check whether the node is an argument of the 'watch' function
 * @param {Identifier} node Node
 * @returns {boolean} Whether it is an argument of the 'watch' function
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
 * @param {VariableDeclarator} node Variable declarator node
 * @param {string[]} functionNames List of function names to check
 * @returns {boolean} Whether it is a function call
 */
function isFunctionCall(node: VariableDeclarator, functionNames: string[]): boolean {
  return (
    isCallExpression(node.init) && isIdentifier(node.init.callee) && functionNames.includes(node.init.callee?.name)
  );
}

/**
 * Traverse up the parent nodes to find the first CallExpression node
 * @param {Node} node Node
 * @returns {CallExpression | null} The first CallExpression node found, or null if none
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
 * @param {Node} node The node to check
 * @returns {boolean} Whether it is a property value
 */
export function isPropertyValue(node: Node): boolean {
  return isMemberExpression(node) && isIdentifier(node.property) && node.property.name === 'value';
}

/**
 * Check whether the node is a function argument
 * @param {Identifier} node Node
 * @param {string[]} functionArguments List of function arguments
 * @returns {boolean} Whether it is an argument
 */
export function isFunctionArgument(node: Identifier, functionArguments: string[]): boolean {
  return functionArguments.includes(node.name);
}

/**
 * Check whether the node is a key of an object
 * @param {Node} node The node to check
 * @param {Identifier} identifierNode The identifier node to check
 * @returns {boolean} Whether it is a key of an object
 */
export function isObjectKey(node: Node, identifierNode: Identifier): boolean {
  return isProperty(node) && isIdentifier(node.key) && node.key.name === identifierNode.name;
}

/**
 * Check whether the node is the original declaration
 * @param {Node} node The node to check
 * @returns {boolean} Whether it is the original declaration
 */
export function isOriginalDeclaration(node: Node): boolean {
  return isMemberExpression(node) || isProperty(node);
}

/**
 * Check whether the node is an argument of a destructured function
 * @param {Node} parent Parent node
 * @param {Node | undefined} grandParent Grandparent node
 * @param {string[]} destructuredFunctions List of destructured functions
 * @returns {boolean} Whether it is an argument of a destructured function
 */
export function isDestructuredFunctionArgument(
  parent: Node,
  grandParent: Node | undefined,
  destructuredFunctions: string[],
): boolean {
  return (
    isNodeDestructuredFunction(parent, destructuredFunctions) ||
    Boolean(grandParent && isNodeDestructuredFunction(grandParent, destructuredFunctions))
  );
}

/**
 * Check whether the node is a destructured function call
 * @param {Node} node Node to check
 * @param {string[]} destructuredFunctions List of destructured functions
 * @returns {boolean} Whether the node is a destructured function call
 */
function isNodeDestructuredFunction(node: Node, destructuredFunctions: string[]): boolean {
  return isCallExpression(node) && isIdentifier(node.callee) && destructuredFunctions.includes(node.callee.name);
}
