# CHUNITHM Location Map

CHUNITHMの設置店舗を探せるReact Nativeアプリケーションです。

## 特徴

- 📍 **マップ表示**: Google Mapsを使用した店舗の地図表示
- 🔍 **検索・フィルタ**: キーワード、バージョン、設備による絞り込み
- ⭐ **お気に入り**: 店舗のお気に入り登録・管理
- 📱 **オフライン対応**: ネットワーク接続なしでも基本機能を利用可能
- 📝 **情報更新提案**: ユーザーからの店舗情報更新提案
- 🚀 **高速表示**: キャッシュとオフライン機能による快適な操作

## 技術スタック

- **React Native 0.73** - モバイルアプリフレームワーク
- **TypeScript** - 型安全な開発
- **Redux Toolkit** - 状態管理
- **React Navigation** - ナビゲーション
- **React Native Paper** - Material Design UI
- **React Native Maps** - 地図表示
- **AsyncStorage** - ローカルストレージ
- **NetInfo** - ネットワーク状態監視

## セットアップ

### 前提条件

- Node.js 18以上
- React Native開発環境
- Android Studio (Android開発用)
- Xcode (iOS開発用)

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd chunithm-location-map

# 依存関係のインストール
npm install

# iOS用 (macOSのみ)
cd ios && pod install && cd ..
```

### 設定

環境設定ファイルを作成してください：

```bash
# .env.example をコピーして .env を作成
cp .env.example .env
```

必要な環境変数：
- `GOOGLE_MAPS_API_KEY` - Google Maps API キー
- `API_BASE_URL` - バックエンドAPI のベースURL

### 実行

```bash
# Metro bundler の開始
npm start

# Android エミュレータで実行
npm run android

# iOS シミュレータで実行
npm run ios
```

## テスト

```bash
# テストの実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジ付きテスト実行
npm run test:coverage
```

## ビルド

```bash
# Android リリースビルド
npm run build:android

# iOS リリースビルド
npm run build:ios
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── screens/            # 画面コンポーネント
├── navigation/         # ナビゲーション設定
├── store/             # Redux ストア設定
│   ├── slices/        # Redux Toolkit スライス
│   └── index.ts       # ストア設定
├── services/          # API とサービス層
├── utils/             # ユーティリティ関数
├── types/             # TypeScript型定義
└── App.tsx            # アプリケーションエントリーポイント
```

## 機能詳細

### 🗺️ マップ表示機能
- Google Maps を使用した店舗位置表示
- カスタムマーカーで店舗情報を表示
- 現在地取得と地図の自動センタリング
- マーカークラスタリング対応

### 🔍 検索・フィルタ機能
- キーワード検索（店舗名、住所）
- CHUNITHMバージョンによるフィルタ
- 設備（PASELI、大会対応など）によるフィルタ
- 距離による並び替え

### ⭐ お気に入り機能
- 店舗のお気に入り登録・削除
- お気に入り店舗の一覧表示
- オフライン対応

### 📱 オフライン機能
- ネットワーク状態の自動検知
- オフライン時のデータキャッシュ
- オンライン復帰時の自動同期
- オフライン操作の履歴管理

### 📝 情報更新提案
- 店舗情報の修正提案
- カテゴリ別フィールド選択
- 匿名投稿対応
- オフライン時のローカル保存

## API仕様

バックエンドAPIは以下のエンドポイントを提供する必要があります：

```
GET    /api/stores              # 店舗一覧取得
GET    /api/stores/:id          # 店舗詳細取得
POST   /api/stores/:id/suggestions  # 情報更新提案
POST   /api/favorites           # お気に入り追加
DELETE /api/favorites/:storeId  # お気に入り削除
```

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## サポート

- Issues: GitHub Issues でバグ報告や機能要望を受け付けています
- Wiki: 詳細なドキュメントは Wiki を参照してください
- Discussions: 質問や議論は GitHub Discussions をご利用ください

## 謝辞

- CHUNITHM および関連する商標は株式会社セガの所有物です
- このアプリは非公式のファンメイドプロジェクトです