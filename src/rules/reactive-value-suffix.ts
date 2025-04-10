import { ESLintUtils, type TSESLint, type ParserServices, type TSESTree } from '@typescript-eslint/utils';
import { COMPOSABLES_FUNCTION_PATTERN, REACTIVE_FUNCTIONS } from './constants/constant';
import {
  isCallExpression,
  isIdentifier,
  isObjectPattern,
  isProperty,
  isTSNonNullExpression,
  isVariableDeclaration,
} from './helpers/ast-helpers';
import { isPropertyValue, shouldSuppressWarning } from './helpers/function-checks';
import { createReportData, getTypeString, memoize } from './helpers/types';
import type { TypeChecker } from 'typescript';

const RULE_MESSAGE_ID = 'reactiveValueSuffix' as const;

type ReactiveValueRuleOptions = { functionNamesToIgnoreValueCheck?: string[] };
type ReactiveValueRuleContext = Readonly<TSESLint.RuleContext<typeof RULE_MESSAGE_ID, ReactiveValueRuleOptions[]>>;
type PropertyWithIdentifierObject = TSESTree.Property & { key: TSESTree.Identifier; value: TSESTree.Identifier };

const getTypeCheckingServices = (ruleContext: ReactiveValueRuleContext) => {
  const parserServices = ESLintUtils.getParserServices(ruleContext);
  const typeChecker = parserServices.program.getTypeChecker();
  return { parserServices, typeChecker };
};

const needsValueSuffix = (
  variableNode: TSESTree.Identifier,
  typeChecker: TypeChecker,
  parserServices: ParserServices,
): boolean => {
  const variableTypeString = getTypeString(variableNode, typeChecker, parserServices);

  const isRefTypeVariable = variableTypeString.includes('Ref');
  const isValueSuffixMissing = !variableTypeString.includes('.value');
  const hasNonNullAssertion = isTSNonNullExpression(variableNode.parent);

  return isRefTypeVariable && isValueSuffixMissing && !hasNonNullAssertion;
};

const getAllVariableDeclarators = (ruleContext: ReactiveValueRuleContext): TSESTree.VariableDeclarator[] => {
  return ruleContext.sourceCode.ast.body.flatMap((sourceNode) => {
    if (isVariableDeclaration(sourceNode)) {
      return sourceNode.declarations;
    }
    return [];
  });
};

const getStoreToRefsVariableNames = (ruleContext: ReactiveValueRuleContext): string[] => {
  const isStoreToRefsDeclaration = (declaration: TSESTree.VariableDeclarator): boolean =>
    isObjectPattern(declaration.id) &&
    !!declaration.init &&
    isCallExpression(declaration.init) &&
    isIdentifier(declaration.init.callee) &&
    declaration.init.callee.name === 'storeToRefs';

  const extractIdentifierNames = (declaration: TSESTree.VariableDeclarator): string[] => {
    if (!isObjectPattern(declaration.id)) return [];

    return declaration.id.properties
      .filter(
        (property): property is PropertyWithIdentifierObject =>
          isProperty(property) && isIdentifier(property.key) && isIdentifier(property.value),
      )
      .map((property) => property.value.name);
  };

  return getAllVariableDeclarators(ruleContext).filter(isStoreToRefsDeclaration).flatMap(extractIdentifierNames);
};

const getAllReactiveVariableNames = (ruleContext: ReactiveValueRuleContext): string[] => {
  const isReactiveFunctionCall = (declaration: TSESTree.VariableDeclarator): boolean =>
    !!declaration.init &&
    isCallExpression(declaration.init) &&
    isIdentifier(declaration.init.callee) &&
    REACTIVE_FUNCTIONS.includes(declaration.init.callee.name as (typeof REACTIVE_FUNCTIONS)[number]);

  const extractVariableNames = (declaration: TSESTree.VariableDeclarator): string[] => {
    if (isIdentifier(declaration.id)) {
      return [declaration.id.name];
    } else if (isObjectPattern(declaration.id)) {
      return declaration.id.properties
        .filter(
          (property): property is TSESTree.Property & { value: TSESTree.Identifier } =>
            isProperty(property) && isIdentifier(property.value),
        )
        .map((property) => property.value.name);
    }
    return [];
  };

  const reactiveVariableNames = getAllVariableDeclarators(ruleContext)
    .filter(
      (
        declaration,
      ): declaration is TSESTree.VariableDeclarator & {
        init: TSESTree.CallExpression & { callee: TSESTree.Identifier };
      } => isReactiveFunctionCall(declaration),
    )
    .flatMap(extractVariableNames);

  const storeToRefsVariableNames = getStoreToRefsVariableNames(ruleContext);

  return [...reactiveVariableNames, ...storeToRefsVariableNames];
};

const getComposableFunctionVariableNames = (ruleContext: ReactiveValueRuleContext): string[] => {
  const isComposableFunctionCall = (declaration: TSESTree.VariableDeclarator): boolean =>
    !!declaration.init &&
    isCallExpression(declaration.init) &&
    isIdentifier(declaration.init.callee) &&
    COMPOSABLES_FUNCTION_PATTERN.test(declaration.init.callee.name);

  const extractPropertyVariableNames = (declaration: TSESTree.VariableDeclarator): string[] => {
    if (!isObjectPattern(declaration.id)) return [];

    return declaration.id.properties
      .filter(
        (property): property is PropertyWithIdentifierObject =>
          isProperty(property) && isIdentifier(property.key) && isIdentifier(property.value),
      )
      .map((property) => property.value.name);
  };

  return getAllVariableDeclarators(ruleContext)
    .filter(
      (
        declaration,
      ): declaration is TSESTree.VariableDeclarator & {
        id: TSESTree.ObjectPattern;
        init: TSESTree.CallExpression & { callee: TSESTree.Identifier };
      } => isComposableFunctionCall(declaration),
    )
    .flatMap(extractPropertyVariableNames);
};

const processIdentifierNode = (
  identifierNode: TSESTree.Identifier,
  ruleContext: ReactiveValueRuleContext,
  reactiveVariableNames: Readonly<string[]>,
  composableFunctionVariableNames: Readonly<string[]>,
  ignoredFunctionNames: Readonly<string[]>,
): void => {
  if (!identifierNode.parent || !reactiveVariableNames.includes(identifierNode.name)) return;

  const { parserServices, typeChecker } = getTypeCheckingServices(ruleContext);

  if (
    shouldSuppressWarning(identifierNode, identifierNode.parent, composableFunctionVariableNames, ignoredFunctionNames)
  ) {
    return;
  }

  if (needsValueSuffix(identifierNode, typeChecker, parserServices)) {
    ruleContext.report(createReportData(identifierNode, RULE_MESSAGE_ID));
  }
};

const processMemberExpressionNode = (
  memberExpressionNode: TSESTree.MemberExpression,
  ruleContext: ReactiveValueRuleContext,
  reactiveVariableNames: Readonly<string[]>,
): void => {
  if (!isIdentifier(memberExpressionNode.object) || !reactiveVariableNames.includes(memberExpressionNode.object.name)) {
    return;
  }

  if (isIdentifier(memberExpressionNode.property) && memberExpressionNode.property.name === 'value') {
    return;
  }

  if (isPropertyValue(memberExpressionNode.parent)) {
    return;
  }

  const { parserServices, typeChecker } = getTypeCheckingServices(ruleContext);

  if (needsValueSuffix(memberExpressionNode.object, typeChecker, parserServices)) {
    ruleContext.report(createReportData(memberExpressionNode.object, RULE_MESSAGE_ID));
  }
};

const createESLintRule = ESLintUtils.RuleCreator(
  () => 'https://www.npmjs.com/package/eslint-plugin-reactive-value-suffix',
);

export const reactiveValueSuffix = createESLintRule<ReactiveValueRuleOptions[], typeof RULE_MESSAGE_ID>({
  name: 'reactive-value-suffix',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using .value suffix when accessing reactive values in Vue.js',
    },
    messages: {
      [RULE_MESSAGE_ID]: 'Reactive variable "{{name}}" should be accessed as "{{name}}.value"',
    },
    schema: [
      {
        type: 'object',
        properties: {
          functionNamesToIgnoreValueCheck: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(ruleContext: ReactiveValueRuleContext) {
    const ruleOptions = ruleContext.options[0] || {};
    const functionNamesToIgnoreValueCheck = ruleOptions.functionNamesToIgnoreValueCheck || [];

    const getReactiveVariables = memoize(() => getAllReactiveVariableNames(ruleContext));
    const getComposableFunctions = memoize(() => getComposableFunctionVariableNames(ruleContext));
    const reactiveVariableList = getReactiveVariables();
    const composableFunctionList = getComposableFunctions();

    return {
      Identifier(identifierNode) {
        processIdentifierNode(
          identifierNode,
          ruleContext,
          reactiveVariableList,
          composableFunctionList,
          functionNamesToIgnoreValueCheck,
        );
      },
      MemberExpression(memberExpressionNode) {
        processMemberExpressionNode(memberExpressionNode, ruleContext, reactiveVariableList);
      },
    };
  },
});
