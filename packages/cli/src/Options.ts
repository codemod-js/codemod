import { existsSync, readFileSync } from 'fs';
import { hasMagic as hasGlob, sync as globSync } from 'globby';
import { resolve } from 'path';
import { sync as resolveSync } from 'resolve';
import Config, { ConfigBuilder, Printer } from './Config';
import { RequireableExtensions } from './extensions';

export interface RunCommand {
  kind: 'run';
  config: Config;
}

export interface HelpCommand {
  kind: 'help';
}

export interface VersionCommand {
  kind: 'version';
}

export type Command = RunCommand | HelpCommand | VersionCommand;

export default class Options {
  constructor(readonly args: Array<string>) {}

  parse(): RunCommand | HelpCommand | VersionCommand {
    let config = new ConfigBuilder();

    for (let i = 0; i < this.args.length; i++) {
      let arg = this.args[i];

      switch (arg) {
        case '-p':
        case '--plugin':
          i++;
          config.addLocalPlugin(this.args[i]);
          break;

        case '--remote-plugin':
          i++;
          config.addRemotePlugin(this.args[i]);
          break;

        case '-o':
        case '--plugin-options':
          i++;
          let nameAndOptions = this.args[i].split('=');
          let name = nameAndOptions[0];
          let optionsRaw = nameAndOptions[1];

          if (optionsRaw && optionsRaw[0] === '@') {
            optionsRaw = readFileSync(optionsRaw.slice(1), {
              encoding: 'utf8'
            });
            config.setOptionsForPlugin(JSON.parse(optionsRaw), name);
          }

          try {
            config.setOptionsForPlugin(JSON.parse(optionsRaw), name);
          } catch (err) {
            throw new Error(
              `unable to parse JSON config for ${name}: ${optionsRaw}`
            );
          }
          break;

        case '--printer':
          i++;
          let rawPrinter = this.args[i];

          if (rawPrinter === Printer.Babel) {
            config.printer(Printer.Babel);
          } else if (rawPrinter === Printer.Prettier) {
            config.printer(Printer.Prettier);
          } else if (rawPrinter === Printer.Recast) {
            config.printer(Printer.Recast);
          } else {
            throw new Error(`unexpected printer value: ${rawPrinter}`);
          }
          break;

        case '-r':
        case '--require':
          i++;
          config.addRequire(getRequirableModulePath(this.args[i]));
          break;

        case '--transpile-plugins':
        case '--no-transpile-plugins':
          config.transpilePlugins(arg === '--transpile-plugins');
          break;

        case '--find-babel-config':
        case '--no-find-babel-config':
          config.findBabelConfig(arg === '--find-babel-config');
          break;

        case '--extensions':
          i++;
          config.extensions(
            new Set(
              this.args[i]
                .split(',')
                .map(ext => (ext[0] === '.' ? ext : `.${ext}`))
            )
          );
          break;

        case '--add-extension':
          i++;
          config.addExtension(this.args[i]);
          break;

        case '--source-type': {
          i++;
          let sourceType = this.args[i];
          if (
            sourceType === 'module' ||
            sourceType === 'script' ||
            sourceType === 'unambiguous'
          ) {
            config.sourceType(sourceType);
          } else {
            throw new Error(
              `expected '--source-type' to be one of "module", "script", ` +
                `or "unambiguous" but got: "${sourceType}"`
            );
          }
          break;
        }

        case '-s':
        case '--stdio':
          config.stdio(true);
          break;

        case '-h':
        case '--help':
          return { kind: 'help' };

        case '--version':
          return { kind: 'version' };

        case '-d':
        case '--dry':
          config.dry(true);
          break;

        default:
          if (arg[0] === '-') {
            throw new Error(`unexpected option: ${arg}`);
          } else {
            if (hasGlob(arg)) {
              config.addSourcePaths(...globSync(arg));
            } else {
              config.addSourcePath(arg);
            }
          }
          break;
      }
    }

    return {
      kind: 'run',
      config: config.build()
    };
  }
}

/**
 * Gets a path that can be passed to `require` for a given module path.
 */
function getRequirableModulePath(modulePath: string): string {
  if (existsSync(modulePath)) {
    return resolve(modulePath);
  }

  for (let ext of RequireableExtensions) {
    if (existsSync(modulePath + ext)) {
      return resolve(modulePath + ext);
    }
  }

  return resolveSync(modulePath, { basedir: process.cwd() });
}
