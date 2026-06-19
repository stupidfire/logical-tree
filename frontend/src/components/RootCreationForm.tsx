import { useState } from "react";

interface RootCreationFormProps {
  onCreate: (text: string) => void;
}

/**
 * まだツリーが存在しない状態（初回起動時）に表示する、
 * root ノード（最初の疑問・課題）を入力する画面。
 */
export function RootCreationForm({ onCreate }: RootCreationFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onCreate(trimmed);
  };

  return (
    <div className="root-creation">
      <form className="root-creation-form" onSubmit={handleSubmit}>
        <label className="root-creation-label" htmlFor="root-input">
          最初の疑問・課題はなんですか？
        </label>
        <input
          id="root-input"
          className="root-creation-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例：新規顧客が伸び悩んでいる"
          autoFocus
        />
        <button type="submit" className="root-creation-submit" disabled={text.trim().length === 0}>
          ツリーを始める
        </button>
      </form>
    </div>
  );
}