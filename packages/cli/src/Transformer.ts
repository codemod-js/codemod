export default interface Transformer {
  transform(filepath: string, content: string): Promise<string>
}
