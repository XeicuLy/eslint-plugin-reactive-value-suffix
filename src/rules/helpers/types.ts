import type { ParserServices, TSESTree } from '@typescript-eslint/utils';
import type { TypeChecker } from 'typescript';

export const getTypeString = <T extends TSESTree.Node = TSESTree.Node>(
  node: T,
  typeChecker: TypeChecker,
  parserServices: ParserServices,
): string => {
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = typeChecker.getTypeAtLocation(tsNode);
  const typeString = typeChecker.typeToString(type);
  return typeString;
};

export const createReportData = <RuleMessageIdType extends string>(
  node: TSESTree.Identifier,
  messageId: RuleMessageIdType,
) => ({
  node,
  messageId,
  data: { name: node.name },
});

export const memoize = <T>(fn: () => T): (() => T) => {
  let cached: T | undefined;
  return () => {
    if (cached === undefined) {
      cached = fn();
    }
    return cached;
  };
};
