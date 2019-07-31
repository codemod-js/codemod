/* eslint-env node, es6 */

module.exports = function(name) {
  new Promise(resolve => {
    require('ts-node').register({
      compilerOptions: {
        lib: ['esnext'],
        target: 'es2016'
      }
    });

    const main = require(name).default;

    resolve(
      main(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    );
  })
    .then(status => {
      process.exitCode = status;
    })
    .catch(error => {
      process.stderr.write(`[CRASH] ${error.stack}\n`);
      process.exitCode = 1;
    });
};
