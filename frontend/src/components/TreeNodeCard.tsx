import { useEffect, useRef, useState } from "react";

interface TreeNodeCardProps {
  text: string;
  /** ノードがroot（最上位）かどうか。rootは削除不可にする */
  isRoot: boolean;
  hasChildren: boolean;
  collapsed: boolean;
  /** 追加直後など、最初から編集モードで表示したい場合に true */
  startInEditMode: boolean;
  onEdit: (text: string) => void;
  onAddParent: () => void;
  onAddChild: () => void;
  onDelete: () => void;
  onToggleCollapsed: () => void;
  /** 編集モードに入った（=startInEditModeの役目が済んだ）ことを親に伝える */
  onEditStarted: () => void;
}

/**
 * ツリー上の1ノードを表すカード。
 * クリックでテキスト編集、ホバーで操作ボタンを表示する。
 */
export function TreeNodeCard({
  text,
  isRoot,
  hasChildren,
  collapsed,
  startInEditMode,
  onEdit,
  onAddParent,
  onAddChild,
  onDelete,
  onToggleCollapsed,
  onEditStarted,
}: TreeNodeCardProps) {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [draft, setDraft] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (startInEditMode) {
      setIsEditing(true);
      setDraft(text);
      onEditStarted();
    }
    // text/onEditStarted は意図的に依存配列から外す。
    // startInEditMode が true になった瞬間にだけ反応させたいため。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startInEditMode]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0) {
      onEdit(trimmed);
      setIsEditing(false);
      return;
    }

    // 確定しようとした内容が空のケース。
    // 元々テキストが空だった（＝追加直後で未入力のまま終えようとした）場合は
    // ノードごと削除する。元々テキストがあった場合は誤操作とみなし、元に戻す。
    // root は addChild/addParent 経由では作られない（createRoot のみで作成される）ため
    // 通常ここには来ないが、念のため誤って削除されないよう保護しておく。
    if (text.trim().length === 0 && !isRoot) {
      onDelete();
      return;
    }

    setDraft(text);
    setIsEditing(false);
  };

  return (
    <div className="tree-node-card-wrapper">
      <div className={`tree-node-card ${isRoot ? "is-root" : ""}`}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="tree-node-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
              if (e.key === "Escape") {
                if (text.trim().length === 0 && !isRoot) {
                  onDelete();
                  return;
                }
                setDraft(text);
                setIsEditing(false);
              }
            }}
            rows={1}
          />
        ) : (
          <p
            className="tree-node-text"
            onClick={() => {
              setDraft(text);
              setIsEditing(true);
            }}
          >
            {text}
          </p>
        )}

        <div className="tree-node-actions">
          {!isRoot && (
            <button
              type="button"
              className="tree-node-action tree-node-action--abstract"
              onClick={onAddParent}
              title="抽象化を追加"
            >
              ＋抽象化
            </button>
          )}
          <button
            type="button"
            className="tree-node-action tree-node-action--concrete"
            onClick={onAddChild}
            title="具体化を追加"
          >
            ＋具体化
          </button>
          {hasChildren && (
            <button
              type="button"
              className="tree-node-action tree-node-action--ghost"
              onClick={onToggleCollapsed}
              title={collapsed ? "展開する" : "折りたたむ"}
            >
              {collapsed ? "展開" : "折りたたみ"}
            </button>
          )}
          {!isRoot && (
            <button
              type="button"
              className="tree-node-action tree-node-action--danger"
              onClick={onDelete}
              title="このノードと配下を削除"
            >
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}