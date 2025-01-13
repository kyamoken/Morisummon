# Morisummon

## 概要

カードゲームです。
バックエンドにはDjangoとDjango REST Frameworkを使用し、フロントエンドにはReactとViteを使用しています。

## 技術スタック

### バックエンド
- Django 5.1
- Django REST Framework 3.15.2

### フロントエンド
- React 18
- React Router v7
- Styled Components 6
- Vite 6

## コマンド

◯ 必要なパッケージのインストール/更新
```bash
pip install -r requirements.txt
npm i
```

◯ 開発サーバーの起動
```bash
npm run dev
```

◯ ビルド & 起動
```bash
npm run build
python manage.py runserver
```

## Todo

- [ ] ユーザー認証機能の実装
- [ ] カードデータのCRUD機能
- [ ] 対戦機能の追加
- [ ] UI/UXの改善
- [ ] テストの追加
