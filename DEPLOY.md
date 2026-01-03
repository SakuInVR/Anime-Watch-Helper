# デプロイ手順ガイド

このドキュメントでは、GitHubへのプッシュとFirebase Hostingへのデプロイ手順を説明します。

## 前提条件

1. **Gitのインストール**
   - Gitがインストールされていない場合: https://git-scm.com/download/win からダウンロードしてインストール
   - インストール後、PowerShellを再起動

2. **GitHubアカウント**
   - https://github.com/ でアカウント作成

3. **Firebase CLIのインストール**
   ```bash
   npm install -g firebase-tools
   ```

## 手順1: Gitリポジトリの初期化

### 1-1. Gitの状態確認

```bash
git status
```

既にGitリポジトリが初期化されている場合は、このコマンドで状態が表示されます。

### 1-2. Gitリポジトリの初期化（初回のみ）

```bash
git init
```

### 1-3. ファイルのステージング

```bash
git add .
```

### 1-4. 初回コミット

```bash
git commit -m "Initial commit: Anime Watch Helper"
```

## 手順2: GitHubリポジトリの作成とプッシュ

### 2-1. GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. リポジトリ名を入力（例: `anime-watch-helper`）
3. 「Public」または「Private」を選択
4. **「Initialize this repository with a README」はチェックしない**
5. 「Create repository」をクリック

### 2-2. リモートリポジトリの追加

GitHubで作成したリポジトリのURLを取得し、以下のコマンドを実行（`YOUR_USERNAME`と`YOUR_REPO_NAME`を実際の値に置き換え）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

例：
```bash
git remote add origin https://github.com/sakui/anime-watch-helper.git
```

### 2-3. ブランチ名をmainに変更（必要に応じて）

```bash
git branch -M main
```

### 2-4. GitHubにプッシュ

```bash
git push -u origin main
```

GitHubの認証が求められる場合：
- パーソナルアクセストークンを使用する場合は、パスワードの代わりにトークンを入力
- GitHub CLIを使用している場合は自動認証されます

## 手順3: Firebase Hostingへのデプロイ

### 3-1. Firebase CLIでログイン

```bash
firebase login
```

ブラウザが開き、Googleアカウントでログインします。

### 3-2. Firebaseプロジェクトの選択

```bash
firebase use --add
```

プロジェクト一覧が表示されるので、使用するFirebaseプロジェクトを選択します。

### 3-3. ビルド

```bash
npm run build
```

`dist`ディレクトリにビルドファイルが生成されます。

### 3-4. Firestoreセキュリティルールのデプロイ

```bash
firebase deploy --only firestore:rules
```

### 3-5. Hostingへのデプロイ

```bash
firebase deploy --only hosting
```

または、すべてを一度にデプロイ：

```bash
firebase deploy
```

### 3-6. デプロイURLの確認

デプロイが完了すると、以下のようなURLが表示されます：

```
✔  Deploy complete!

Hosting URL: https://YOUR_PROJECT_ID.web.app
```

## 手順4: 環境変数の設定（Firebase Hostingの場合）

Firebase Hostingは静的なファイルのホスティングなので、環境変数はビルド時に埋め込まれます。

### 方法A: ビルド時に環境変数を設定

ローカルで`.env`ファイルを用意し、ビルド前に環境変数を設定：

```bash
# .envファイルに環境変数を設定
# その後、ビルド
npm run build
firebase deploy --only hosting
```

### 方法B: GitHub Actionsを使用（推奨）

`.github/workflows/deploy.yml`ファイルを作成し、GitHub Actionsで自動デプロイを設定（セキュリティのため、環境変数はGitHub Secretsに保存）。

## 手順5: 今後の更新手順

### コードを変更した後

```bash
# 変更をステージング
git add .

# コミット
git commit -m "変更内容の説明"

# GitHubにプッシュ
git push

# ビルド
npm run build

# Firebaseにデプロイ
firebase deploy
```

## トラブルシューティング

### Gitがインストールされていない

- Windows: https://git-scm.com/download/win からダウンロード
- インストール後、PowerShellを再起動

### Firebase CLIがインストールされていない

```bash
npm install -g firebase-tools
```

### 認証エラー

```bash
firebase logout
firebase login
```

### ビルドエラー

```bash
npm install
npm run build
```

### デプロイエラー

Firebase Consoleで：
1. Firestore Databaseが作成されているか確認
2. Hostingが有効になっているか確認
3. セキュリティルールが正しく設定されているか確認

## 注意事項

1. **`.env`ファイルはGitに含めない**
   - `.gitignore`に既に含まれています
   - 環境変数はローカルでのみ使用

2. **Firestoreセキュリティルール**
   - `firestore.rules`ファイルをGitHubにプッシュする必要があります
   - デプロイ時には `firebase deploy --only firestore:rules` で更新します

3. **環境変数の管理**
   - 本番環境では、環境変数はビルド時に埋め込まれるため、`.env`ファイルを本番サーバーに置く必要はありません
   - 開発環境と本番環境で異なるFirebaseプロジェクトを使用することを推奨します


