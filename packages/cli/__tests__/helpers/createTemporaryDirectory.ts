import tempy from 'tempy'

export default async function createTemporaryDirectory(): Promise<string> {
  return tempy.directory()
}
