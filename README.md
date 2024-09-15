# About This Plugin

This ESLint plugin enforces adding `.value` when accessing reactive values in the Vue 3 Composition API.

This rule is not perfect, and a review is always recommended.

## Installation

First, install [ESLint](https://eslint.org/) either locally or globally (local installation per project is recommended).

```bash
npm install eslint --save-dev
```

Then, install this plugin.

```bash
npm install eslint-plugin-reactive-value-suffix --save-dev
```

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

Once added, the following code will produce an error:

```js
import { ref } from 'vue';

const count = ref(0);

console.log(count); // Error: Please access the reactive value count with count.value
```

For example:

```js
fooFunction(count); // Error: Please access the reactive value count with count.value
```

However, if `fooFunction` is a function like a composable, this rule can generate noise.

To disable this rule for specific function arguments, add the following configuration:

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

Specify the function names where this rule should not apply in the `functionNamesToIgnoreValueCheck` array.

With this setup:

```js
fooFunction(count); // No Error
```

no error will be generated.

### Parser Configuration

Add the following parser options to your ESLint configuration for correct functionality:

```json
{
  "languageOptions": {
    "parserOptions": {
      "parser": "@typescript-eslint/parser",
      "project": "./tsconfig.json"
    }
  }
}
```

# このプラグインについて

このESLintプラグインは、Vue 3のComposition APIでリアクティブな値にアクセスする際に、.valueを必ず追加することを強制します。

このルールは完璧ではありませんので、常にレビューを行うことをお勧めします。

## インストール

まず、[ESLint](https://eslint.org/)をローカルまたはグローバルにインストールします（プロジェクトごとにローカルインストールを推奨します）。

```bash
npm install eslint --save-dev
```

次に、このプラグインをインストールします。

```bash
npm install eslint-plugin-reactive-value-suffix --save-dev
```

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

ただし、`fooFunction`がcomposablesのような特定の関数である場合、このルールがノイズになることがあります。

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

### parserの設定

ESLintの設定ファイルに以下の設定を追加することで正しく動作することを想定しています。

parserオプションを正しく設定しないとESLintが型情報を正しく取得できないため、この設定が重要です。

```json
{
  "languageOptions": {
    "parserOptions": {
      "parser": "@typescript-eslint/parser",
      "project": "./tsconfig.json"
    }
  }
}
```
