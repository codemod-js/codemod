# @codemod/core

Runs babel plugins for codemods, i.e. by preserving formatting using [Recast](https://github.com/benjamn/recast).

## Install

Install from [npm](https://npmjs.com/):

```sh
$ npm install @codemod/core
```

## Usage

```ts
import { transform } from '@codemod/core';

const result = transform('a ?? b', {
  plugins: ['@babel/plugin-proposal-nullish-coalescing-operator']
});

console.log(result.code);
/*
var _a;
(_a = a) !== null && _a !== void 0 ? _a : b
*/
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## Status

[![Build Status](https://travis-ci.com/codemod-js/codemod.svg?branch=master)](https://travis-ci.com/codemod-js/codemod)

## License

Copyright 2019 Brian Donovan

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
