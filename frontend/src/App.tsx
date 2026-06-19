import { useTreeStore } from "./store/treeStore";
import { RootCreationForm } from "./components/RootCreationForm";
import { TreeView } from "./components/TreeView";

export default function App() {
  const tree = useTreeStore((s) => s.tree);
  const lastAddedNodeId = useTreeStore((s) => s.lastAddedNodeId);
  const createRoot = useTreeStore((s) => s.createRoot);
  const addChild = useTreeStore((s) => s.addChild);
  const addParent = useTreeStore((s) => s.addParent);
  const clearLastAddedNodeId = useTreeStore((s) => s.clearLastAddedNodeId);
  const editText = useTreeStore((s) => s.editText);
  const toggleCollapsed = useTreeStore((s) => s.toggleCollapsed);
  const deleteNode = useTreeStore((s) => s.deleteNode);
  const resetTree = useTreeStore((s) => s.resetTree);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">logical tree</h1>
        {tree && (
          <button type="button" className="app-reset" onClick={resetTree}>
            新しいツリーを始める
          </button>
        )}
      </header>

      <main className="app-main">
        {tree ? (
          <TreeView
            tree={tree}
            lastAddedNodeId={lastAddedNodeId}
            onEditText={editText}
            onAddParent={addParent}
            onAddChild={addChild}
            onDeleteNode={deleteNode}
            onToggleCollapsed={toggleCollapsed}
            onEditStarted={clearLastAddedNodeId}
          />
        ) : (
          <RootCreationForm onCreate={createRoot} />
        )}
      </main>
    </div>
  );
}