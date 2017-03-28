# babel-codemod

babel-codemod rewrites JavaScript using babel plugins.

## Install

Install from npm:

```
$ npm install -g babel-codemod
```

This will install the runner as `codemod`.

## Usage

The primary interface is as a command line tool, usually run like so:

```
$ codemod --plugin transform-module-name \
  path/to/file.js \
  another/file.js
```

This will re-write the files `path/to/file.js` and `another/file.js` by transforming them with the babel plugin `transform-module-name`. Multiple plugins may be specified, and multiple file or directories may be re-written at once.

For more detailed options, run `codemod --help`.

## Writing a Plugin

There are [many, many existing plugins](https://www.npmjs.com/browse/keyword/babel-plugin) that you can use. However, if you need to write your own you should consult the [babel handbook](https://github.com/thejameskyle/babel-handbook). If you publish a plugin intended specifically as a codemod, consider using both the [`babel-plugin`](https://www.npmjs.com/browse/keyword/babel-plugin) and [`babel-codemod`](https://www.npmjs.com/browse/keyword/babel-codemod) keywords.

While testing out your plugin, you may find it useful to use the `--require` option when running `codemod` if your plugin is written using JavaScript syntax not supported by the current version of node. For example:

```
# Run a local plugin written with newer JavaScript syntax.
$ codemod --require babel-register --plugin ./my-plugin.js src/

# Run a local plugin written with TypeScript.
$ codemod --require ts-node/register --plugin ./my-plugin.ts src/
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for information on setting up the project for development and on contributing to the project.

## License
Copyright 2017 Square, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
