/**
 * ノードIDを生成する。
 *
 * crypto.randomUUID はモダンブラウザ標準で追加ライブラリ不要。
 * Vite の dev server (https/localhost) でも問題なく動作する。
 */
export function generateNodeId(): string {
  return crypto.randomUUID();
}