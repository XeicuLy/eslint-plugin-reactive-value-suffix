# [2.0.0](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.1.0...v2.0.0) (2024-10-10)


### Bug Fixes

* **rule:** reverse isPropertyValue check logic in checkMemberExpression ([44a5bc8](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/44a5bc80349aa701c8df7dce005a9c4d310e5618)), closes [#37](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/issues/37)


### BREAKING CHANGES

* **rule:** The behavior of checkMemberExpression has changed.The rule now applies when
isPropertyValue is false instead of true,which may affect logic dependent on this condition. This
change is expected to ensure the plugin operates correctly as intended.

# [1.1.0](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.10...v1.1.0) (2024-10-01)


### Features

* added a function to detect the non-null assertion operator ([84d513d](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/84d513dd047527452218171dc73bc6778adefc31)), closes [#31](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/issues/31)

## [1.0.10](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.9...v1.0.10) (2024-09-22)

## [1.0.9](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.8...v1.0.9) (2024-09-18)


### Bug Fixes

* **eslint:** update ignored files in eslint.config.mjs ([e18287d](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/e18287dd82b9f8a64efc4b0ea1f3bdf03df6df32))
* **releaserc:** update branches in releaserc.yaml ([a7e973a](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/a7e973a1ac6be9a05e540892a5e9ec1980bc0ee1))
* **workflows:** update release.yaml to include main branch ([7f0e6d2](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/7f0e6d22e41bb5bce2280bed93034ed04fe56106))

## [1.0.8](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.7...v1.0.8) (2024-09-18)


### Bug Fixes

* **package:** remove "type" field from package.json ([1f98c7a](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/1f98c7a79ac80ba1bc1abdb3c1dc997fa3c54e31))

## [1.0.7](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.6...v1.0.7) (2024-09-18)

## [1.0.6](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.5...v1.0.6) (2024-09-16)

## [1.0.5](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.4...v1.0.5) (2024-09-16)


### Bug Fixes

* **release:** remove successComment and failComment options ([432be66](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/432be66887cbba096c3ffe250614321362bc793f))


### Performance Improvements

* improve performance with early return ([49bf943](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/49bf94345592fdeb84bf032d2f7582c94d95a7cd))

## [1.0.4](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.3...v1.0.4) (2024-09-15)


### Bug Fixes

* trigger release ([b5aa5e2](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/b5aa5e2e146b52115728e0bde86001ddb3e25960))

## [1.0.3](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.2...v1.0.3) (2024-09-15)

## [1.0.2](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.1...v1.0.2) (2024-09-15)


### Bug Fixes

* **package:** remove vite-node dependency from package.json ([11289e0](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/11289e009d0c7e598b022c1e68c88878df46f4de))

## [1.0.1](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/compare/v1.0.0...v1.0.1) (2024-09-15)


### Bug Fixes

* trigger release ([5eac539](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/5eac539257dbf9842b2b98d2b23eb6197811815d))

# 1.0.0 (2024-09-15)


### Features

* add reactive value suffix rule ([47e9900](https://github.com/XeicuLy/eslint-plugin-reactive-value-suffix/commit/47e9900109aee3031f9be49a04d9f3d86c7ab0d8))
