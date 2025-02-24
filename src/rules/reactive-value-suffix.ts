import { ESLintUtils } from '@typescript-eslint/utils';
import type { TypeChecker } from 'typescript';
import type { TSESLint, ParserServices } from '@typescript-eslint/utils';
import type { Node, Identifier, MemberExpression, RuleListener } from './types/eslint';
import {
  addReactiveVariables,
  addToVariablesListFromCalleeWithArgument,
  addArgumentsToList,
  addDestructuredFunctionNames,
  isArgumentOfFunction,
  isWatchArgument,
  isVariableDeclarator,
  isMemberExpression,
  isPropertyValue,
  isFunctionArgument,
  isObjectKey,
  isOriginalDeclaration,
  isDestructuredFunctionArgument,
  isIdentifier,
  isParentNonNullAssertion,
} from './helpers/astHelpers';

interface Options {
  functionNamesToIgnoreValueCheck?: string[];
}

type MessageId = 'requireValueSuffix';
type RuleContext = TSESLint.RuleContext<MessageId, Options[]>;
type RuleModule = TSESLint.RuleModule<MessageId, Options[]>;

/**
 * Checks the type of the specified node and reports necessary fixes
 * @param node - The node to check
 * @param name - The name of the node
 * @param context - The rule context
 * @param parserServices - The parser services
 * @param checker - The TypeScript type checker
 */
function checkNodeAndReport(
  node: Node,
  name: string,
  context: RuleContext,
  parserServices: ParserServices,
  checker: TypeChecker,
) {
  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
  const type = checker.getTypeAtLocation(tsNode);
  const typeName = checker.typeToString(type);

  const isRefType = typeName.includes('Ref');
  const hasMissingValueSuffix = !typeName.includes('.value');
  const isNotNonNullAssertion = !isParentNonNullAssertion(node);

  if (isRefType && hasMissingValueSuffix && isNotNonNullAssertion) {
    context.report({
      node,
      messageId: 'requireValueSuffix',
      data: { name },
    });
  }
}

/**
 * Checks the identifier node and applies the rule
 * @param node - The identifier node to check
 * @param reactiveVariables - List of reactive variables
 * @param functionArguments - List of function arguments
 * @param destructuredFunctions - List of destructured functions
 * @param context - The rule context
 * @param parserServices - The parser services
 * @param checker - The TypeScript type checker
 * @param ignoredFunctionNames - List of function names to ignore
 */
function checkIdentifier(
  node: Identifier,
  reactiveVariables: string[],
  functionArguments: string[],
  destructuredFunctions: string[],
  context: RuleContext,
  parserServices: ParserServices,
  checker: TypeChecker,
  ignoredFunctionNames: string[],
): void {
  const parent = node.parent;
  const grandParent = parent?.parent;

  if (
    !isVariableDeclarator(parent) &&
    !isMemberExpression(parent) &&
    !isObjectKey(parent, node) &&
    !isFunctionArgument(node, functionArguments) &&
    !isPropertyValue(parent) &&
    !isOriginalDeclaration(parent) &&
    !isWatchArgument(node) &&
    !isArgumentOfFunction(node, ignoredFunctionNames) &&
    !isDestructuredFunctionArgument(parent, grandParent, destructuredFunctions) &&
    reactiveVariables.includes(node.name)
  ) {
    checkNodeAndReport(node, node.name, context, parserServices, checker);
  }
}

/**
 * Checks the member expression node and applies the rule
 * @param node - The member expression node to check
 * @param variableFromReactiveFunctions - List of variables from reactive functions
 * @param context - The rule context
 * @param parserServices - The parser services
 * @param checker - The TypeScript type checker
 */
function checkMemberExpression(
  node: MemberExpression,
  variableFromReactiveFunctions: string[],
  context: RuleContext,
  parserServices: ParserServices,
  checker: TypeChecker,
): void {
  if (!isPropertyValue(node) && isIdentifier(node.object) && variableFromReactiveFunctions.includes(node.object.name)) {
    checkNodeAndReport(node.object, node.object.name, context, parserServices, checker);
  }
}

export const reactiveValueSuffix: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'A rule that enforces accessing reactive values with `.value`',
    },
    schema: [
      {
        type: 'object',
        properties: {
          functionNamesToIgnoreValueCheck: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireValueSuffix: 'Please access the reactive value "{{name}}" with {{name}}.value',
    },
  },
  defaultOptions: [{}],
  /**
   * Creates the implementation of the rule
   * @param context - The rule context
   * @returns The rule listener
   */
  create(context: RuleContext): RuleListener {
    const options: Options = context.options[0] || {};
    const functionNamesToIgnoreValueCheck: string[] = options.functionNamesToIgnoreValueCheck || [];
    let variableFromReactiveFunctions: string[] = [];
    let functionArguments: string[] = [];
    let destructuredFunctions: string[] = [];
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      VariableDeclarator(node) {
        variableFromReactiveFunctions = addReactiveVariables(node, variableFromReactiveFunctions);
        variableFromReactiveFunctions = addToVariablesListFromCalleeWithArgument(node, variableFromReactiveFunctions);
        destructuredFunctions = addDestructuredFunctionNames(node, destructuredFunctions);
      },
      FunctionDeclaration(node) {
        functionArguments = addArgumentsToList(node, functionArguments);
      },
      ArrowFunctionExpression(node) {
        functionArguments = addArgumentsToList(node, functionArguments);
      },
      Identifier(node) {
        checkIdentifier(
          node,
          variableFromReactiveFunctions,
          functionArguments,
          destructuredFunctions,
          context,
          parserServices,
          checker,
          functionNamesToIgnoreValueCheck,
        );
      },
      MemberExpression(node) {
        checkMemberExpression(node, variableFromReactiveFunctions, context, parserServices, checker);
      },
    };
  },
};
