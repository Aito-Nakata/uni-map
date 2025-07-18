# Vercel デプロイメントガイド

このガイドでは、CHUNITHM Location MapアプリをVercelにデプロイする手順を説明します。

## 🚀 事前準備

### 1. Vercelアカウントの作成
1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでサインアップ/ログイン

### 2. 環境変数の準備
以下の環境変数を用意してください：

```bash
# 必須
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api

# オプション
NEXT_PUBLIC_GA_TRACKING_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id
```

### 3. Google Maps API キーの取得
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Maps JavaScript API を有効化
4. APIキーを作成
5. APIキーの制限を設定（Webサイト制限を推奨）

## 📦 デプロイ手順

### 方法1: Vercel CLI を使用

```bash
# Vercel CLI のインストール
npm i -g vercel

# プロジェクトディレクトリに移動
cd /path/to/uni-app

# 初回デプロイ
vercel

# 環境変数の設定
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add NEXT_PUBLIC_API_BASE_URL

# 再デプロイ
vercel --prod
```

### 方法2: Vercel Dashboard を使用

1. **GitHubリポジトリの作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/chunithm-location-map.git
   git push -u origin main
   ```

2. **Vercelダッシュボードでの設定**
   - [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
   - "New Project" をクリック
   - GitHubリポジトリを選択
   - プロジェクト設定：
     - **Framework Preset**: Other
     - **Build Command**: `npm run build:web`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **環境変数の設定**
   - プロジェクト設定 → Environment Variables
   - 以下の変数を追加：
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = your_api_key
     NEXT_PUBLIC_API_BASE_URL = https://your-api-domain.com/api
     NODE_ENV = production
     ```

4. **デプロイ実行**
   - "Deploy" ボタンをクリック

## 🔧 ビルド設定

### package.json の確認
```json
{
  "scripts": {
    "build:web": "webpack --config webpack.config.js --mode production",
    "web": "webpack serve --config webpack.config.js --mode development"
  }
}
```

### vercel.json の設定
```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🌍 カスタムドメインの設定

1. Vercelダッシュボードでプロジェクトを選択
2. Settings → Domains
3. カスタムドメインを追加
4. DNSレコードを設定：
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

## 🔒 セキュリティ設定

### 1. 環境変数の保護
- 本番環境でのみ使用する環境変数は `VERCEL_ENV=production` で制限
- API キーは適切な制限を設定

### 2. ヘッダーの設定
`vercel.json` で設定済み：
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 📊 パフォーマンス最適化

### 1. キャッシュ設定
- 静的ファイル: 1年キャッシュ
- Service Worker: キャッシュなし
- HTML: 適切なキャッシュ設定

### 2. 画像最適化
```bash
# WebP 形式の画像を使用
# アイコン類は SVG を推奨
```

### 3. バンドルサイズの最適化
```bash
# バンドルサイズの確認
npm run build:web

# 分析ツール (オプション)
npm install --save-dev webpack-bundle-analyzer
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript エラーの確認
npm run lint
```

#### 2. 環境変数が反映されない
- 環境変数名が `NEXT_PUBLIC_` で始まっているか確認
- Vercelダッシュボードで正しく設定されているか確認
- 再デプロイが必要

#### 3. React Native Web の互換性問題
```bash
# react-native-web のバージョン確認
npm list react-native-web

# 互換性のないライブラリの代替案を検討
```

#### 4. Maps API の問題
- API キーの制限設定を確認
- ドメインが許可リストに含まれているか確認
- 使用制限に達していないか確認

## 📈 監視とメンテナンス

### 1. アナリティクス
```javascript
// Google Analytics (オプション)
// src/utils/analytics.ts で設定
```

### 2. エラー監視
```javascript
// Sentry (オプション)
// src/utils/sentry.ts で設定
```

### 3. パフォーマンス監視
- Vercel Analytics を有効化
- Core Web Vitals の監視

## 🔄 継続的デプロイメント

### GitHub Actions (オプション)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## ✅ デプロイ後のチェック項目

- [ ] アプリケーションが正常に動作する
- [ ] Google Maps が表示される
- [ ] 検索・フィルタ機能が動作する
- [ ] オフライン機能が動作する
- [ ] モバイルレスポンシブ対応
- [ ] PWA として動作する
- [ ] パフォーマンステストに合格
- [ ] SEO設定が適切
- [ ] エラー監視が設定済み

## 📞 サポート

問題が発生した場合は以下を確認してください：

1. [Vercel Documentation](https://vercel.com/docs)
2. [React Native Web Documentation](https://necolas.github.io/react-native-web/)
3. プロジェクトの GitHub Issues

---

これでCHUNITHM Location MapアプリのVercelデプロイが完了です！🎉