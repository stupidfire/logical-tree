# 設計メモ

## 開発方針

- ロジカルツリー専用ツールとする
- 自由配置は基本的に採用しない
- ノード位置は自動レイアウトで決定する
- ユーザーは「抽象化」「具体化」「編集」に集中できるUIを目指す

## データモデル

Tree
├── root
└── nodes

TreeNode
- id
- text
- parentId
- childrenIds
- collapsed

LogicalTree
- rootId
- nodes

## 保存

初期：localStorage

将来：PIN共有用API + DB

## フロントエンド

React
TypeScript
Vite

## バックエンド（予定）

ASP.NET Core