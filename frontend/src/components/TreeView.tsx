import type { LogicalTree } from "../types/tree";
import { TreeNodeCard } from "./TreeNodeCard";

interface TreeViewProps {
  tree: LogicalTree;
  lastAddedNodeId: string | null;
  onEditText: (nodeId: string, text: string) => void;
  onAddParent: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onToggleCollapsed: (nodeId: string) => void;
  onEditStarted: () => void;
}

/**
 * ロジカルツリー全体を表示する。
 *
 * root は最上位の固定された起点であり、root に対して「抽象化（さらに親）」を
 * 追加することはできない（root の抽象化を許可すると、新しい親ノードを
 * 空のまま削除した際にツリー全体が連鎖削除されてしまうため、UI/store の
 * 両方で root への addParent を禁止している）。
 * そのため、ここでは常に現在の tree.rootId を起点に下方向（具体化）だけを
 * 再帰的に描画すればよい。
 */
export function TreeView({
  tree,
  lastAddedNodeId,
  onEditText,
  onAddParent,
  onAddChild,
  onDeleteNode,
  onToggleCollapsed,
  onEditStarted,
}: TreeViewProps) {
  return (
    <div className="tree-view">
      <TreeBranch
        nodeId={tree.rootId}
        tree={tree}
        isRoot
        lastAddedNodeId={lastAddedNodeId}
        onEditText={onEditText}
        onAddParent={onAddParent}
        onAddChild={onAddChild}
        onDeleteNode={onDeleteNode}
        onToggleCollapsed={onToggleCollapsed}
        onEditStarted={onEditStarted}
      />
    </div>
  );
}

interface TreeBranchProps {
  nodeId: string;
  tree: LogicalTree;
  isRoot?: boolean;
  lastAddedNodeId: string | null;
  onEditText: (nodeId: string, text: string) => void;
  onAddParent: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onToggleCollapsed: (nodeId: string) => void;
  onEditStarted: () => void;
}

function TreeBranch({
  nodeId,
  tree,
  isRoot = false,
  lastAddedNodeId,
  onEditText,
  onAddParent,
  onAddChild,
  onDeleteNode,
  onToggleCollapsed,
  onEditStarted,
}: TreeBranchProps) {
  const node = tree.nodes[nodeId];
  if (!node) return null;

  const hasChildren = node.childrenIds.length > 0;

  return (
    <div className="tree-branch">
      <TreeNodeCard
        text={node.text}
        isRoot={isRoot}
        hasChildren={hasChildren}
        collapsed={node.collapsed}
        startInEditMode={lastAddedNodeId === node.id}
        onEdit={(text) => onEditText(node.id, text)}
        onAddParent={() => onAddParent(node.id)}
        onAddChild={() => onAddChild(node.id)}
        onDelete={() => onDeleteNode(node.id)}
        onToggleCollapsed={() => onToggleCollapsed(node.id)}
        onEditStarted={onEditStarted}
      />

      {hasChildren && !node.collapsed && (
        <div className="tree-branch-children">
          <div className="tree-branch-connector" aria-hidden="true" />
          <div className="tree-branch-children-row">
            {node.childrenIds.map((childId) => (
              <TreeBranch
                key={childId}
                nodeId={childId}
                tree={tree}
                lastAddedNodeId={lastAddedNodeId}
                onEditText={onEditText}
                onAddParent={onAddParent}
                onAddChild={onAddChild}
                onDeleteNode={onDeleteNode}
                onToggleCollapsed={onToggleCollapsed}
                onEditStarted={onEditStarted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}