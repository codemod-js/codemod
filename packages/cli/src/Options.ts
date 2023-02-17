import { isParserPluginName } from '@codemod/parser'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { sync as resolveSync } from 'resolve'
import { Config, ConfigBuilder } from './Config'
import { RequireableExtensions } from './extensions'

export interface RunCommand {
  kind: 'run'
  config: Config
}

export interface HelpCommand {
  kind: 'help'
}

export interface VersionCommand {
  kind: 'version'
}

export type Command = RunCommand | HelpCommand | VersionCommand

export class Options {
  constructor(readonly args: Array<string>) {}

  parse(): RunCommand | HelpCommand | VersionCommand {
    const config = new ConfigBuilder()
    let lastPlugin: string | undefined

    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i]

      switch (arg) {
        case '-p':
        case '--plugin':
          i++
          lastPlugin = this.args[i]
          config.addLocalPlugin(lastPlugin)
          break

        case '--remote-plugin':
          i++
          lastPlugin = this.args[i]
          config.addRemotePlugin(lastPlugin)
          break

        case '-o':
        case '--plugin-options': {
          i++

          const value = this.args[i]
          let name: string
          let optionsRaw: string

          if (value.startsWith('@')) {
            if (!lastPlugin) {
              throw new Error(
                `${arg} must follow --plugin or --remote-plugin if no name is given`
              )
            }

            optionsRaw = readFileSync(value.slice(1), 'utf8')
            name = lastPlugin
          } else if (/^\s*{/.test(value)) {
            if (!lastPlugin) {
              throw new Error(
                `${arg} must follow --plugin or --remote-plugin if no name is given`
              )
            }

            optionsRaw = value
            name = lastPlugin
          } else {
            const nameAndOptions = value.split('=')
            name = nameAndOptions[0]
            optionsRaw = nameAndOptions[1]

            if (optionsRaw.startsWith('@')) {
              optionsRaw = readFileSync(optionsRaw.slice(1), 'utf8')
            }
          }

          try {
            config.setOptionsForPlugin(JSON.parse(optionsRaw), name)
          } catch (err) {
            throw new Error(
              `unable to parse JSON config for ${name}: ${optionsRaw}`
            )
          }
          break
        }

        case '--parser-plugins': {
          i++
          const value = this.args[i]
          if (!value) {
            throw new Error(`${arg} must be followed by a comma-separated list`)
          }
          for (const plugin of value.split(',')) {
            if (isParserPluginName(plugin)) {
              config.addParserPlugin(plugin)
            } else {
              throw new Error(`unknown parser plugin: ${plugin}`)
            }
          }
          break
        }

        case '-r':
        case '--require':
          i++
          config.addRequire(getRequirableModulePath(this.args[i]))
          break

        case '--transpile-plugins':
        case '--no-transpile-plugins':
          config.transpilePlugins(arg === '--transpile-plugins')
          break

        case '--extensions':
          i++
          config.extensions(
            new Set(
              this.args[i]
                .split(',')
                .map((ext) => (ext[0] === '.' ? ext : `.${ext}`))
            )
          )
          break

        case '--add-extension':
          i++
          config.addExtension(this.args[i])
          break

        case '--source-type': {
          i++
          const sourceType = this.args[i]
          if (
            sourceType === 'module' ||
            sourceType === 'script' ||
            sourceType === 'unambiguous'
          ) {
            config.sourceType(sourceType)
          } else {
            throw new Error(
              `expected '--source-type' to be one of "module", "script", ` +
                `or "unambiguous" but got: "${sourceType}"`
            )
          }
          break
        }

        case '-s':
        case '--stdio':
          config.stdio(true)
          break

        case '-h':
        case '--help':
          return { kind: 'help' }

        case '--version':
          return { kind: 'version' }

        case '-d':
        case '--dry':
          config.dry(true)
          break

        default:
          if (arg[0] === '-') {
            throw new Error(`unexpected option: ${arg}`)
          } else {
            config.addSourcePath(arg)
          }
          break
      }
    }

    return {
      kind: 'run',
      config: config.build(),
    }
  }
}

/**
 * Gets a path that can be passed to `require` for a given module path.
 */
function getRequirableModulePath(modulePath: string): string {
  if (existsSync(modulePath)) {
    return resolve(modulePath)
  }

  for (const ext of RequireableExtensions) {
    if (existsSync(modulePath + ext)) {
      return resolve(modulePath + ext)
    }
  }

  return resolveSync(modulePath, { basedir: process.cwd() })
}
