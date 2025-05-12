# Morisummon

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Django](https://img.shields.io/badge/Django-5.1.4-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)

## 目次
- [概要](#概要)
- [環境要件](#環境要件)
  - [バックエンド](#バックエンド)
  - [フロントエンド](#フロントエンド)
- [インストール手順](#インストール手順)
- [環境設定](#環境設定)
  - [Djangoの設定](#djangoの設定)
  - [開発用設定](#開発用設定)
- [開発サーバーの起動](#開発サーバーの起動)
- [ビルドと本番環境](#ビルドと本番環境)
- [トラブルシューティング](#トラブルシューティング)
- [コード構成と機能概要](#コード構成と機能概要)
  - [モデル](#モデル)
  - [ビュー(APIエンドポイント)](#ビューapiエンドポイント)
  - [シリアライザー](#シリアライザー)
  - [リアルタイムバトルシステム](#リアルタイムバトルシステム)
  - [URL設定](#url設定)
- [備考](#備考)

---

## 概要
Morisummonはカードコレクションとデッキ構築、リアルタイム対戦、ソーシャル機能を備えたDjango＋React製のカードゲームアプリケーションです。

---

## 環境要件

### バックエンド
- Python 3.10以上
- Django 5.1.4
- Django REST Framework 3.15.2
- Channels 4.2.0（WebSocketサポート）

```text
# requirements.txt 抜粋
Django==5.1.4          # Line 15
djangorestframework==3.15.2  # Line 19
channels==4.2.0        # Line 7
```

### フロントエンド
- Node.js 18以上
- React 18.3.1
- Vite 6.0.11（ビルドツール）
- Styled Components 6.1.15

```json
// package.json 抜粋
{
  "dependencies": {
    "react": "^18.3.1",            // Line 22
    "styled-components": "^6.1.15" // Line 28
  },
  "devDependencies": {
    "vite": "^6.0.11"              // Line 47
  }
}
```

---

## インストール手順
1. リポジトリをクローン
   ```bash
   git clone https://github.com/kyamoken/Morisummon.git
   cd Morisummon
   ```
2. バックエンド環境のセットアップ
   ```bash
   # （推奨）仮想環境を作成・有効化
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate

   # 依存パッケージをインストール
   pip install -r requirements.txt
   ```
3. フロントエンド環境のセットアップ
   ```bash
   npm install
   ```
4. データベース初期化
   ```bash
   python manage.py migrate
   ```
5. カードデータを読み込む（必要に応じて）
   ```bash
   python load_cards.py
   ```

---

## 環境設定

### Djangoの設定
- デフォルトで `config.settings` モジュールを参照します。

### 開発用設定
- 環境変数 `VITE_DEV=true` を設定すると、Vite の開発モードが有効になります。

```bash
export VITE_DEV=true  # Windowsの場合: set VITE_DEV=true
```

---

## 開発サーバーの起動
```bash
npm run dev
```
- Django開発サーバー（API用）
- Viteホットリロードサーバー（フロントエンド用）

---

## ビルドと本番環境
```bash
# フロントエンドをビルド
npm run build

# Djangoサーバーを起動
python manage.py runserver
```

---

## トラブルシューティング

### Djangoのインポートエラー
- 仮想環境が有効化されているか確認してください。

### フロントエンドの構文チェック
```bash
npm run lint   # ESLintチェック
npm run fix    # 自動修正
```

---

## コード構成と機能概要

### モデル
- **Card**: カード情報（名前・HP・攻撃力・画像・タイプ）
- **UserCard**: ユーザーが所持するカードと枚数
- **Deck**: デッキ情報と検証ルール
- **User**: カスタムユーザーモデル（魔石、ログインボーナス、フレンド管理）
- **ChatGroup / ChatMessage**: チャット機能
- **FriendRequest / Friendship**: フレンド申請・管理
- **Notification**: 通知管理
- **ExchangeSession**: カード交換セッション
- **BattleCardInfo / BattlePlayerInfo / BattlePlayerStatus / BattleRoom**: リアルタイムバトル用ドキュメント
- **Sound**: BGM・効果音管理

### ビュー(APIエンドポイント)
- **ガチャ**: `views.py`
- **デッキ管理**: `views.py`
- **チャット**: `views.py`
- **フレンド管理**: `views.py`
- **通知**: `views.py`
- **カード交換**: `views.py`
- **サウンド取得**: `views.py`

### シリアライザー
- **CardSerializer**
- **DeckSerializer**
- **ChatMessageSerializer / ChatGroupSerializer**
- **UserSerializer**
- **ExchangeSessionSerializer**
- **SoundSerializer**

### リアルタイムバトルシステム
- **BattleConsumer** (WebSocket): `battle_consumer.py`

### URL設定
- `urls.py` で機能ごとにルーティングを定義

---

## 備考
- Django標準モデル（`models.Model`）とMongoDB（`mongoengine.Document`）を併用
- カード収集、デッキ構築、ソーシャル機能、リアルタイム対戦を統合
- WebSocketでのリアルタイム対戦対応
