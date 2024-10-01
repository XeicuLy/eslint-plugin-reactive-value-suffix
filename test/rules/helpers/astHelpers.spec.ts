import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TSESTree } from '@typescript-eslint/utils';
import * as astHelpers from '@/rules/helpers/astHelpers';

const {
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
  isDestructuredFunctionArgument,
  isParentNonNullAssertion,
} = astHelpers;

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
  ExpressionStatement,
  TSNonNullExpression,
} = TSESTree.AST_NODE_TYPES;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('src/rules/helpers/astHelpers.ts', () => {
  describe('isNodeOfType', () => {
    const testCases = [
      {
        func: isIdentifier,
        name: 'isIdentifier',
        validType: Identifier,
        invalidType: CallExpression,
      },
      {
        func: isObjectPattern,
        name: 'isObjectPattern',
        validType: ObjectPattern,
        invalidType: Identifier,
      },
      {
        func: isProperty,
        name: 'isProperty',
        validType: Property,
        invalidType: Identifier,
      },
      {
        func: isCallExpression,
        name: 'isCallExpression',
        validType: CallExpression,
        invalidType: Identifier,
      },
      {
        func: isVariableDeclarator,
        name: 'isVariableDeclarator',
        validType: VariableDeclarator,
        invalidType: Identifier,
      },
      {
        func: isMemberExpression,
        name: 'isMemberExpression',
        validType: MemberExpression,
        invalidType: Identifier,
      },
      {
        func: isAssignmentPattern,
        name: 'isAssignmentPattern',
        validType: AssignmentPattern,
        invalidType: Identifier,
      },
      {
        func: isArrayExpression,
        name: 'isArrayExpression',
        validType: ArrayExpression,
        invalidType: Identifier,
      },
    ];

    function testNodeOfType<T extends TSESTree.Node>(
      node: T | undefined | null,
      type: TSESTree.AST_NODE_TYPES,
      expected: boolean,
    ) {
      it(`should return ${expected} when node type is ${type}`, () => {
        expect(isNodeOfType<T>(node, type)).toBe(expected);
      });
    }

    describe('Basic isNodeOfType functionality', () => {
      testNodeOfType({ type: Identifier } as TSESTree.Identifier, Identifier, true);
      testNodeOfType({ type: ObjectPattern } as TSESTree.ObjectPattern, Identifier, false);
      testNodeOfType(undefined, Identifier, false);
      testNodeOfType(null, Identifier, false);
    });

    describe('Node type validation', () => {
      testCases.forEach(({ func, name, validType, invalidType }) => {
        describe(name, () => {
          it(`should return true for valid ${name}`, () => {
            const node = { type: validType } as TSESTree.Node;
            expect(func(node)).toBe(true);
          });

          it(`should return false for invalid ${name}`, () => {
            const node = { type: invalidType } as TSESTree.Node;
            expect(func(node)).toBe(false);
          });
        });
      });
    });

    describe('isParentNonNullAssertion', () => {
      it('should return true when parent is a TSNonNullExpression', () => {
        const node = { parent: { type: TSNonNullExpression } } as TSESTree.Node;
        expect(isParentNonNullAssertion(node)).toBe(true);
      });

      it('should return false when parent is not a TSNonNullExpression', () => {
        const node = { parent: { type: CallExpression } } as TSESTree.Node;
        expect(isParentNonNullAssertion(node)).toBe(false);
      });

      it('should return false when parent is undefined', () => {
        const node = { parent: undefined } as TSESTree.Node;
        expect(isParentNonNullAssertion(node)).toBe(false);
      });
    });
  });

  describe('addArgumentsToList', () => {
    const functionTestCases = [
      {
        description: 'should add identifier parameters to the list',
        node: {
          type: FunctionDeclaration,
          id: null,
          params: [{ type: Identifier, name: 'param1' }],
          body: { type: BlockStatement, body: [] },
          generator: false,
          async: false,
          declare: false,
          expression: false,
        } as unknown as TSESTree.FunctionDeclaration,
        initialList: [],
        expectedList: ['param1'],
      },
      {
        description: 'should return an empty list if there are no identifier parameters',
        node: {
          type: FunctionDeclaration,
          id: null,
          params: [{ type: ObjectPattern, properties: [] }],
          body: { type: BlockStatement, body: [] },
          generator: false,
          async: false,
          declare: false,
          expression: false,
        } as unknown as TSESTree.FunctionDeclaration,
        initialList: [],
        expectedList: [],
      },
      {
        description: 'should add parameters to an existing list',
        node: {
          type: ArrowFunctionExpression,
          params: [{ type: Identifier, name: 'param2' }],
          body: { type: Identifier, name: 'test' },
          async: false,
          expression: true,
        } as TSESTree.ArrowFunctionExpression,
        initialList: ['param1'],
        expectedList: ['param1', 'param2'],
      },
      {
        description: 'should handle a function with no parameters',
        node: {
          type: FunctionDeclaration,
          id: null,
          params: [],
          body: { type: BlockStatement, body: [] },
          generator: false,
          async: false,
          declare: false,
          expression: false,
        } as unknown as TSESTree.FunctionDeclaration,
        initialList: [],
        expectedList: [],
      },
      {
        description: 'should ensure the original list is not mutated',
        node: {
          type: ArrowFunctionExpression,
          params: [{ type: Identifier, name: 'param3' }],
          body: { type: Identifier, name: 'test' },
          async: false,
          expression: true,
        } as TSESTree.ArrowFunctionExpression,
        initialList: ['param1', 'param2'],
        expectedList: ['param1', 'param2', 'param3'],
      },
    ];

    functionTestCases.forEach(({ description, node, initialList, expectedList }) => {
      it(description, () => {
        const result = addArgumentsToList(node, initialList);
        expect(result).toEqual(expectedList);
      });
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
        init: { type: CallExpression, callee: { type: Identifier, name: 'ref' } },
      } as TSESTree.VariableDeclarator;

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
  });

  describe('addToVariablesListFromCalleeWithArgument', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isFunctionCall').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isObjectPattern').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
    });

    const testCases = [
      {
        description:
          'should add variable names to the list when the node is a reactive function call and id is an ObjectPattern',
        node: {
          type: VariableDeclarator,
          id: {
            type: ObjectPattern,
            properties: [
              { type: Property, value: { type: Identifier, name: 'variable1' } },
              { type: Property, value: { type: Identifier, name: 'variable2' } },
            ],
          },
          init: { type: CallExpression, callee: { type: Identifier, name: 'ref' }, arguments: [] },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: [],
        expectedList: ['variable1', 'variable2'],
      },
      {
        description: 'should not add anything to the list if it is not a reactive function call',
        node: {
          type: VariableDeclarator,
          id: { type: ObjectPattern, properties: [] },
          init: { type: Literal, value: 123 },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: ['existingVar'],
        expectedList: ['existingVar'],
      },
      {
        description: 'should return the original list if node id is not an ObjectPattern',
        node: {
          type: VariableDeclarator,
          id: { type: Identifier, name: 'someVar' },
          init: { type: CallExpression, callee: { type: Identifier, name: 'reactive' }, arguments: [] },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: ['existingVar'],
        expectedList: ['existingVar'],
      },
      {
        description: 'should return the original list if the ObjectPattern has no Identifier properties',
        node: {
          type: VariableDeclarator,
          id: {
            type: ObjectPattern,
            properties: [{ type: Property, value: { type: Literal, value: 123 } }],
          },
          init: { type: CallExpression, callee: { type: Identifier, name: 'ref' }, arguments: [] },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: ['existingVar'],
        expectedList: ['existingVar'],
      },
    ];

    testCases.forEach(({ description, node, initialList, expectedList }) => {
      it(description, () => {
        const result = addToVariablesListFromCalleeWithArgument(node, initialList);
        expect(result).toEqual(expectedList);
      });
    });
  });

  describe('addDestructuredFunctionNames', () => {
    beforeEach(() => {
      vi.spyOn(astHelpers, 'isObjectPattern').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(true);
    });

    const testCases = [
      {
        description: 'should add function names to the list when destructuring functions starting with "use"',
        node: {
          type: VariableDeclarator,
          id: {
            type: ObjectPattern,
            properties: [
              { type: Property, key: { type: Identifier, name: 'useFetch' } },
              { type: Property, key: { type: Identifier, name: 'useData' } },
            ],
          },
          init: { type: CallExpression, callee: { type: Identifier, name: 'useMyComposable' }, arguments: [] },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: [],
        expectedList: ['useFetch', 'useData'],
      },
      {
        description: 'should return the original list if node.id is not an ObjectPattern',
        node: {
          type: VariableDeclarator,
          id: { type: Identifier, name: 'someVar' },
          init: { type: CallExpression, callee: { type: Identifier, name: 'useMyComposable' }, arguments: [] },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: ['existingVar'],
        expectedList: ['existingVar'],
      },
      {
        description: 'should return the original list if node.init is not a CallExpression',
        node: {
          type: VariableDeclarator,
          id: { type: ObjectPattern, properties: [] },
          init: { type: Literal, value: 123 },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: ['existingVar'],
        expectedList: ['existingVar'],
      },
      {
        description: 'should return the original list if node.init.callee is not an Identifier',
        node: {
          type: VariableDeclarator,
          id: { type: ObjectPattern, properties: [] },
          init: { type: CallExpression, callee: { type: Literal, value: '123' }, arguments: [] },
        } as unknown as TSESTree.VariableDeclarator,
        initialList: ['existingVar'],
        expectedList: ['existingVar'],
      },
    ];

    testCases.forEach(({ description, node, initialList, expectedList }) => {
      it(description, () => {
        const result = addDestructuredFunctionNames(node, initialList);
        expect(result).toEqual(expectedList);
      });
    });
  });

  describe('isArgumentOfFunction', () => {
    const ignoredFunctionNames = ['someFunction'];
    const nodeWithArg = {
      type: Identifier,
      name: 'arg1',
      parent: {
        type: CallExpression,
        callee: { type: Identifier, name: 'someFunction' },
        arguments: [{ type: Identifier, name: 'arg1' }],
      },
    } as TSESTree.Identifier;

    const nodeWithoutArg = {
      type: Identifier,
      name: 'arg2',
    } as TSESTree.Identifier;

    const nodeWithNonIdentifierArg = {
      type: Identifier,
      name: 'arg3',
    } as TSESTree.Identifier;

    const nodeWithDifferentFunction = {
      type: Identifier,
      name: 'arg4',
    } as TSESTree.Identifier;

    const callExpressionWithArg = {
      type: CallExpression,
      callee: { type: Identifier, name: 'someFunction' },
      arguments: [{ type: Identifier, name: 'arg1' }],
    } as TSESTree.CallExpression;

    const callExpressionWithoutArg = {
      type: CallExpression,
      callee: { type: Identifier, name: 'someFunction' },
      arguments: [],
    } as unknown as TSESTree.CallExpression;

    const callExpressionWithNonIdentifier = {
      type: CallExpression,
      callee: { type: Literal, value: 'nonIdentifier' },
      arguments: [{ type: Identifier, name: 'arg3' }],
    } as TSESTree.CallExpression;

    const callExpressionWithDifferentFunction = {
      type: CallExpression,
      callee: { type: Identifier, name: 'differentFunction' },
      arguments: [{ type: Identifier, name: 'arg4' }],
    } as TSESTree.CallExpression;

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isMatchingFunctionName').mockReturnValue(true);
    });

    it('should return true if the node is an argument of the specified function', () => {
      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpressionWithArg);

      const result = isArgumentOfFunction(nodeWithArg, ignoredFunctionNames);
      expect(result).toBe(true);
    });

    it('should return false if the node is not an argument of the specified function', () => {
      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpressionWithoutArg);

      const result = isArgumentOfFunction(nodeWithoutArg, ignoredFunctionNames);
      expect(result).toBe(false);
    });

    it('should return false if the callExpression.callee is not an Identifier', () => {
      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpressionWithNonIdentifier);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const result = isArgumentOfFunction(nodeWithNonIdentifierArg, ignoredFunctionNames);
      expect(result).toBe(false);
    });

    it('should return false if the function name does not match any ignored function names', () => {
      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(callExpressionWithDifferentFunction);
      vi.spyOn(astHelpers, 'isMatchingFunctionName').mockReturnValue(false);

      const result = isArgumentOfFunction(nodeWithDifferentFunction, ignoredFunctionNames);
      expect(result).toBe(false);
    });
  });

  describe('isMatchingFunctionName', () => {
    const matchingFunctionTestCases = [
      { name: 'useFetch', ignoredFunctions: [], expected: true },
      { name: 'myFunction', ignoredFunctions: ['myFunction'], expected: true },
      { name: 'fetchData', ignoredFunctions: ['otherFunction'], expected: false },
    ];

    matchingFunctionTestCases.forEach(({ name, ignoredFunctions, expected }) => {
      it(`should return ${expected} for function name "${name}"`, () => {
        const result = isMatchingFunctionName(name, ignoredFunctions);
        expect(result).toBe(expected);
      });
    });
  });

  describe('isWatchArgument', () => {
    let node: TSESTree.Identifier;
    let callExpression: TSESTree.CallExpression;

    beforeEach(() => {
      node = {
        type: Identifier,
        name: 'arg1',
        parent: {
          type: CallExpression,
          callee: { type: Identifier, name: 'watch' },
          arguments: [],
        },
      } as unknown as TSESTree.Identifier;

      callExpression = node.parent as TSESTree.CallExpression;
    });

    const setupMocks = (ancestorCallExpr: TSESTree.CallExpression, isId: boolean, isArrayExpr: boolean) => {
      vi.spyOn(astHelpers, 'getAncestorCallExpression').mockReturnValue(ancestorCallExpr);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(isId);
      vi.spyOn(astHelpers, 'isArrayExpression').mockReturnValue(isArrayExpr);
    };

    it('should return true if the node is the first argument of the "watch" function', () => {
      callExpression.arguments.push(node);
      setupMocks(callExpression, true, false);

      const result = isWatchArgument(node);
      expect(result).toBe(true);
    });

    it('should return false if the node is not an argument of the "watch" function', () => {
      const otherNode = { type: Identifier, name: 'otherArg' } as TSESTree.Identifier;
      callExpression.arguments.push(otherNode);
      setupMocks(callExpression, true, false);

      const result = isWatchArgument(otherNode);
      expect(result).toBe(false);
    });

    it('should return false if the callExpression.callee is not an identifier', () => {
      const callExpressionWithNonIdentifierCallee = {
        ...callExpression,
        callee: { type: Literal, value: 'notAnIdentifier' } as TSESTree.Literal,
      };
      setupMocks(callExpressionWithNonIdentifierCallee, false, false);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });

    it('should return false if the callExpression.callee is not the "watch" function', () => {
      const callExpressionWithDifferentCallee = {
        ...callExpression,
        callee: { type: Identifier, name: 'differentFunction' } as TSESTree.Identifier,
      };
      setupMocks(callExpressionWithDifferentCallee, true, false);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });

    it('should return false if the callee.name is not "watch"', () => {
      const callExpressionWithNonWatchCallee = {
        ...callExpression,
        callee: { type: Identifier, name: 'nonWatchFunction' } as TSESTree.Identifier,
      };
      setupMocks(callExpressionWithNonWatchCallee, true, false);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });

    it('should return true if the node is part of an array expression in the "watch" function arguments', () => {
      const arrayExpression = {
        type: ArrayExpression,
        elements: [node],
      } as TSESTree.ArrayExpression;

      callExpression.arguments.push(arrayExpression);
      setupMocks(callExpression, true, true);

      const result = isWatchArgument(node);
      expect(result).toBe(true);
    });

    it('should return false if the node is not part of the array expression in the "watch" function arguments', () => {
      const arrayExpression = {
        type: ArrayExpression,
        elements: [{ type: Identifier, name: 'otherNode' } as TSESTree.Identifier],
      } as TSESTree.ArrayExpression;

      callExpression.arguments.push(arrayExpression);
      setupMocks(callExpression, true, true);

      const result = isWatchArgument(node);
      expect(result).toBe(false);
    });
  });

  describe('isFunctionCall', () => {
    const functionNames = ['myFunction'];

    const variableDeclaratorWithValidCall = {
      type: VariableDeclarator,
      init: {
        type: CallExpression,
        callee: { type: Identifier, name: 'myFunction' },
      },
    } as TSESTree.VariableDeclarator;

    const variableDeclaratorWithLiteral = {
      type: VariableDeclarator,
      init: {
        type: Literal,
        value: 'someValue',
      },
    } as TSESTree.VariableDeclarator;

    const variableDeclaratorWithNonIdentifierCallee = {
      type: VariableDeclarator,
      init: {
        type: CallExpression,
        callee: { type: Literal, value: 'someValue' },
      },
    } as TSESTree.VariableDeclarator;

    const variableDeclaratorWithOtherFunction = {
      type: VariableDeclarator,
      init: {
        type: CallExpression,
        callee: { type: Identifier, name: 'otherFunction' },
      },
    } as TSESTree.VariableDeclarator;

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(true);
    });

    it('should return true if node.init is a call expression and callee is in the function names list', () => {
      const result = isFunctionCall(variableDeclaratorWithValidCall, functionNames);
      expect(result).toBe(true);
    });

    it('should return false if node.init is not a call expression', () => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(false);

      const result = isFunctionCall(variableDeclaratorWithLiteral, functionNames);
      expect(result).toBe(false);
    });

    it('should return false if node.init.callee is not an identifier', () => {
      vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(false);

      const result = isFunctionCall(variableDeclaratorWithNonIdentifierCallee, functionNames);
      expect(result).toBe(false);
    });

    it('should return false if callee name is not in the function names list', () => {
      const result = isFunctionCall(variableDeclaratorWithOtherFunction, functionNames);
      expect(result).toBe(false);
    });
  });

  describe('getAncestorCallExpression', () => {
    const baseNode = {
      type: Identifier,
    } as TSESTree.Node;

    const nodeWithCallExpressionAncestor = {
      ...baseNode,
      parent: {
        type: ExpressionStatement,
        parent: {
          type: CallExpression,
          callee: { type: Identifier, name: 'myFunction' },
        },
      },
    } as TSESTree.Node;

    const nodeWithoutCallExpressionAncestor = {
      ...baseNode,
      parent: {
        type: ExpressionStatement,
        parent: {
          type: BlockStatement,
        },
      },
    } as TSESTree.Node;

    const nodeWithoutParent = {
      ...baseNode,
      parent: null,
    } as unknown as TSESTree.Node;

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isCallExpression').mockReturnValue(true);
    });

    it('should return the first CallExpression node when found', () => {
      const result = getAncestorCallExpression(nodeWithCallExpressionAncestor);
      expect(result).toEqual({
        type: CallExpression,
        callee: { type: Identifier, name: 'myFunction' },
      });
    });

    it('should return null if no CallExpression is found', () => {
      const result = getAncestorCallExpression(nodeWithoutCallExpressionAncestor);
      expect(result).toBeNull();
    });

    it('should return null if the node has no parent', () => {
      const result = getAncestorCallExpression(nodeWithoutParent);
      expect(result).toBeNull();
    });
  });

  describe('isPropertyValue', () => {
    const baseMemberExpression = {
      type: MemberExpression,
      object: { type: Identifier, name: 'refValue' },
    } as TSESTree.Node;

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isMemberExpression').mockImplementation((node) => node?.type === MemberExpression);
      vi.spyOn(astHelpers, 'isIdentifier').mockImplementation((node) => node?.type === Identifier);
    });

    it('should return true when the node is a MemberExpression with property name "value"', () => {
      const node = {
        ...baseMemberExpression,
        property: { type: Identifier, name: 'value' },
      } as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(true);
    });

    it('should return false when the node is not a MemberExpression', () => {
      const node = {
        type: Literal,
        value: 123,
      } as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(false);
    });

    it('should return false when the property is not an Identifier', () => {
      const node = {
        ...baseMemberExpression,
        property: { type: Literal, value: 'value' },
      } as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(false);
    });

    it('should return false when the property name is not "value"', () => {
      const node = {
        ...baseMemberExpression,
        property: { type: Identifier, name: 'notValue' },
      } as TSESTree.Node;

      const result = isPropertyValue(node);
      expect(result).toBe(false);
    });
  });

  describe('isFunctionArgument', () => {
    const baseNode = (name: string) =>
      ({
        type: Identifier,
        name,
      }) as TSESTree.Identifier;

    const testCases = [
      {
        description: 'should return true if the node name is in the function arguments list',
        nodeName: 'arg1',
        functionArguments: ['arg1', 'arg2'],
        expected: true,
      },
      {
        description: 'should return false if the node name is not in the function arguments list',
        nodeName: 'arg3',
        functionArguments: ['arg1', 'arg2'],
        expected: false,
      },
      {
        description: 'should return false if the function arguments list is empty',
        nodeName: 'arg1',
        functionArguments: [],
        expected: false,
      },
    ];

    testCases.forEach(({ description, nodeName, functionArguments, expected }) => {
      it(description, () => {
        const node = baseNode(nodeName);
        const result = isFunctionArgument(node, functionArguments);
        expect(result).toBe(expected);
      });
    });
  });

  describe('isObjectKey', () => {
    const baseNode = (keyName: string, isLiteral = false) =>
      ({
        type: Property,
        key: isLiteral ? { type: Literal, value: keyName } : { type: Identifier, name: keyName },
      }) as TSESTree.Property;

    const identifierNode = (name: string) =>
      ({
        type: Identifier,
        name,
      }) as TSESTree.Identifier;

    const testCases = [
      {
        description: 'should return true if the node is a property and the key matches the identifier name',
        node: baseNode('key1'),
        identifierNode: identifierNode('key1'),
        spyOnIsProperty: true,
        spyOnIsIdentifier: true,
        expected: true,
      },
      {
        description: 'should return false if the node is not a property',
        node: identifierNode('key1'),
        identifierNode: identifierNode('key1'),
        spyOnIsProperty: false,
        spyOnIsIdentifier: true,
        expected: false,
      },
      {
        description: 'should return false if the node key is not an identifier',
        node: baseNode('key1', true), // isLiteral = true
        identifierNode: identifierNode('key1'),
        spyOnIsProperty: true,
        spyOnIsIdentifier: false,
        expected: false,
      },
      {
        description: 'should return false if the node key does not match the identifier name',
        node: baseNode('key1'),
        identifierNode: identifierNode('key2'),
        spyOnIsProperty: true,
        spyOnIsIdentifier: true,
        expected: false,
      },
    ];

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isProperty').mockImplementation((node) => node?.type === Property);
      vi.spyOn(astHelpers, 'isIdentifier').mockImplementation((node) => node?.type === Identifier);
    });

    testCases.forEach(({ description, node, identifierNode, spyOnIsProperty, spyOnIsIdentifier, expected }) => {
      it(description, () => {
        vi.spyOn(astHelpers, 'isProperty').mockReturnValue(spyOnIsProperty);
        vi.spyOn(astHelpers, 'isIdentifier').mockReturnValue(spyOnIsIdentifier);

        const result = isObjectKey(node, identifierNode);
        expect(result).toBe(expected);
      });
    });
  });

  describe('isOriginalDeclaration', () => {
    const baseNode = (type: string) => ({ type }) as TSESTree.Node;

    const testCases = [
      {
        description: 'should return true if the node is a MemberExpression',
        nodeType: MemberExpression,
        expected: true,
      },
      {
        description: 'should return true if the node is a Property',
        nodeType: Property,
        expected: true,
      },
      {
        description: 'should return false if the node is neither a MemberExpression nor a Property',
        nodeType: Identifier,
        expected: false,
      },
    ];

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isMemberExpression').mockReturnValue(true);
      vi.spyOn(astHelpers, 'isProperty').mockReturnValue(true);
    });

    testCases.forEach(({ description, nodeType, expected }) => {
      it(description, () => {
        const node = baseNode(nodeType);
        const result = isOriginalDeclaration(node);
        expect(result).toBe(expected);
      });
    });
  });

  describe('isNodeDestructuredFunction', () => {
    const testCases = [
      {
        description: 'should return true if the node is a destructured function call',
        node: {
          type: CallExpression,
          callee: { type: Identifier, name: 'useFetch' },
        },
        destructuredFunctions: ['useFetch'],
        expected: true,
      },
      {
        description: 'should return false if the node is not a CallExpression',
        node: {
          type: Identifier,
          callee: { type: Identifier, name: 'useFetch' },
        },
        destructuredFunctions: ['useFetch'],
        expected: false,
      },
      {
        description: 'should return false if the callee is not an Identifier',
        node: {
          type: CallExpression,
          callee: { type: Literal, value: 'useFetch' },
        },
        destructuredFunctions: ['useFetch'],
        expected: false,
      },
      {
        description: 'should return false if the function name is not in the list of destructured functions',
        node: {
          type: CallExpression,
          callee: { type: Identifier, name: 'fetchData' },
        },
        destructuredFunctions: ['useFetch'],
        expected: false,
      },
      {
        description: 'should return true if the function name matches a destructured function',
        node: {
          type: CallExpression,
          callee: { type: Identifier, name: 'useData' },
        },
        destructuredFunctions: ['useData'],
        expected: true,
      },
    ];

    testCases.forEach(({ description, node, destructuredFunctions, expected }) => {
      it(description, () => {
        const result = isNodeDestructuredFunction(node as TSESTree.Node, destructuredFunctions);
        expect(result).toBe(expected);
      });
    });
  });

  describe('isDestructuredFunctionArgument', () => {
    const destructuredFunctions = ['useFetch', 'useData'];
    let parent: TSESTree.CallExpression;
    let grandParent: TSESTree.CallExpression | undefined;

    beforeEach(() => {
      vi.spyOn(astHelpers, 'isNodeDestructuredFunction').mockImplementation((node, functions) =>
        functions.includes((node as TSESTree.Identifier).name),
      );
    });

    it('should return true if the parent is a destructured function', () => {
      parent = {
        type: CallExpression,
        callee: { type: Identifier, name: 'useFetch' },
      } as TSESTree.CallExpression;
      grandParent = undefined;

      const result = isDestructuredFunctionArgument(parent, grandParent, destructuredFunctions);
      expect(result).toBe(true);
    });

    it('should return true if the grandParent is a destructured function', () => {
      parent = {
        type: CallExpression,
        callee: { type: Identifier, name: 'fetchData' },
      } as TSESTree.CallExpression;
      grandParent = {
        type: CallExpression,
        callee: { type: Identifier, name: 'useData' },
      } as TSESTree.CallExpression;

      const result = isDestructuredFunctionArgument(parent, grandParent, destructuredFunctions);
      expect(result).toBe(true);
    });

    it('should return false if neither parent nor grandParent is a destructured function', () => {
      parent = {
        type: CallExpression,
        callee: { type: Identifier, name: 'fetchData' },
      } as TSESTree.CallExpression;
      grandParent = {
        type: CallExpression,
        callee: { type: Identifier, name: 'otherFunction' },
      } as TSESTree.CallExpression;

      const result = isDestructuredFunctionArgument(parent, grandParent, destructuredFunctions);
      expect(result).toBe(false);
    });
  });
});
