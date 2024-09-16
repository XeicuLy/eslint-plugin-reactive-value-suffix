# About This Plugin

This ESLint plugin enforces adding `.value` when accessing reactive values in Vue 3's Composition API.

Please note that this rule does not apply to arguments of composable functions or the first argument of `watch` functions.

We recommend always reviewing its output to avoid false positives.

## Installation

First, install [ESLint](https://eslint.org/) (we recommend local installation per project).

```bash
npm install eslint @typescript-eslint/parser vue-eslint-parser --save-dev
```

Next, install this plugin:

```bash
npm install eslint-plugin-reactive-value-suffix --save-dev
```

`@typescript-eslint/parser` and `vue-eslint-parser` are required to properly parse TypeScript and Vue files.

## Usage

Add the following configuration to your ESLint configuration file (e.g. `.eslintrc.js`).

```js
module.exports = {
  plugins: ['reactive-value-suffix'],
  rules: {
    'reactive-value-suffix/suffix': 'error',
  },
};
```

This will trigger an error in the following code:

```js
import { ref } from 'vue';

const count = ref(0);

console.log(count); // Error: Please access the reactive value count with count.value
```

The same error will occur in the following case:

```js
fooFunction(count); // Error: Please access the reactive value count with count.value
```

However, if `fooFunction` is a utility function like a `composable` that directly works with reactive values, this rule might be noisy.

To disable this rule for specific functions, use the following configuration:

```js
module.exports = {
  plugins: ['reactive-value-suffix'],
  rules: {
    'reactive-value-suffix/suffix': [
      'error',
      {
        functionNamesToIgnoreValueCheck: ['fooFunction'],
      },
    ],
  },
};
```

You can specify an array of function names where this rule should be ignored via the `functionNamesToIgnoreValueCheck` option.

With this configuration, the following code will not throw an error:

```js
fooFunction(count); // No Error
```

### Sample Configurations

#### Legacy Config

```cjs
module.exports = {
  plugins: ['reactive-value-suffix'],
  rules: {
    'reactive-value-suffix/suffix': [
      'error',
      {
        functionNamesToIgnoreValueCheck: ['fooFunction'],
      },
    ],
  },
};
```

#### Flat Config

```js
import eslintReactiveValueSuffix from 'eslint-plugin-reactive-value-suffix';

export default [
  {
    plugins: { 'reactive-value-suffix': eslintReactiveValueSuffix },
    rules: {
      'reactive-value-suffix/suffix': [
        'error',
        {
          functionNamesToIgnoreValueCheck: ['fooFunction'],
        },
      ],
    },
  },
];
```

## Parser Configuration

For the plugin to function correctly, you need to configure the parser in your ESLint configuration file.

Without the proper parser settings, ESLint won’t be able to correctly retrieve type information.

### Sample Configurations

#### Legacy Config

```json
{
  "languageOptions": {
    "parser": "vue-eslint-parser",
    "parserOptions": {
      "parser": "@typescript-eslint/parser",
      "project": "./tsconfig.json"
    }
  }
}
```

#### Flat Config

```js
import typescriptEslintParser from '@typescript-eslint/parser';
import vueEslintParser from 'vue-eslint-parser';

export default [
  {
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        project: './tsconfig.json',
      },
    },
  },
];
```

# このプラグインについて

このESLintプラグインは、Vue 3のComposition APIでリアクティブな値にアクセスする際に、`.value`を必ず追加することを強制します。
ただし、composables関数の引数や、watch関数の第一引数などは、チェックされません。

また、このルールはすべてのケースに対応できるわけではありませんので、適切にレビューを行うことをお勧めします。

## インストール

まず、[ESLint](https://eslint.org/)をローカルまたはグローバルにインストールします（プロジェクトごとにローカルインストールを推奨します）。

```bash
npm install eslint @typescript-eslint/parser vue-eslint-parser --save-dev
```

次に、このプラグインをインストールします。

```bash
npm install eslint-plugin-reactive-value-suffix --save-dev
```

`@typescript-eslint/parser`と`vue-eslint-parser`は、TypeScriptとVueの構文解析を行うために必要です。

## 使い方

ESLintの設定ファイル（例：.eslintrc.js）に以下の設定を追加します。

```js
module.exports = {
  plugins: ['reactive-value-suffix'],
  rules: {
    'reactive-value-suffix/suffix': 'error',
  },
};
```

これにより、次のようなコードを書いた場合、エラーが発生します。

```js
import { ref } from 'vue';

const count = ref(0);

console.log(count); // Error: Please access the reactive value count with count.value
```

また、以下のようなケースも同様にエラーが発生します。

```js
fooFunction(count); // Error: Please access the reactive value count with count.value
```

ただし、`fooFunction`がリアクティブな値をそのまま扱うcomposablesのような特定の関数である場合、このルールがノイズになることがあります。

そのような場合には、特定の関数の引数に対してこのルールを無効にするために、以下の設定を行います。

```js
module.exports = {
  plugins: ['reactive-value-suffix'],
  rules: {
    'reactive-value-suffix/suffix': [
      'error',
      {
        functionNamesToIgnoreValueCheck: ['fooFunction'],
      },
    ],
  },
};
```

`functionNamesToIgnoreValueCheck`には、このルールを適用しない関数名を配列で指定します。

この設定により、

```js
fooFunction(count); // No Error
```

と、エラーが発生しなくなります。

### サンプル設定

#### legacy config

```cjs
module.exports = {
  plugins: ['reactive-value-suffix'],
  rules: {
    'reactive-value-suffix/suffix': [
      'error',
      {
        functionNamesToIgnoreValueCheck: ['fooFunction'],
      },
    ],
  },
};
```

#### Flat Config

```js
import eslintReactiveValueSuffix from 'eslint-plugin-reactive-value-suffix';

export default [
  {
    plugins: { 'reactive-value-suffix': eslintReactiveValueSuffix },
    rules: {
      'reactive-value-suffix/suffix': [
        'error',
        {
          functionNamesToIgnoreValueCheck: ['fooFunction'],
        },
      ],
    },
  },
];
```

## parserの設定

ESLintの設定ファイルに以下の設定を追加することで正しく動作することを想定しています。

parserオプションを正しく設定しないとESLintが型情報を正しく取得できないため、この設定が重要です。

### サンプル設定

#### legacy config

```json
{
  "languageOptions": {
    "parser": "vue-eslint-parser",
    "parserOptions": {
      "parser": "@typescript-eslint/parser",
      "project": "./tsconfig.json"
    }
  }
}
```

#### Flat Config

```js
import typescriptEslintParser from '@typescript-eslint/parser';
import vueEslintParser from 'vue-eslint-parser';

export default [
  {
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        project: './tsconfig.json',
      },
    },
  },
];
```
