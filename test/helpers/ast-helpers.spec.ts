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
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isIdentifier(node)).toBe(true);
    });

    it('should return false for a non-identifier', () => {
      const node = { type: AST_NODE_TYPES.Literal } as TSESTree.Literal;
      expect(isIdentifier(node)).toBe(false);
    });
  });

  describe('isMemberExpression', () => {
    it('should return true for a member expression', () => {
      const node = { type: AST_NODE_TYPES.MemberExpression } as TSESTree.MemberExpression;
      expect(isMemberExpression(node)).toBe(true);
    });

    it('should return false for a non-member expression', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isMemberExpression(node)).toBe(false);
    });
  });

  describe('isProperty', () => {
    it('should return true for a property', () => {
      const node = { type: AST_NODE_TYPES.Property } as TSESTree.Property;
      expect(isProperty(node)).toBe(true);
    });

    it('should return false for a non-property', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isProperty(node)).toBe(false);
    });
  });

  describe('isVariableDeclarator', () => {
    it('should return true for a variable declarator', () => {
      const node = { type: AST_NODE_TYPES.VariableDeclarator } as TSESTree.VariableDeclarator;
      expect(isVariableDeclarator(node)).toBe(true);
    });

    it('should return false for a non-variable declarator', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isVariableDeclarator(node)).toBe(false);
    });
  });

  describe('isArrayPattern', () => {
    it('should return true for an array pattern', () => {
      const node = { type: AST_NODE_TYPES.ArrayPattern } as TSESTree.ArrayPattern;
      expect(isArrayPattern(node)).toBe(true);
    });

    it('should return false for a non-array pattern', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isArrayPattern(node)).toBe(false);
    });
  });

  describe('isArrayExpression', () => {
    it('should return true for an array expression', () => {
      const node = { type: AST_NODE_TYPES.ArrayExpression } as TSESTree.ArrayExpression;
      expect(isArrayExpression(node)).toBe(true);
    });

    it('should return false for a non-array expression', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isArrayExpression(node)).toBe(false);
    });
  });

  describe('isCallExpression', () => {
    it('should return true for a call expression', () => {
      const node = { type: AST_NODE_TYPES.CallExpression } as TSESTree.CallExpression;
      expect(isCallExpression(node)).toBe(true);
    });

    it('should return false for a non-call expression', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isCallExpression(node)).toBe(false);
    });
  });

  describe('isObjectPattern', () => {
    it('should return true for an object pattern', () => {
      const node = { type: AST_NODE_TYPES.ObjectPattern } as TSESTree.ObjectPattern;
      expect(isObjectPattern(node)).toBe(true);
    });

    it('should return false for a non-object pattern', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isObjectPattern(node)).toBe(false);
    });
  });

  describe('isObjectExpression', () => {
    it('should return true for an object expression', () => {
      const node = { type: AST_NODE_TYPES.ObjectExpression } as TSESTree.ObjectExpression;
      expect(isObjectExpression(node)).toBe(true);
    });

    it('should return false for a non-object expression', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isObjectExpression(node)).toBe(false);
    });
  });

  describe('isTSNonNullExpression', () => {
    it('should return true for a TSNonNull expression', () => {
      const node = { type: AST_NODE_TYPES.TSNonNullExpression } as TSESTree.TSNonNullExpression;
      expect(isTSNonNullExpression(node)).toBe(true);
    });

    it('should return false for a non-TSNonNull expression', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isTSNonNullExpression(node)).toBe(false);
    });
  });

  describe('isVariableDeclaration', () => {
    it('should return true for a variable declaration', () => {
      const node = { type: AST_NODE_TYPES.VariableDeclaration } as TSESTree.VariableDeclaration;
      expect(isVariableDeclaration(node)).toBe(true);
    });

    it('should return false for a non-variable declaration', () => {
      const node = { type: AST_NODE_TYPES.Identifier } as TSESTree.Identifier;
      expect(isVariableDeclaration(node)).toBe(false);
    });
  });
});
