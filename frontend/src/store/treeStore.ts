import { create } from "zustand";
import type { LogicalTree, TreeNode } from "../types/tree";
import { generateNodeId } from "../utils/id";

interface TreeState {
  tree: LogicalTree | null;

  /**
   * 直近で追加されたノードのID。
   * UI側はこれを見て「追加直後のノードだけ自動的に編集モードで開く」を実現する。
   * 編集が始まった/別の操作をしたらUI側がクリアする想定。
   */
  lastAddedNodeId: string | null;

  /** 最初のルートノードを作成する */
  createRoot: (text: string) => void;

  /** 指定ノードの子（具体化）を空テキストで追加し、新規ノードのIDを返す */
  addChild: (parentId: string) => string;

  /**
   * 指定ノードの親（抽象化）を空テキストで追加し、新規ノードのIDを返す。
   * target が root の場合は何もせず空文字を返す（root の抽象化は不可）。
   */
  addParent: (targetId: string) => string;

  /** lastAddedNodeId をクリアする（編集開始後にUI側から呼ぶ） */
  clearLastAddedNodeId: () => void;

  /** ノードのテキストを編集する */
  editText: (nodeId: string, text: string) => void;

  /** ノードの折りたたみ状態をトグルする */
  toggleCollapsed: (nodeId: string) => void;

  /** ノードとその子孫をまとめて削除する（root は削除不可） */
  deleteNode: (nodeId: string) => void;

  /** ツリー全体を置き換える（localStorage からの読み込み等で使用） */
  loadTree: (tree: LogicalTree) => void;

  /** ツリーを空に戻す */
  resetTree: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  tree: null,
  lastAddedNodeId: null,

  createRoot: (text) => {
    const id = generateNodeId();
    const rootNode: TreeNode = {
      id,
      text,
      parentId: null,
      childrenIds: [],
      collapsed: false,
    };
    set({
      tree: {
        rootId: id,
        nodes: { [id]: rootNode },
      },
    });
  },

  addChild: (parentId) => {
    const { tree } = get();
    if (!tree) return "";
    const parent = tree.nodes[parentId];
    if (!parent) return "";

    const id = generateNodeId();
    const child: TreeNode = {
      id,
      text: "",
      parentId,
      childrenIds: [],
      collapsed: false,
    };

    set({
      tree: {
        ...tree,
        nodes: {
          ...tree.nodes,
          [id]: child,
          [parentId]: {
            ...parent,
            childrenIds: [...parent.childrenIds, id],
          },
        },
      },
      lastAddedNodeId: id,
    });

    return id;
  },

  /**
   * 指定ノードの親（抽象化）を空テキストで追加し、新規ノードのIDを返す。
   * target が root の場合は何もしない（root の抽象化は禁止）。
   * UI側（TreeNodeCard）では root に対してこのボタン自体を出さないようにしているが、
   * ここでも二重に防御しておく。
   */
  addParent: (targetId) => {
    const { tree } = get();
    if (!tree) return "";
    if (targetId === tree.rootId) return ""; // root は抽象化できない
    const target = tree.nodes[targetId];
    if (!target) return "";

    const newParentId = generateNodeId();

    // target の現在の親（grandParent）の子リストを、newParent に付け替える
    // （grandParent -> newParent -> target という挿入）
    const grandParentId = target.parentId;
    const grandParent = grandParentId ? tree.nodes[grandParentId] : null;

    const newParent: TreeNode = {
      id: newParentId,
      text: "",
      parentId: grandParentId,
      childrenIds: [targetId],
      collapsed: false,
    };

    const updatedNodes: Record<string, TreeNode> = {
      ...tree.nodes,
      [newParentId]: newParent,
      [targetId]: { ...target, parentId: newParentId },
    };

    if (grandParent) {
      updatedNodes[grandParent.id] = {
        ...grandParent,
        childrenIds: grandParent.childrenIds.map((cid) =>
          cid === targetId ? newParentId : cid
        ),
      };
    }

    set({
      tree: {
        rootId: tree.rootId,
        nodes: updatedNodes,
      },
      lastAddedNodeId: newParentId,
    });

    return newParentId;
  },

  clearLastAddedNodeId: () => set({ lastAddedNodeId: null }),

  editText: (nodeId, text) => {
    const { tree } = get();
    if (!tree) return;
    const node = tree.nodes[nodeId];
    if (!node) return;

    set({
      tree: {
        ...tree,
        nodes: {
          ...tree.nodes,
          [nodeId]: { ...node, text },
        },
      },
    });
  },

  toggleCollapsed: (nodeId) => {
    const { tree } = get();
    if (!tree) return;
    const node = tree.nodes[nodeId];
    if (!node) return;

    set({
      tree: {
        ...tree,
        nodes: {
          ...tree.nodes,
          [nodeId]: { ...node, collapsed: !node.collapsed },
        },
      },
    });
  },

  deleteNode: (nodeId) => {
    const { tree } = get();
    if (!tree) return;
    if (nodeId === tree.rootId) return; // root は削除不可
    const node = tree.nodes[nodeId];
    if (!node) return;

    // 削除対象配下を再帰的に収集
    const idsToDelete = new Set<string>();
    const collect = (id: string) => {
      idsToDelete.add(id);
      const n = tree.nodes[id];
      n?.childrenIds.forEach(collect);
    };
    collect(nodeId);

    const updatedNodes: Record<string, TreeNode> = {};
    for (const [id, n] of Object.entries(tree.nodes)) {
      if (idsToDelete.has(id)) continue;
      updatedNodes[id] = n;
    }

    // 親の childrenIds から削除対象を除去
    if (node.parentId && updatedNodes[node.parentId]) {
      const parent = updatedNodes[node.parentId];
      updatedNodes[node.parentId] = {
        ...parent,
        childrenIds: parent.childrenIds.filter((cid) => cid !== nodeId),
      };
    }

    set((state) => ({
      tree: {
        ...tree,
        nodes: updatedNodes,
      },
      lastAddedNodeId:
        state.lastAddedNodeId && idsToDelete.has(state.lastAddedNodeId)
          ? null
          : state.lastAddedNodeId,
    }));
  },

  loadTree: (tree) => set({ tree }),

  resetTree: () => set({ tree: null }),
}));