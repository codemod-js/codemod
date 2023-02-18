# @codemod/utils

This package contains utilities for writing codemods. Mostly it exists to enable
codemods to avoid depending on `@babel/types`, `@babel/core`, and others as well
as `@codemod/cli`.  It's easy to depend on incompatible versions of these
packages, so this package wraps them and exports a single version of each.

## Install

Install from [npm](https://npmjs.com/):

```sh
$ npm install @codemod/core
```

## Usage

You can use this library directly, but typically it's provided by `@codemod/cli`
when defining a codemod with `defineCodemod`. Here's an example of using it
directly:

```ts
// `m` is `@codemod/matchers`, a library of useful matchers
// `t` is `@babel/types`, babel AST type predicates and builders
import { t, m } from '@codemod/utils'
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## License

Copyright 2023 Brian Donovan

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
