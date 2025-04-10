import { describe, it, expect } from 'vitest';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  isIdentifier,
  isMemberExpression,
  isProperty,
  isVariableDeclarator,
  isArrayPattern,
  isArrayExpression,
  isCallExpression,
  isObjectPattern,
  isObjectExpression,
  isTSNonNullExpression,
  isVariableDeclaration,
} from '@/rules/helpers/ast-helpers';
import type { TSESTree } from '@typescript-eslint/utils';

describe('src/rules/helpers/ast-helpers.ts', () => {
  describe('isIdentifier', () => {
    it('should return true for an identifier', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'testIdentifier',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isIdentifier(node)).toBe(true);
    });

    it('should return false for a non-identifier', () => {
      const node = {
        type: AST_NODE_TYPES.Literal,
        value: 'test',
        raw: '"test"',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Literal;
      expect(isIdentifier(node)).toBe(false);
    });
  });

  describe('isMemberExpression', () => {
    it('should return true for a member expression', () => {
      const node = {
        type: AST_NODE_TYPES.MemberExpression,
        object: {
          type: AST_NODE_TYPES.Identifier,
          name: 'obj',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Identifier,
        property: {
          type: AST_NODE_TYPES.Identifier,
          name: 'prop',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Identifier,
        computed: false,
        optional: false,
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.MemberExpression;
      expect(isMemberExpression(node)).toBe(true);
    });

    it('should return false for a non-member expression', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isMemberExpression(node)).toBe(false);
    });
  });

  describe('isProperty', () => {
    it('should return true for a property', () => {
      const node = {
        type: AST_NODE_TYPES.Property,
        key: {
          type: AST_NODE_TYPES.Identifier,
          name: 'key',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Identifier,
        value: {
          type: AST_NODE_TYPES.Literal,
          value: 'value',
          raw: '"value"',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Literal,
        computed: false,
        method: false,
        shorthand: false,
        kind: 'init',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Property;
      expect(isProperty(node)).toBe(true);
    });

    it('should return false for a non-property', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isProperty(node)).toBe(false);
    });
  });

  describe('isVariableDeclarator', () => {
    it('should return true for a variable declarator', () => {
      const node = {
        type: AST_NODE_TYPES.VariableDeclarator,
        id: {
          type: AST_NODE_TYPES.Identifier,
          name: 'variable',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Identifier,
        init: {
          type: AST_NODE_TYPES.Literal,
          value: 'test',
          raw: '"test"',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Literal,
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.VariableDeclarator;
      expect(isVariableDeclarator(node)).toBe(true);
    });

    it('should return false for a non-variable declarator', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isVariableDeclarator(node)).toBe(false);
    });
  });

  describe('isArrayPattern', () => {
    it('should return true for an array pattern', () => {
      const node = {
        type: AST_NODE_TYPES.ArrayPattern,
        elements: [
          {
            type: AST_NODE_TYPES.Identifier,
            name: 'a',
            range: [0, 0],
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          } as TSESTree.Identifier,
        ],
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.ArrayPattern;
      expect(isArrayPattern(node)).toBe(true);
    });

    it('should return false for a non-array pattern', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isArrayPattern(node)).toBe(false);
    });
  });

  describe('isArrayExpression', () => {
    it('should return true for an array expression', () => {
      const node = {
        type: AST_NODE_TYPES.ArrayExpression,
        elements: [
          {
            type: AST_NODE_TYPES.Literal,
            value: 1,
            raw: '1',
            range: [0, 0],
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          } as TSESTree.Literal,
        ],
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.ArrayExpression;
      expect(isArrayExpression(node)).toBe(true);
    });

    it('should return false for a non-array expression', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isArrayExpression(node)).toBe(false);
    });
  });

  describe('isCallExpression', () => {
    it('should return true for a call expression', () => {
      const node = {
        type: AST_NODE_TYPES.CallExpression,
        callee: {
          type: AST_NODE_TYPES.Identifier,
          name: 'func',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Identifier,
        arguments: [] as TSESTree.CallExpressionArgument[],
        optional: false,
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.CallExpression;
      expect(isCallExpression(node)).toBe(true);
    });

    it('should return false for a non-call expression', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isCallExpression(node)).toBe(false);
    });
  });

  describe('isObjectPattern', () => {
    it('should return true for an object pattern', () => {
      const node = {
        type: AST_NODE_TYPES.ObjectPattern,
        properties: [
          {
            type: AST_NODE_TYPES.Property,
            key: {
              type: AST_NODE_TYPES.Identifier,
              name: 'prop',
              range: [0, 0],
              loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            } as TSESTree.Identifier,
            value: {
              type: AST_NODE_TYPES.Identifier,
              name: 'value',
              range: [0, 0],
              loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            } as TSESTree.Identifier,
            computed: false,
            method: false,
            shorthand: false,
            kind: 'init',
            range: [0, 0],
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          } as TSESTree.Property,
        ],
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.ObjectPattern;
      expect(isObjectPattern(node)).toBe(true);
    });

    it('should return false for a non-object pattern', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isObjectPattern(node)).toBe(false);
    });
  });

  describe('isObjectExpression', () => {
    it('should return true for an object expression', () => {
      const node = {
        type: AST_NODE_TYPES.ObjectExpression,
        properties: [
          {
            type: AST_NODE_TYPES.Property,
            key: {
              type: AST_NODE_TYPES.Identifier,
              name: 'prop',
              range: [0, 0],
              loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            } as TSESTree.Identifier,
            value: {
              type: AST_NODE_TYPES.Literal,
              value: 'value',
              raw: '"value"',
              range: [0, 0],
              loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            } as TSESTree.Literal,
            computed: false,
            method: false,
            shorthand: false,
            kind: 'init',
            range: [0, 0],
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          } as TSESTree.Property,
        ],
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.ObjectExpression;
      expect(isObjectExpression(node)).toBe(true);
    });

    it('should return false for a non-object expression', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isObjectExpression(node)).toBe(false);
    });
  });

  describe('isTSNonNullExpression', () => {
    it('should return true for a TSNonNull expression', () => {
      const node = {
        type: AST_NODE_TYPES.TSNonNullExpression,
        expression: {
          type: AST_NODE_TYPES.Identifier,
          name: 'value',
          range: [0, 0],
          loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        } as TSESTree.Identifier,
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.TSNonNullExpression;
      expect(isTSNonNullExpression(node)).toBe(true);
    });

    it('should return false for a non-TSNonNull expression', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isTSNonNullExpression(node)).toBe(false);
    });
  });

  describe('isVariableDeclaration', () => {
    it('should return true for a variable declaration', () => {
      const node = {
        type: AST_NODE_TYPES.VariableDeclaration,
        declarations: [
          {
            type: AST_NODE_TYPES.VariableDeclarator,
            id: {
              type: AST_NODE_TYPES.Identifier,
              name: 'variable',
              range: [0, 0],
              loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            } as TSESTree.Identifier,
            init: {
              type: AST_NODE_TYPES.Literal,
              value: 'test',
              raw: '"test"',
              range: [0, 0],
              loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            } as TSESTree.Literal,
            range: [0, 0],
            loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          } as TSESTree.VariableDeclarator,
        ],
        kind: 'const',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.VariableDeclaration;
      expect(isVariableDeclaration(node)).toBe(true);
    });

    it('should return false for a non-variable declaration', () => {
      const node = {
        type: AST_NODE_TYPES.Identifier,
        name: 'test',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;
      expect(isVariableDeclaration(node)).toBe(false);
    });
  });
});
