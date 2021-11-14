import { strict as assert } from 'assert'
import { promises as fs } from 'fs'
import ignore, { Ignore } from 'ignore'
import { basename, dirname, extname, isAbsolute, join, relative } from 'path'
import { Source } from './TransformRunner'
import globby = require('globby')
import findUp = require('find-up')

export interface Options {
  extensions?: Set<string>
  cwd?: string
}

const DOTGIT = '.git'
const GITIGNORE = '.gitignore'

function pathWithin(container: string, contained: string): string | undefined {
  const pathInContainer = relative(container, contained)
  return pathInContainer.startsWith('../') ? undefined : pathInContainer
}

function pathContains(container: string, contained: string): boolean {
  return typeof pathWithin(container, contained) === 'string'
}

async function readIgnoreFile(path: string): Promise<Ignore> {
  const ig = ignore()
  ig.add(await fs.readFile(path, { encoding: 'utf-8' }))
  return ig
}

async function findGitroot(from: string): Promise<string | undefined> {
  const dotgit = await findUp(DOTGIT, { cwd: from, type: 'directory' })
  return dotgit && dirname(dotgit)
}

class FileFilter {
  private readonly cwd: string
  private readonly extensions?: Set<string>
  private readonly ignoresByGitignoreDirectory = new Map<string, Ignore>()

  constructor({ cwd, extensions }: { cwd: string; extensions?: Set<string> }) {
    this.cwd = cwd
    this.extensions = extensions
  }

  static async build({
    cwd,
    extensions,
  }: {
    cwd: string
    extensions?: Set<string>
  }): Promise<FileFilter> {
    return new FileFilter({
      cwd,
      extensions,
    }).addGitignoreFilesTraversingUpToGitRoot()
  }

  async addGitignoreFilesTraversingUpToGitRoot(
    start = this.cwd
  ): Promise<this> {
    const gitroot = await findGitroot(start)

    if (gitroot) {
      let search = start

      while (pathContains(gitroot, search)) {
        const gitignorePath = await findUp(GITIGNORE, {
          cwd: search,
          type: 'file',
        })

        if (!gitignorePath) {
          break
        }

        await this.addGitignoreFile(gitignorePath)
        search = dirname(dirname(gitignorePath))
      }
    }

    return this
  }

  async addGitignoreFile(gitignorePath: string): Promise<void> {
    if (!this.ignoresByGitignoreDirectory.has(dirname(gitignorePath))) {
      this.ignoresByGitignoreDirectory.set(
        dirname(gitignorePath),
        await readIgnoreFile(gitignorePath)
      )
    }
  }

  test(path: string, { isFile }: { isFile: boolean }): boolean {
    const base = basename(path)

    if (base === DOTGIT || base === GITIGNORE) {
      return true
    }

    if (isFile && this.extensions && !this.extensions.has(extname(path))) {
      return true
    }

    for (const [directory, ig] of this.ignoresByGitignoreDirectory) {
      const pathInDirectory = pathWithin(directory, path)
      if (!pathInDirectory) {
        continue
      }

      if (ig.ignores(pathInDirectory)) {
        return true
      }
    }

    return false
  }
}

async function* iterateDirectory(
  root: string,
  { extensions }: Options = {}
): AsyncGenerator<Source> {
  assert(isAbsolute(root), `expected absolute path: ${root}`)

  const filter = await FileFilter.build({ cwd: root, extensions })
  const queue: Array<string> = [root]

  while (queue.length > 0) {
    const directory = queue.shift() as string
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile() && entry.name === GITIGNORE) {
        const path = join(directory, entry.name)
        await filter.addGitignoreFile(path)
      }
    }

    for (const entry of entries) {
      const path = join(directory, entry.name)

      if (filter.test(path, { isFile: entry.isFile() })) {
        continue
      }

      if (entry.isFile()) {
        const content = await fs.readFile(path, { encoding: 'utf-8' })
        yield { path, content }
      } else if (entry.isDirectory()) {
        queue.push(path)
      }
    }
  }
}

async function* iterateFiles(
  paths: Array<string>,
  { extensions, cwd }: { extensions?: Set<string>; cwd: string }
): AsyncGenerator<Source> {
  const filter = await FileFilter.build({ cwd, extensions })

  for (const path of paths) {
    await filter.addGitignoreFilesTraversingUpToGitRoot(dirname(path))
    if (!filter.test(path, { isFile: true })) {
      const content = await fs.readFile(path, { encoding: 'utf-8' })
      yield { path, content }
    }
  }
}

/**
 * Builds an iterator that loops through all the files in the given paths,
 * matching an allowlist of extensions. Ignores files excluded by git.
 */
export default async function* iterateSources(
  roots: Array<string>,
  {
    extensions,
    cwd = process.cwd(),
  }: { extensions?: Set<string>; cwd?: string } = {}
): AsyncGenerator<Source> {
  assert(isAbsolute(cwd), `expected absolute path: ${cwd}`)

  for (const root of roots) {
    if (globby.hasMagic(root)) {
      const matches = await globby(isAbsolute(root) ? root : join(cwd, root), {
        cwd,
      })
      yield* iterateFiles(matches, { cwd, extensions })
    } else if ((await fs.lstat(root)).isDirectory()) {
      yield* iterateDirectory(isAbsolute(root) ? root : join(cwd, root), {
        cwd,
        extensions,
      })
    } else {
      yield* iterateFiles([root], { cwd })
    }
  }
}
