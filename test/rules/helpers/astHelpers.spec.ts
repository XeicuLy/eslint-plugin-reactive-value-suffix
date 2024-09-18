import { describe, it, expect } from 'vitest';
import {
  isIdentifier,
  isObjectPattern,
  isProperty,
  isCallExpression,
  isVariableDeclarator,
  isMemberExpression,
  isAssignmentPattern,
  addArgumentsToList,
  addReactiveVariables,
  isMatchingFunctionName,
} from '@/rules/helpers/astHelpers';
import { TSESTree } from '@typescript-eslint/utils';

describe('Node Type Checking Functions', () => {
  it('should correctly identify an Identifier node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.Identifier, name: 'myVar' } as TSESTree.Identifier;
    expect(isIdentifier(node)).toBe(true);
  });

  it('should return false if node is not an Identifier', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.CallExpression } as TSESTree.CallExpression;
    expect(isIdentifier(node)).toBe(false);
  });

  it('should correctly identify an ObjectPattern node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.ObjectPattern, properties: [] } as unknown as TSESTree.ObjectPattern;
    expect(isObjectPattern(node)).toBe(true);
  });

  it('should return false if node is not an ObjectPattern', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
    expect(isObjectPattern(node)).toBe(false);
  });

  it('should correctly identify a Property node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.Property } as TSESTree.Property;
    expect(isProperty(node)).toBe(true);
  });

  it('should return false if node is not a Property', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.VariableDeclarator } as TSESTree.VariableDeclarator;
    expect(isProperty(node)).toBe(false);
  });

  it('should correctly identify a CallExpression node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.CallExpression } as TSESTree.CallExpression;
    expect(isCallExpression(node)).toBe(true);
  });

  it('should correctly identify a VariableDeclarator node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.VariableDeclarator } as TSESTree.VariableDeclarator;
    expect(isVariableDeclarator(node)).toBe(true);
  });

  it('should correctly identify a MemberExpression node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.MemberExpression } as TSESTree.MemberExpression;
    expect(isMemberExpression(node)).toBe(true);
  });

  it('should correctly identify an AssignmentPattern node', () => {
    const node = { type: TSESTree.AST_NODE_TYPES.AssignmentPattern } as TSESTree.AssignmentPattern;
    expect(isAssignmentPattern(node)).toBe(true);
  });
});

describe('addArgumentsToList', () => {
  it('should add function arguments to the list', () => {
    const node = {
      params: [
        { type: TSESTree.AST_NODE_TYPES.Identifier, name: 'arg1' } as TSESTree.Identifier,
        { type: TSESTree.AST_NODE_TYPES.Identifier, name: 'arg2' } as TSESTree.Identifier,
      ],
    } as TSESTree.FunctionDeclaration;
    const list = ['existing'];
    const result = addArgumentsToList(node, list);
    expect(result).toEqual(['existing', 'arg1', 'arg2']);
  });
});

describe('addReactiveVariables', () => {
  it('should add reactive variable names to the list', () => {
    const node = {
      id: { type: TSESTree.AST_NODE_TYPES.Identifier, name: 'myReactiveVar' } as TSESTree.Identifier,
      init: {
        type: TSESTree.AST_NODE_TYPES.CallExpression,
        callee: { type: TSESTree.AST_NODE_TYPES.Identifier, name: 'ref' },
      },
    } as TSESTree.VariableDeclarator;
    const list = ['existingVar'];
    const result = addReactiveVariables(node, list);
    expect(result).toEqual(['existingVar', 'myReactiveVar']);
  });
});

describe('isMatchingFunctionName', () => {
  it('should return true for matching function name', () => {
    const result = isMatchingFunctionName('useSomething', ['useSomethingElse']);
    expect(result).toBe(true);
  });

  it('should return false for non-matching function name', () => {
    const result = isMatchingFunctionName('doSomething', ['useSomethingElse']);
    expect(result).toBe(false);
  });
});
