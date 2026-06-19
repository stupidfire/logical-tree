/**
 * ロジカルツリーを構成する1ノード
 *
 * 「抽象化＝親方向（なぜなら）」「具体化＝子方向（たとえば）」という
 * 単一方向の階層構造を前提とする。ノード自体に方向フラグは持たせない。
 */
export interface TreeNode {
  id: string;
  text: string;
  /** root ノードの場合のみ null */
  parentId: string | null;
  childrenIds: string[];
  collapsed: boolean;
}

/**
 * ロジカルツリー全体の状態
 *
 * nodes は id をキーにした Record にすることで、
 * 親/子の参照を O(1) で引けるようにしている（配列 + find だと
 * ノード数が増えたときにレイアウト計算のたびに線形探索が発生するため）。
 *
 * root は「nodes の中の特別な1ノード」であり、専用の型は持たない。
 * rootId というポインタが指しているだけなので、「親を追加して
 * root を入れ替える」操作も nodes の構造を変えずに行える。
 */
export interface LogicalTree {
  rootId: string;
  nodes: Record<string, TreeNode>;
}

/** 新規ノード作成時、最低限渡す必要がある情報 */
export type NewNodeInput = {
  text: string;
};