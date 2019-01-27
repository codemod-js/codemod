# codemod

Code rewriting tools for automated refactors.

## Why Codemods?

Sometimes big changes to your source code are required, and making such changes by hand is dangerous. For example, codemods can:

- rename across a codebase safely
- upgrade your uses of outdated APIs
- perform complex automated refactors
- much more!

Since codemods are typically just code themselves, you can write one to do whatever you want.

## Getting Started

Check out the docs for [@codemod/cli](packages/cli/README.md) for instructions on installing and using the `codemod` CLI tool.

## Repository Structure

This repository is a monorepo, or multi-package repository. See the READMEs for the packages here:

- [`@codemod/cli` README](packages/cli/README.md)
- [`@codemod/matchers` README](packages/matchers/README.md)

## License

Copyright 2017-2018 Brian Donovan

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
