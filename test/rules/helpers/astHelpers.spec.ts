import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isNodeOfType,
  isIdentifier,
  isObjectPattern,
  isProperty,
  isCallExpression,
  isVariableDeclarator,
  isMemberExpression,
  isAssignmentPattern,
  isArrayExpression,
  addArgumentsToList,
  addReactiveVariables,
  addToVariablesListFromCalleeWithArgument,
  addDestructuredFunctionNames,
  isArgumentOfFunction,
  isMatchingFunctionName,
  isWatchArgument,
  isFunctionCall,
  getAncestorCallExpression,
  isPropertyValue,
  isFunctionArgument,
  isObjectKey,
  isOriginalDeclaration,
  isNodeDestructuredFunction,
} from '@/rules/helpers/astHelpers';
import { TSESTree } from '@typescript-eslint/utils';
import type { Node } from '@/rules/types/eslint';
import * as astHelpers from '@/rules/helpers/astHelpers';

const {
  Identifier,
  ObjectPattern,
  Property,
  CallExpression,
  VariableDeclarator,
  MemberExpression,
  AssignmentPattern,
  ArrayExpression,
  FunctionDeclaration,
  BlockStatement,
  ArrowFunctionExpression,
  Literal,
} = TSESTree.AST_NODE_TYPES;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('src/rules/helpers/astHelpers.ts', () => {
  describe('isNodeOfType', () => {
    it('should return true when node type matches the specified type', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isNodeOfType<TSESTree.Identifier>(node, Identifier)).toBe(true);
    });

    it('should return false when node type does not match the specified type', () => {
      const node: Node = { type: ObjectPattern } as TSESTree.ObjectPattern;
      expect(isNodeOfType<TSESTree.Identifier>(node, Identifier)).toBe(false);
    });

    it('should return false when node is undefined', () => {
      const node = undefined;
      expect(isNodeOfType<TSESTree.Identifier>(node, Identifier)).toBe(false);
    });

    it('should return false when node is null', () => {
      const node = null;
      expect(isNodeOfType<TSESTree.Identifier>(node, Identifier)).toBe(false);
    });
  });

  describe('isIdentifier', () => {
    it('should return true when node is an Identifier', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isIdentifier(node)).toBe(true);
    });

    it('should return false when node is not an Identifier', () => {
      const node = { type: CallExpression } as TSESTree.CallExpression;
      expect(isIdentifier(node)).toBe(false);
    });
  });

  describe('isObjectPattern', () => {
    it('should return true when node is an ObjectPattern', () => {
      const node = { type: ObjectPattern } as TSESTree.ObjectPattern;
      expect(isObjectPattern(node)).toBe(true);
    });

    it('should return false when node is not an ObjectPattern', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isObjectPattern(node)).toBe(false);
    });
  });

  describe('isProperty', () => {
    it('should return true when node is a Property', () => {
      const node = { type: Property } as TSESTree.Property;
      expect(isProperty(node)).toBe(true);
    });

    it('should return false when node is not a Property', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isProperty(node)).toBe(false);
    });
  });

  describe('isCallExpression', () => {
    it('should return true when node is a CallExpression', () => {
      const node = { type: CallExpression } as TSESTree.CallExpression;
      expect(isCallExpression(node)).toBe(true);
    });

    it('should return false when node is not a CallExpression', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isCallExpression(node)).toBe(false);
    });
  });

  describe('isVariableDeclarator', () => {
    it('should return true when node is a VariableDeclarator', () => {
      const node = { type: VariableDeclarator } as TSESTree.VariableDeclarator;
      expect(isVariableDeclarator(node)).toBe(true);
    });

    it('should return false when node is not a VariableDeclarator', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isVariableDeclarator(node)).toBe(false);
    });
  });

  describe('isMemberExpression', () => {
    it('should return true when node is a MemberExpression', () => {
      const node = { type: MemberExpression } as TSESTree.MemberExpression;
      expect(isMemberExpression(node)).toBe(true);
    });

    it('should return false when node is not a MemberExpression', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isMemberExpression(node)).toBe(false);
    });
  });

  describe('isAssignmentPattern', () => {
    it('should return true when node is an AssignmentPattern', () => {
      const node = { type: AssignmentPattern } as TSESTree.AssignmentPattern;
      expect(isAssignmentPattern(node)).toBe(true);
    });

    it('should return false when node is not an AssignmentPattern', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isAssignmentPattern(node)).toBe(false);
    });
  });

  describe('isArrayExpression', () => {
    it('should return true when node is an ArrayExpression', () => {
      const node = { type: ArrayExpression } as TSESTree.ArrayExpression;
      expect(isArrayExpression(node)).toBe(true);
    });

    it('should return false when node is not an ArrayExpression', () => {
      const node = { type: Identifier } as TSESTree.Identifier;
      expect(isArrayExpression(node)).toBe(false);
    });
  });

  describe('addArgumentsToList', () => {
    it('should add identifier parameters to the list', () => {
      const node = {
        type: FunctionDeclaration,
        id: null,
        params: [{ type: Identifier, name: 'param1' }] as TSESTree.Identifier[],
        body: { type: BlockStatement, body: [] } as unknown as TSESTree.BlockStatement,
        generator: false,
        async: false,
        expression: false,
      } as TSESTree.FunctionDeclaration;

      const list: string[] = [];
      const result = addArgumentsToList(node, list);
      expect(result).toEqual(['param1']);
    });

    it('should return an empty list if there are no identifier parameters', () => {
      const node = {
        type: FunctionDeclaration,
        id: null,
        params: [{ type: ObjectPattern, properties: [] }] as unknown as TSESTree.ObjectPattern[],
        body: { type: BlockStatement, body: [] } as unknown as TSESTree.BlockStatement,
        generator: false,
        async: false,
        expression: false,
      } as TSESTree.FunctionDeclaration;

      const list: string[] = [];
      const result = addArgumentsToList(node, list);
      expect(result).toEqual([]);
    });

    it('should add parameters to an existing list', () => {
      const node = {
        type: ArrowFunctionExpression,
        params: [{ type: Identifier, name: 'param2' }] as TSESTree.Identifier[],
        body: { type: Identifier, name: 'test' } as TSESTree.Identifier,
        expression: false,
        async: false,
      } as TSESTree.ArrowFunctionExpression;

      const list = ['param1'];
      const result = addArgumentsToList(node, list);
      expect(result).toEqual(['param1', 'param2']);
    });

    it('should handle a function with no parameters', () => {
      const node = {
        type: FunctionDeclaration,
        id: null,
        params: [],
        body: { type: BlockStatement, body: [] } as unknown as TSESTree.BlockStatement,
        generator: false,
        async: false,
        expression: false,
      } as unknown as TSESTree.FunctionDeclaration;

      const list: string[] = [];
      const result = addArgumentsToList(node, list);
      expect(result).toEqual([]);
    });

    it('should ensure the original list is not mutated', () => {
      const node = {
        type: ArrowFunctionExpression,
        params: [{ type: Identifier, name: 'param3' }] as TSESTree.Identifier[],
        body: { type: Identifier, name: 'test' } as TSESTree.Identifier,
        expression: false,
        async: false,
      } as TSESTree.ArrowFunctionExpression;

      const list = ['param1', 'param2'];
      const result = addArgumentsToList(node, list);
      expect(list).toEqual(['param1', 'param2']);
      expect(result).toEqual(['param1', 'param2', 'param3']);
    });
  });

  describe('addReactiveVariables', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isFunctionCall').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
    });

    it('should add variable to the list when it is a function call to a reactive function', () => {
      const node = {
        type: VariableDeclarator,
        id: { type: Identifier, name: 'reactiveVar' },
        init: { type: CallExpression, callee: { type: Identifier, name: 'ref' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = [];
      const result = addReactiveVariables(node, list);
      expect(result).toEqual(['reactiveVar']);
    });

    it('should not add anything to the list when it is not a reactive function call', () => {
      vi.spyOn(astHelpers, 'isFunctionCall').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: Identifier, name: 'nonReactiveVar' },
        init: { type: Literal, value: 123 },
      } as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addReactiveVariables(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if node id is not an identifier', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: ObjectPattern, properties: [] },
        init: { type: CallExpression, callee: { type: Identifier, name: 'reactive' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addReactiveVariables(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list when the node init is not a function call', () => {
      vi.spyOn(astHelpers, 'isFunctionCall').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: Identifier, name: 'someVar' },
        init: { type: MemberExpression },
      } as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addReactiveVariables(node, list);
      expect(result).toEqual(['existingVar']);
    });
  });

  describe('addToVariablesListFromCalleeWithArgument', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isFunctionCall').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isObjectPattern').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
    });

    it('should add variable names to the list when the node is a reactive function call and id is an ObjectPattern', () => {
      const node = {
        type: VariableDeclarator,
        id: {
          type: ObjectPattern,
          properties: [
            { type: Property, value: { type: Identifier, name: 'variable1' } },
            { type: Property, value: { type: Identifier, name: 'variable2' } },
          ],
        },
        init: { type: CallExpression, callee: { type: Identifier, name: 'ref' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = [];
      const result = addToVariablesListFromCalleeWithArgument(node, list);
      expect(result).toEqual(['variable1', 'variable2']);
    });

    it('should not add anything to the list if it is not a reactive function call', () => {
      vi.spyOn(astHelpers, 'isFunctionCall').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: ObjectPattern, properties: [] },
        init: { type: Literal, value: 123 },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addToVariablesListFromCalleeWithArgument(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if node id is not an ObjectPattern', () => {
      vi.spyOn(astHelpers, 'isObjectPattern').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: Identifier, name: 'someVar' },
        init: { type: CallExpression, callee: { type: Identifier, name: 'reactive' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addToVariablesListFromCalleeWithArgument(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if the ObjectPattern has no Identifier properties', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: {
          type: ObjectPattern,
          properties: [{ type: Property, value: { type: Literal, value: 123 } }],
        },
        init: { type: CallExpression, callee: { type: Identifier, name: 'ref' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addToVariablesListFromCalleeWithArgument(node, list);
      expect(result).toEqual(['existingVar']);
    });
  });

  describe('addDestructuredFunctionNames', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isObjectPattern').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(true);
    });

    it('should add function names to the list when destructuring functions starting with "use"', () => {
      const node = {
        type: VariableDeclarator,
        id: {
          type: ObjectPattern,
          properties: [
            { type: Property, key: { type: Identifier, name: 'useFetch' } },
            { type: Property, key: { type: Identifier, name: 'useData' } },
          ],
        },
        init: { type: CallExpression, callee: { type: Identifier, name: 'useMyComposable' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = [];
      const result = addDestructuredFunctionNames(node, list);
      expect(result).toEqual(['useFetch', 'useData']);
    });

    it('should return the original list if node.id is not an ObjectPattern', () => {
      vi.spyOn(astHelpers, 'isObjectPattern').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: Identifier, name: 'someVar' },
        init: { type: CallExpression, callee: { type: Identifier, name: 'useMyComposable' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addDestructuredFunctionNames(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if node.init is not a CallExpression', () => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: ObjectPattern, properties: [] },
        init: { type: Literal, value: 123 },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addDestructuredFunctionNames(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if node.init.callee is not an Identifier', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: { type: ObjectPattern, properties: [] },
        init: { type: CallExpression, callee: { type: Literal, value: '123' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addDestructuredFunctionNames(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if the function name does not match COMPOSABLES_FUNCTION_PATTERN', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);

      const node = {
        type: VariableDeclarator,
        id: {
          type: ObjectPattern,
          properties: [{ type: Property, key: { type: Identifier, name: 'fetchData' } }],
        },
        init: { type: CallExpression, callee: { type: Identifier, name: 'fetchMyComposable' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];

      const result = addDestructuredFunctionNames(node, list);
      expect(result).toEqual(['existingVar']);
    });

    it('should return the original list if property.key is not an Identifier', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const node = {
        type: VariableDeclarator,
        id: {
          type: ObjectPattern,
          properties: [{ type: Property, key: { type: Literal, value: 123 } }],
        },
        init: { type: CallExpression, callee: { type: Identifier, name: 'useMyComposable' }, arguments: [] },
      } as unknown as TSESTree.VariableDeclarator;

      const list: string[] = ['existingVar'];
      const result = addDestructuredFunctionNames(node, list);
      expect(result).toEqual(['existingVar']);
    });
  });

  describe('isArgumentOfFunction', () => {
    beforeEach(() => {
      const callExpression = {
        type: CallExpression,
        callee: { type: Identifier, name: 'someFunction' },
        arguments: [{ type: Identifier, name: 'arg1' }],
      } as unknown as TSESTree.CallExpression;

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isMatchingFunctionName').mockReturnValue(true);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return true if the node is an argument of the specified function', () => {
      const node = {
        type: Identifier,
        name: 'arg1',
        parent: {
          type: CallExpression,
          callee: { type: Identifier, name: 'someFunction' },
          arguments: [{ type: Identifier, name: 'arg1' }],
        },
      } as TSESTree.Identifier;

      const ignoredFunctionNames = ['someFunction'];

      const result = isArgumentOfFunction(node, ignoredFunctionNames);
      expect(result).toBe(true);
    });

    it('should return false if the node is not an argument of the specified function', () => {
      const node = {
        type: Identifier,
        name: 'arg2',
        parent: {
          type: CallExpression,
          callee: { type: Identifier, name: 'someFunction' },
          arguments: [],
        },
      } as unknown as TSESTree.Identifier;

      const ignoredFunctionNames = ['someFunction'];

      const result = isArgumentOfFunction(node, ignoredFunctionNames);
      expect(result).toBe(false);
    });

    it('should return false if the node is not an argument of the specified function', () => {
      const node = { type: Identifier, name: 'arg2' } as TSESTree.Identifier;

      const ignoredFunctionNames = ['someFunction'];
      const result = isArgumentOfFunction(node, ignoredFunctionNames);
      expect(result).toBe(false);
    });

    it('should return false if the callExpression.callee is not an Identifier', () => {
      const node = { type: Identifier, name: 'arg3' } as TSESTree.Identifier;
      const callExpression = {
        type: CallExpression,
        callee: { type: Literal, value: 'nonIdentifier' },
        arguments: [node],
      } as unknown as TSESTree.CallExpression;

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const ignoredFunctionNames = ['someFunction'];
      const result = isArgumentOfFunction(node, ignoredFunctionNames);
      expect(result).toBe(false);
    });

    it('should return false if the function name does not match any ignored function names', () => {
      const node = { type: Identifier, name: 'arg4' } as TSESTree.Identifier;
      const callExpression = {
        type: CallExpression,
        callee: { type: Identifier, name: 'differentFunction' },
        arguments: [node],
      } as unknown as TSESTree.CallExpression;

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isMatchingFunctionName').mockReturnValue(false);

      const ignoredFunctionNames = ['someFunction'];
      const result = isArgumentOfFunction(node, ignoredFunctionNames);
      expect(result).toBe(false);
    });
  });

  describe('isMatchingFunctionName', () => {
    it('should return true if the function name matches the composables pattern', () => {
      const result = isMatchingFunctionName('useFetch', []);
      expect(result).toBe(true);
    });

    it('should return true if the function name is in the ignored function names list', () => {
      const result = isMatchingFunctionName('myFunction', ['myFunction']);
      expect(result).toBe(true);
    });

    it('should return true if the function name matches both the composables pattern and is in ignored function names', () => {
      const result = isMatchingFunctionName('useFetch', ['useFetch']);
      expect(result).toBe(true);
    });

    it('should return false if the function name does not match the pattern or ignored list', () => {
      const result = isMatchingFunctionName('fetchData', ['otherFunction']);
      expect(result).toBe(false);
    });
  });

  describe('isWatchArgument', () => {
    let node: TSESTree.Identifier;

    beforeEach(() => {
      vi.clearAllMocks();
      node = {
        type: Identifier,
        name: 'arg1',
        parent: {
          type: CallExpression,
          callee: { type: Identifier, name: 'watch' },
          arguments: [],
        },
      } as unknown as TSESTree.Identifier;
    });

    it('should return true if the node is the first argument of the "watch" function', () => {
      const callExpression = node.parent as TSESTree.CallExpression;
      callExpression.arguments.push(node);

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);

      const result = isWatchArgument(node);
      expect(result).toBe(true);
    });

    it('should return true if the node is inside an array expression as the first argument of the "watch" function', () => {
      const arrayExpression = {
        type: ArrayExpression,
        elements: [node],
      } as unknown as TSESTree.ArrayExpression;

      const callExpression = node.parent as TSESTree.CallExpression;
      callExpression.arguments.push(arrayExpression);

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isArrayExpression').mockReturnValue(true);

      const result = isWatchArgument(node);
      expect(result).toBe(true);
    });

    it('should return false if the node is not an argument of the "watch" function', () => {
      const otherNode = {
        type: Identifier,
        name: 'otherArg',
      } as TSESTree.Identifier;

      const callExpression = node.parent as TSESTree.CallExpression;
      callExpression.arguments.push(otherNode);

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });

    it('should return false if the callee is not "watch"', () => {
      const callExpression = {
        ...node.parent,
        callee: { type: Identifier, name: 'notWatch' },
      } as unknown as TSESTree.CallExpression;

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });

    it('should return false if the first argument is not an identifier or in an array expression', () => {
      const LiteralNode = {
        type: Literal,
        value: 'someValue',
      } as TSESTree.Literal;

      const callExpression = node.parent as TSESTree.CallExpression;
      callExpression.arguments.push(LiteralNode);

      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isArrayExpression').mockReturnValue(false);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });
  });

  describe('isFunctionCall', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true if node.init is a call expression and callee is in the function names list', () => {
      const node = {
        type: 'VariableDeclarator',
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'myFunction' },
        },
      } as unknown as TSESTree.VariableDeclarator;

      const functionNames = ['myFunction'];
      const result = isFunctionCall(node, functionNames);
      expect(result).toBe(true);
    });

    it('should return false if node.init is not a call expression', () => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(false);

      const node = {
        type: 'VariableDeclarator',
        init: {
          type: Literal,
          value: 'someValue',
        },
      } as unknown as TSESTree.VariableDeclarator;

      const functionNames = ['myFunction'];
      const result = isFunctionCall(node, functionNames);
      expect(result).toBe(false);
    });

    it('should return false if node.init.callee is not an identifier', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const node = {
        type: 'VariableDeclarator',
        init: {
          type: 'CallExpression',
          callee: { type: Literal, value: 'someValue' },
        },
      } as unknown as TSESTree.VariableDeclarator;

      const functionNames = ['myFunction'];
      const result = isFunctionCall(node, functionNames);
      expect(result).toBe(false);
    });

    it('should return false if callee name is not in the function names list', () => {
      const node = {
        type: 'VariableDeclarator',
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'otherFunction' },
        },
      } as unknown as TSESTree.VariableDeclarator;

      const functionNames = ['myFunction'];
      const result = isFunctionCall(node, functionNames);
      expect(result).toBe(false);
    });
  });

  describe('getAncestorCallExpression', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(true);
    });

    it('should return the first CallExpression node when found', () => {
      const node = {
        type: 'Identifier',
        parent: {
          type: 'ExpressionStatement',
          parent: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'myFunction' },
          },
        },
      } as unknown as TSESTree.Node;

      const result = getAncestorCallExpression(node);
      expect(result).toEqual({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFunction' },
      });
    });

    it('should return null if no CallExpression is found', () => {
      const node = {
        type: 'Identifier',
        parent: {
          type: 'ExpressionStatement',
          parent: {
            type: 'BlockStatement',
          },
        },
      } as unknown as TSESTree.Node;

      const result = getAncestorCallExpression(node);
      expect(result).toBeNull();
    });

    it('should return null if the node has no parent', () => {
      const node = {
        type: 'Identifier',
        parent: null,
      } as unknown as TSESTree.Node;

      const result = getAncestorCallExpression(node);
      expect(result).toBeNull();
    });

    it('should return null if there are no ancestors', () => {
      const node = {
        type: 'Identifier',
      } as unknown as TSESTree.Node;

      const result = getAncestorCallExpression(node);
      expect(result).toBeNull();
    });
  });

  describe('isPropertyValue', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isMemberExpression').mockImplementation((node) => node?.type === 'MemberExpression');
      vi.spyOn(astHelpers, 'isIdentifier').mockImplementation((node) => node?.type === 'Identifier');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true when the node is a MemberExpression with property name "value"', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'refValue' },
        property: { type: 'Identifier', name: 'value' },
      } as unknown as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(true);
    });

    it('should return false when the node is not a MemberExpression', () => {
      const node = {
        type: Literal,
        value: 123,
      } as unknown as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(false);
    });

    it('should return false when the property is not an Identifier', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'refValue' },
        property: { type: Literal, value: 'value' },
      } as unknown as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(false);
    });

    it('should return false when the property name is not "value"', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'refValue' },
        property: { type: 'Identifier', name: 'notValue' },
      } as unknown as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(false);
    });
  });

  describe('isFunctionArgument', () => {
    it('should return true if the node name is in the function arguments list', () => {
      const node = { type: 'Identifier', name: 'arg1' } as TSESTree.Identifier;
      const functionArguments = ['arg1', 'arg2'];

      const result = isFunctionArgument(node, functionArguments);
      expect(result).toBe(true);
    });

    it('should return false if the node name is not in the function arguments list', () => {
      const node = { type: 'Identifier', name: 'arg3' } as TSESTree.Identifier;
      const functionArguments = ['arg1', 'arg2'];

      const result = isFunctionArgument(node, functionArguments);
      expect(result).toBe(false);
    });

    it('should return false if the function arguments list is empty', () => {
      const node = { type: 'Identifier', name: 'arg1' } as TSESTree.Identifier;
      const functionArguments: string[] = [];

      const result = isFunctionArgument(node, functionArguments);
      expect(result).toBe(false);
    });

    it('should return true if the node name matches exactly in the function arguments list', () => {
      const node = { type: 'Identifier', name: 'arg' } as TSESTree.Identifier;
      const functionArguments = ['arg'];

      const result = isFunctionArgument(node, functionArguments);
      expect(result).toBe(true);
    });

    it('should return false if the node name partially matches any of the function arguments', () => {
      const node = { type: 'Identifier', name: 'arg' } as TSESTree.Identifier;
      const functionArguments = ['argument'];

      const result = isFunctionArgument(node, functionArguments);
      expect(result).toBe(false);
    });
  });

  describe('isObjectKey', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true if the node is a property and the key matches the identifier name', () => {
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'key1' },
      } as TSESTree.Property;

      const identifierNode = { type: 'Identifier', name: 'key1' } as TSESTree.Identifier;

      const result = isObjectKey(node, identifierNode);
      expect(result).toBe(true);
    });

    it('should return false if the node is not a property', () => {
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(false);

      const node = { type: 'Identifier', name: 'key1' } as TSESTree.Identifier;
      const identifierNode = { type: 'Identifier', name: 'key1' } as TSESTree.Identifier;

      const result = isObjectKey(node, identifierNode);
      expect(result).toBe(false);
    });

    it('should return false if the node key is not an identifier', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const node = {
        type: 'Property',
        key: { type: Literal, value: 'key1' },
      } as unknown as TSESTree.Property;

      const identifierNode = { type: 'Identifier', name: 'key1' } as TSESTree.Identifier;

      const result = isObjectKey(node, identifierNode);
      expect(result).toBe(false);
    });

    it('should return false if the node key does not match the identifier name', () => {
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'key1' },
      } as TSESTree.Property;

      const identifierNode = { type: 'Identifier', name: 'key2' } as TSESTree.Identifier;

      const result = isObjectKey(node, identifierNode);
      expect(result).toBe(false);
    });
  });

  describe('isOriginalDeclaration', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isMemberExpression').mockReturnValue(false);
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(false);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true if the node is a MemberExpression', () => {
      vi.spyOn(astHelpers, 'isMemberExpression').mockReturnValue(true);

      const node = { type: 'MemberExpression' } as TSESTree.MemberExpression;

      const result = isOriginalDeclaration(node);
      expect(result).toBe(true);
    });

    it('should return true if the node is a Property', () => {
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(true);

      const node = { type: 'Property' } as TSESTree.Property;

      const result = isOriginalDeclaration(node);
      expect(result).toBe(true);
    });

    it('should return false if the node is neither a MemberExpression nor a Property', () => {
      vi.spyOn(astHelpers, 'isMemberExpression').mockReturnValue(false);
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(false);

      const node = { type: 'Identifier' } as TSESTree.Identifier;

      const result = isOriginalDeclaration(node);
      expect(result).toBe(false);
    });
  });

  describe('isNodeDestructuredFunction', () => {
    it('should return true if the node is a destructured function call', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'useFetch' },
      } as unknown as TSESTree.Node;

      const destructuredFunctions = ['useFetch'];

      const result = isNodeDestructuredFunction(node, destructuredFunctions);

      expect(result).toBe(true);
    });

    it('should return false if the node is not a CallExpression', () => {
      const node = {
        type: 'Identifier',
        callee: { type: 'Identifier', name: 'useFetch' },
      } as unknown as TSESTree.Node;

      const destructuredFunctions = ['useFetch'];

      const result = isNodeDestructuredFunction(node, destructuredFunctions);

      expect(result).toBe(false);
    });

    it('should return false if the callee is not an Identifier', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: Literal, value: 'useFetch' },
      } as unknown as TSESTree.Node;

      const destructuredFunctions = ['useFetch'];

      const result = isNodeDestructuredFunction(node, destructuredFunctions);

      expect(result).toBe(false);
    });

    it('should return false if the function name is not in the list of destructured functions', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetchData' },
      } as unknown as TSESTree.Node;

      const destructuredFunctions = ['useFetch'];

      const result = isNodeDestructuredFunction(node, destructuredFunctions);

      expect(result).toBe(false);
    });

    it('should return true if the function name matches a destructured function', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'useData' },
      } as unknown as TSESTree.Node;

      const destructuredFunctions = ['useData'];

      const result = isNodeDestructuredFunction(node, destructuredFunctions);

      expect(result).toBe(true);
    });
  });
});
