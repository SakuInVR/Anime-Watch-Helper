# 2026 Winter Anime Hub

個人用アニメ視聴管理アプリケーション。Firebaseを使用したクラウド同期機能を備えています。

## 機能

- 📺 2026年冬アニメの視聴状況管理
- ✅ 視聴済み/未視聴のチェック機能
- 🎯 曜日・時間別のフィルタリング
- 🔍 作品検索機能
- ➕ カスタム作品の追加・編集
- 🌐 Firebaseによるクラウド同期
- 👤 匿名認証による自動ログイン

## 技術スタック

- **React 18** - UI ライブラリ
- **Vite** - ビルドツール
- **TailwindCSS** - スタイリング
- **Firebase** - 認証・データベース（Firestore）
- **Lucide React** - アイコン

## セットアップ

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authenticationを有効化し、匿名認証を許可
3. Firestore Databaseを作成（本番モードで開始可）
4. Webアプリを登録し、設定情報を取得

### 3. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、Firebaseの設定情報を入力してください。

**方法1: JSON形式で一括設定（推奨）**

Firebase Consoleから取得した設定をJSON形式で設定：

```env
VITE_FIREBASE_CONFIG={"apiKey":"AIza...","authDomain":"your-project.firebaseapp.com","projectId":"your-project-id","storageBucket":"your-project.appspot.com","messagingSenderId":"123456789","appId":"1:123456789:web:abcdef"}
VITE_APP_ID=anime-tracker-2026
```

**方法2: 個別に設定**

```env
VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
VITE_APP_ID=anime-tracker-2026
```

または、個別に設定することも可能：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_APP_ID=anime-tracker-2026
```

### 4. Firestore セキュリティルールの設定

Firebase Consoleで以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/userState/{document=**} {
      // ユーザーは自分のデータのみ読み書き可能
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスします。

## ビルド

本番環境用のビルド：

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

プレビュー：

```bash
npm run preview
```

## デプロイ

### Vercel

1. [Vercel](https://vercel.com/)にプロジェクトをインポート
2. 環境変数を設定（`.env`の内容）
3. デプロイ

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# dist を公開ディレクトリに設定
firebase deploy
```

### Netlify

1. [Netlify](https://www.netlify.com/)にプロジェクトをインポート
2. ビルドコマンド: `npm run build`
3. 公開ディレクトリ: `dist`
4. 環境変数を設定

## 使用方法

1. **視聴状況のチェック**: 作品カードのチェックボックスをクリックして視聴済みにマーク
2. **非表示**: 目のアイコンをクリックして作品を非表示
3. **作品追加**: 「作品追加」ボタンからカスタム作品を追加
4. **編集**: 作品カードにホバーして編集アイコンをクリック
5. **検索・フィルタ**: 検索バーと曜日ボタンで作品を絞り込み
6. **週次更新**: 「週次更新」ボタンで視聴チェックをリセット（作品データは保持）

## データ構造

Firestore のデータ構造：

```
artifacts/{appId}/users/{userId}/userState/current
  - watchedIds: string[]
  - ignoredIds: string[]
  - customAnime: Anime[]
  - overrides: { [id: string]: Anime }
  - updatedAt: number
```

## ライセンス

MIT

