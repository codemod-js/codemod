export default interface Transformer {
  ready(): Promise<void>;
  transform(filepath: string, content: string): Promise<string>;
  cleanup(): Promise<void>;
}
