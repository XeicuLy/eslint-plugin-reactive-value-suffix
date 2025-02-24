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
 * Validates that a node representing a reactive reference is accessed with a proper `.value` suffix.
 *
 * Retrieves the TypeScript type for the provided AST node and checks whether it is a reactive reference (indicated by the presence of "Ref" in the type string)
 * that is missing the required `.value` suffix. If the node is not part of a non-null assertion and meets these conditions, an error is reported using the provided identifier.
 *
 * @param node - The AST node to inspect.
 * @param name - The identifier used in the error report.
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
 * Validates that an identifier representing a reactive variable is accessed properly.
 *
 * This function checks if the provided identifier corresponds to a reactive variable and whether it is used in a context
 * that requires accessing its underlying value (typically via a `.value` property). It excludes cases where the identifier
 * is part of a declaration, member expression, object key, function argument, or other valid contexts. If none of these
 * situations apply, the function reports a violation.
 *
 * @param node - The identifier node being validated.
 * @param reactiveVariables - List of reactive variable names.
 * @param functionArguments - Names of function arguments exempt from value suffix enforcement.
 * @param destructuredFunctions - Names of functions whose destructured arguments are handled differently.
 * @param ignoredFunctionNames - Function names for which reactive variable rules are not enforced.
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
  if (!node.parent) return;
  if (!reactiveVariables.includes(node.name)) return;

  const parent = node.parent;
  const grandParent = parent.parent;

  if (
    isVariableDeclarator(parent) ||
    isMemberExpression(parent) ||
    isObjectKey(parent, node) ||
    isFunctionArgument(node, functionArguments) ||
    isPropertyValue(parent) ||
    isOriginalDeclaration(parent) ||
    isWatchArgument(node) ||
    isArgumentOfFunction(node, ignoredFunctionNames) ||
    isDestructuredFunctionArgument(parent, grandParent, destructuredFunctions)
  ) {
    return;
  }

  checkNodeAndReport(node, node.name, context, parserServices, checker);
}

/**
 * Ensures that member expressions accessing reactive variables include a ".value" suffix.
 *
 * The function verifies that the member expression's object is an identifier found in the provided list
 * of reactive variable names. If so, it delegates to a dedicated check to enforce the correct access style.
 * Member expressions that represent property values, do not use an identifier as their object, or reference
 * non-reactive variables are ignored.
 *
 * @param node - The member expression AST node to validate.
 * @param variableFromReactiveFunctions - Array of reactive variable names from reactive function calls.
 */
function checkMemberExpression(
  node: MemberExpression,
  variableFromReactiveFunctions: string[],
  context: RuleContext,
  parserServices: ParserServices,
  checker: TypeChecker,
): void {
  if (
    isPropertyValue(node) ||
    !isIdentifier(node.object) ||
    !variableFromReactiveFunctions.includes(node.object.name)
  ) {
    return;
  }

  checkNodeAndReport(node.object, node.object.name, context, parserServices, checker);
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
