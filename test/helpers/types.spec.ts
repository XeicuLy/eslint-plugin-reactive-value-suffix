import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AST_NODE_TYPES, type ParserServices, type TSESTree } from '@typescript-eslint/utils';
import type { TypeChecker, Type, Node as TSNode } from 'typescript';
import { getTypeString, createReportData, memoize } from '@/rules/helpers/types';

describe('src/rules/helpers/types.ts', () => {
  describe('getTypeString', () => {
    it('should return the type string of a node', () => {
      // Mock the necessary TypeScript services
      const mockNode = {
        type: AST_NODE_TYPES.Identifier,
        name: 'testVariable',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;

      const mockTsNode = {} as TSNode;
      const mockType = {} as Type;

      const mockTypeChecker: TypeChecker = {
        getTypeAtLocation: vi.fn(() => mockType),
        typeToString: vi.fn(() => 'string'),
      } as unknown as TypeChecker;

      const mockParserServices: ParserServices = {
        esTreeNodeToTSNodeMap: new Map([[mockNode, mockTsNode]]),
      } as unknown as ParserServices;

      const result = getTypeString(mockNode, mockTypeChecker, mockParserServices);

      expect(mockTypeChecker.getTypeAtLocation).toHaveBeenCalledWith(mockTsNode);
      expect(mockTypeChecker.typeToString).toHaveBeenCalledWith(mockType);
      expect(result).toBe('string');
    });
  });

  describe('createReportData', () => {
    it('should create a report object with the node, messageId, and name data', () => {
      const mockNode = {
        type: AST_NODE_TYPES.Identifier,
        name: 'testVariable',
        range: [0, 0],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      } as TSESTree.Identifier;

      const messageId = 'testMessageId';

      const result = createReportData(mockNode, messageId);

      expect(result).toEqual({
        node: mockNode,
        messageId,
        data: { name: 'testVariable' },
      });
    });
  });

  describe('memoize', () => {
    let mockFn: () => number;
    let memoizedFn: () => number;

    beforeEach(() => {
      mockFn = vi.fn(() => 42);
      memoizedFn = memoize(mockFn);
    });

    it('should return the result of the function', () => {
      expect(memoizedFn()).toBe(42);
    });

    it('should only call the original function once for multiple calls', () => {
      memoizedFn();
      memoizedFn();
      memoizedFn();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should return the same result for multiple calls', () => {
      const result1 = memoizedFn();
      const result2 = memoizedFn();
      const result3 = memoizedFn();

      expect(result1).toBe(42);
      expect(result2).toBe(42);
      expect(result3).toBe(42);
    });

    it('should cache the result of the first call', () => {
      // First call
      const result1 = memoizedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Create a new mock that would return a different value if called
      const newMockFn = vi.fn(() => 100);
      vi.mocked(mockFn).mockImplementation(() => newMockFn());

      // Subsequent call should still return the original cached value
      const result2 = memoizedFn();
      expect(result2).toBe(result1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(newMockFn).not.toHaveBeenCalled();
    });
  });
});
