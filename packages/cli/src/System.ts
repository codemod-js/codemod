import * as fs from 'fs'

export enum EntryType {
  Unknown,
  File,
  Directory,
}

export interface System {
  // fs
  readFile(path: string): Buffer
  readFile(path: string, encoding: string): string
  writeFile(path: string, contents: Buffer): void
  writeFile(path: string, contents: string, encoding: string): void
  readdir(path: string): Array<string>
  isFile(path: string): boolean
  isDirectory(path: string): boolean
  getEntryType(path: string): EntryType

  // process
  stdin: NodeJS.ReadStream
  stdout: NodeJS.WriteStream
  stderr: NodeJS.WriteStream
}

export const RealSystem: System = {
  readFile: fs.readFileSync,
  writeFile: fs.writeFileSync,
  readdir: fs.readdirSync,

  getEntryType(path: string): EntryType {
    const stat = fs.statSync(path)

    if (stat.isFile()) {
      return EntryType.File
    } else if (stat.isDirectory()) {
      return EntryType.Directory
    } else {
      return EntryType.Unknown
    }
  },

  isFile(path: string): boolean {
    return RealSystem.getEntryType(path) === EntryType.File
  },

  isDirectory(path: string): boolean {
    return RealSystem.getEntryType(path) === EntryType.Directory
  },

  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
}
