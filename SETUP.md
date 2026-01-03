# セットアップガイド

## クイックスタート

### 1. プロジェクトのクローンと依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `anime-watch-helper`）
4. Google Analyticsは任意で有効化

### 3. Firebase Authentication の設定

1. Firebase Console の左メニューから「Authentication」を選択
2. 「始める」をクリック
3. **Google認証プロバイダを有効化（必須）**
   - 「サインイン方法」タブを開く（または「Sign-in method」タブ）
   - 「Google」をクリック
   - 「有効にする」をオンに
   - プロジェクトのサポートメールを設定（必要に応じて）
   - 「保存」をクリック

4. **Google Cloud Console で OAuth 2.0 設定を確認（重要）**
   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - プロジェクト「anime-watch-helper」を選択
   - 「APIとサービス」>「認証情報」を開く
   - 「OAuth 2.0 クライアント ID」セクションで、Webアプリケーション用のクライアントIDをクリック
   - 「承認済みのリダイレクト URI」に以下が含まれているか確認：
     - `https://anime-watch-helper.web.app/__/auth/handler`
     - `https://anime-watch-helper.firebaseapp.com/__/auth/handler`
   - 含まれていない場合は、上記のURIを追加して「保存」をクリック

5. （オプション）匿名認証プロバイダを有効化
   - 「匿名」をクリック
   - 「有効にする」をオンに
   - 「保存」をクリック
   
**重要**: 
- Google認証は必須です。有効化しないとログイン時に `auth/operation-not-allowed` エラーが発生します。
- `redirect_uri_mismatch` エラーが発生する場合は、Google Cloud Console の OAuth 2.0 設定で承認済みリダイレクトURIが正しく設定されているか確認してください。

### 4. Firestore Database の作成

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番モードで開始」を選択（セキュリティルールは後で設定）
4. ロケーションを選択（例: `asia-northeast1`）
5. 「有効にする」をクリック

### 5. Firestore セキュリティルールの設定

1. Firestore Database の「ルール」タブを開く
2. 以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/userState/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. 「公開」をクリック

### 6. Web アプリの登録

1. Firebase Console のプロジェクト設定（⚙️アイコン）を開く
2. 「マイアプリ」セクションで「</>」アイコン（Web）をクリック
3. アプリのニックネームを入力（例: `anime-hub-web`）
4. 「Firebase Hosting も設定する」は後で設定可能
5. 「アプリを登録」をクリック

### 7. Firebase 設定情報の取得

Webアプリ登録後、以下のような設定情報が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

この情報をコピーしておきます。

### 8. 環境変数ファイルの作成

プロジェクトルートに`.env`ファイルを作成：

**Windows (PowerShell):**
```powershell
New-Item .env
```

**Mac/Linux:**
```bash
touch .env
```

`.env`ファイルに以下を追加（実際の値に置き換える）：

```env
VITE_FIREBASE_CONFIG={"apiKey":"AIza...","authDomain":"your-project.firebaseapp.com","projectId":"your-project-id","storageBucket":"your-project.appspot.com","messagingSenderId":"123456789","appId":"1:123456789:web:abcdef"}
VITE_APP_ID=anime-tracker-2026
```

**重要**: JSON形式で設定する場合、文字列全体をダブルクォートで囲み、内部の文字列はエスケープする必要があります。または、個別の環境変数を使用することもできます：

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_APP_ID=anime-tracker-2026
```

### 9. 開発サーバーの起動

```bash
npm run dev
```

ブラウザが自動的に開き、`http://localhost:3000` でアプリが表示されます。

## トラブルシューティング

### Firebase接続エラー

- `.env`ファイルが正しく作成されているか確認
- Firebase Consoleで認証とFirestoreが有効になっているか確認
- ブラウザのコンソールでエラーメッセージを確認

### ビルドエラー

- Node.jsのバージョンを確認（v18以上推奨）
- `node_modules`を削除して再インストール：`rm -rf node_modules && npm install`

### データが保存されない

- Firestoreセキュリティルールが正しく設定されているか確認
- ブラウザの開発者ツールでFirebaseエラーを確認

### Googleログインエラー（auth/operation-not-allowed）

**エラーメッセージ**: `Firebase: Error (auth/operation-not-allowed)`

**原因**: Firebase ConsoleでGoogle認証プロバイダーが有効化されていない

**解決方法**:
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 左メニューから「Authentication」を選択
4. 「サインイン方法」（または「Sign-in method」）タブを開く
5. 「Google」をクリック
6. 「有効にする」をオンにして「保存」をクリック

これでGoogleログインが使用できるようになります。





