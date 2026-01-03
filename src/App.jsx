import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, deleteField, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  Clock, 
  EyeOff,
  Eye,
  BarChart3,
  Search,
  ChevronRight,
  Settings2,
  Loader2,
  Plus,
  X,
  Trash2,
  Edit2,
  Grid3x3,
  List,
  Play,
  SkipForward,
  ExternalLink,
  CheckCircle,
  Radio,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Star,
  LogIn,
  LogOut,
  User,
  Download,
  ChevronDown,
  Menu,
  Circle,
  Check,
  Pause,
  Square,
  ChevronLeft,
  Bell
} from 'lucide-react';

// --- Firebase Configuration ---
let firebaseConfig;
try {
  if (import.meta.env.VITE_FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  } else {
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
} catch (e) {
  console.error('Firebase config parse error:', e);
  firebaseConfig = null;
}

let app, auth, db;
const appId = import.meta.env.VITE_APP_ID || 'anime-tracker-2026';

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error('Firebase initialization error:', e);
  }
}

const ANIME_DATABASE = [
  // 月曜日
  { id: "m1", title: "アンドロイドは経験人数に入りますか？？", day: "月曜", time: "00:00", genre: "SFラブコメ" },
  { id: "m2", title: "エリスの聖杯", day: "月曜", time: "00:00", genre: "悪役令嬢/サスペンス" },
  { id: "m3", title: "異世界の沙汰は社畜次第", day: "月曜", time: "00:30", genre: "異世界転生/お仕事" },
  { id: "m4", title: "魔都精兵のスレイブ2", day: "月曜", time: "00:30", genre: "バトルファンタジー" },
  { id: "m5", title: "「お前ごときが魔王に勝てると思うな」と勇者パーティを追放されたので…", day: "月曜", time: "01:00", genre: "追放ざまぁ" },
  { id: "m6", title: "わたしが恋人になれるわけないじゃん、ムリムリ!", day: "月曜", time: "01:30", genre: "ガールズラブコメ" },
  { id: "m7", title: "シンデレラ・シェフ ～萌妻食神～ シーズン2", day: "月曜", time: "18:00", genre: "中華アニメ/グルメ" },
  { id: "m8", title: "不死身な僕の日常 シーズン2", day: "月曜", time: "18:00", genre: "中華アニメ/ギャグ" },
  { id: "m9", title: "Animatica「北斗の拳 拳王軍ザコたちの挽歌」", day: "月曜", time: "20:00", genre: "スピンオフギャグ" },
  { id: "m10", title: "魔王の娘は優しすぎる!!", day: "月曜", time: "22:00", genre: "癒やし系" },
  // 火曜日
  { id: "t1", title: "Fate/strange Fake", day: "火曜", time: "12:00", genre: "伝奇アクション" },
  { id: "t2", title: "DARK MOON -黒の月: 月の祭壇-", day: "火曜", time: "12:00", genre: "ダークファンタジー" },
  { id: "t3", title: "最推しの義兄を愛でるため、長生きします！", day: "火曜", time: "22:00", genre: "異世界転生/溺愛" },
  { id: "t4", title: "勇者刑に処す 懲罰勇者9004隊刑務記録", day: "火曜", time: "22:00", genre: "ダークファンタジー" },
  { id: "t5", title: "ガングリオン", day: "火曜", time: "22:00", genre: "悪の組織/お仕事" },
  { id: "t6", title: "SI-VIS: The Sound of Heroes", day: "火曜", time: "22:00", genre: "音楽/アクション" },
  { id: "t7", title: "グノーシア", day: "火曜", time: "22:30", genre: "SFミステリー" },
  { id: "t8", title: "東島丹三郎は仮面ライダーになりたい", day: "火曜", time: "24:00", genre: "コメディ/特撮愛" },
  // 水曜日
  { id: "w1", title: "MFゴースト 3rd Season", day: "水曜", time: "00:00", genre: "カーレース" },
  { id: "w2", title: "デッドアカウント", day: "水曜", time: "00:00", genre: "現代異能バトル" },
  { id: "w3", title: "シャンピニオンの魔女", day: "水曜", time: "03:00", genre: "ダークファンタジー" },
  { id: "w4", title: "正反対な君と僕", day: "水曜", time: "17:30", genre: "学園ラブコメ" },
  { id: "w5", title: "プリンセッション・オーケストラ", day: "水曜", time: "20:00", genre: "音楽ファンタジー" },
  { id: "w6", title: "死亡遊戯で飯を食う。", day: "水曜", time: "23:00", genre: "デスゲーム" },
  { id: "w7", title: "悪役令嬢は隣国の王太子に溺愛される", day: "水曜", time: "23:30", genre: "悪役令嬢/ロマンス" },
  { id: "w8", title: "地獄先生ぬ～べ～", day: "水曜", time: "24:15", genre: "学園ホラー" },
  // 木曜日
  { id: "th1", title: "有栖川煉ってホントは女なんだよね。", day: "木曜", time: "00:00", genre: "TS/アイドル" },
  { id: "th2", title: "火喰鳥 羽州ぼろ鳶組", day: "木曜", time: "00:00", genre: "時代劇" },
  { id: "th3", title: "穏やか貴族の休暇のすすめ。", day: "木曜", time: "00:30", genre: "異世界/スローライフ" },
  { id: "th4", title: "イチゴ哀歌～雑で生イキな妹と割り切れない兄～", day: "木曜", time: "01:05", genre: "兄妹/ラブコメ" },
  { id: "th5", title: "ヘルモード ～やり込みゲーマー無双～", day: "木曜", time: "01:35", genre: "異世界転生/ゲーム" },
  { id: "th6", title: "元祖！バンドリちゃん", day: "木曜", time: "22:00", genre: "音楽/ギャグ" },
  { id: "th7", title: "お前はまだグンマを知らない～令和版～", day: "木曜", time: "22:00", genre: "地域コメディ" },
  { id: "th8", title: "【推しの子】第3期", day: "木曜", time: "23:00", genre: "アイドル/サスペンス" },
  // 金曜日
  { id: "f1", title: "透明男と人間女", day: "金曜", time: "00:00", genre: "異種族間恋愛" },
  { id: "f2", title: "姫様\"拷問\"の時間です 第2期", day: "金曜", time: "00:30", genre: "グルメ/コメディ" },
  { id: "f3", title: "呪術廻戦 死滅回游 前編", day: "金曜", time: "01:30", genre: "ダークファンタジー/バトル" },
  { id: "f4", title: "勇者のクズ", day: "金曜", time: "01:30", genre: "復讐/ノワール" },
  { id: "f5", title: "どうせ、恋してしまうんだ。", day: "金曜", time: "02:00", genre: "少女漫画/青春" },
  { id: "f6", title: "人外教室の人間嫌い教師", day: "金曜", time: "02:30", genre: "人外娘/コメディ" },
  { id: "f7", title: "うるわしの宵の月", day: "金曜", time: "17:00", genre: "少女漫画" },
  { id: "f8", title: "カヤちゃんはコワくない", day: "金曜", time: "18:00", genre: "ホラーアクション" },
  { id: "f9", title: "ポケットモンスター（2023）", day: "金曜", time: "19:30", genre: "キッズ/冒険" },
  { id: "f10", title: "破産富豪 The Richest Man in GAME", day: "金曜", time: "24:30", genre: "SF/マネーゲーム" },
  // 土曜日
  { id: "s1", title: "葬送のフリーレン 第2期", day: "土曜", time: "00:00", genre: "ハイファンタジー" },
  { id: "s2", title: "拷問バイトくんの日常", day: "土曜", time: "00:00", genre: "ブラックコメディ" },
  { id: "s3", title: "幼馴染とはラブコメにならない", day: "土曜", time: "00:30", genre: "ラブコメ" },
  { id: "s4", title: "違国日記", day: "土曜", time: "01:00", genre: "ヒューマンドラマ" },
  { id: "s5", title: "鎧真伝サムライトルーパー", day: "土曜", time: "01:00", genre: "鎧アクション" },
  { id: "s6", title: "カードファイト!! ヴァンガード Divinez", day: "土曜", time: "08:30", genre: "TCG/ホビー" },
  { id: "s7", title: "ハイスクール！奇面組（2026）", day: "土曜", time: "12:00", genre: "ドタバタギャグ" },
  { id: "s8", title: "お気楽領主の楽しい領地防衛", day: "土曜", time: "22:30", genre: "異世界/生産" },
  { id: "s9", title: "TRIGUN STARGAZE", day: "土曜", time: "23:30", genre: "SFウエスタン" },
  // 日曜日
  { id: "su1", title: "貴族転生 ～最強の力を得る～", day: "日曜", time: "00:00", genre: "異世界転生/領地経営" },
  { id: "su2", title: "29歳独身中堅冒険者の日常", day: "日曜", time: "00:00", genre: "ファンタジー/アラサー" },
  { id: "su3", title: "多聞くん今どっち！？", day: "日曜", time: "01:00", genre: "アイドル/コメディ" },
  { id: "su4", title: "ひみつのアイプリ リング編", day: "日曜", time: "10:00", genre: "女児向け/アイドル" },
  { id: "su5", title: "花ざかりの君たちへ", day: "日曜", time: "22:00", genre: "少女漫画/学園" },
  { id: "su6", title: "勇者パーティを追い出された器用貧乏", day: "日曜", time: "23:30", genre: "追放ざまぁ" },
  { id: "su7", title: "真夜中ハートチューン", day: "日曜", time: "23:30", genre: "ラブコメ/声優" },
  { id: "su8", title: "勇者パーティーにかわいい子がいたので、告白してみた。", day: "日曜", time: "23:30", genre: "ラブコメ/純愛" },
];

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchedIds, setWatchedIds] = useState([]);
  const [ignoredIds, setIgnoredIds] = useState([]);
  const [customAnime, setCustomAnime] = useState([]); // ユーザー追加作品
  const [overrides, setOverrides] = useState({}); // 既存作品の上書き情報 { id: { title, day, time } }
  const [episodeProgress, setEpisodeProgress] = useState({}); // 話数進捗 { id: currentEpisode }
  const [annictData, setAnnictData] = useState({}); // Annict情報 { id: { workId, episodeIds: { 1: episodeId, 2: episodeId, ... } } }
  const [annictAccessToken, setAnnictAccessToken] = useState(null); // Annictアクセストークン
  const [annictUserInfo, setAnnictUserInfo] = useState(null); // Annictユーザー情報
  const [annictUserId, setAnnictUserId] = useState(null); // AnnictユーザーID
  const [annictClientId, setAnnictClientId] = useState(null); // AnnictクライアントID（ユーザー設定）
  const [annictClientSecret, setAnnictClientSecret] = useState(null); // Annictクライアントシークレット（ユーザー設定）
  const [selectedChannels, setSelectedChannels] = useState([]); // 選択されたチャンネルIDのリスト
  const [annictChannels, setAnnictChannels] = useState([]); // Annictチャンネル一覧
  const [channelsLoading, setChannelsLoading] = useState(false); // チャンネル読み込み中
  const [isTutorialOpen, setIsTutorialOpen] = useState(false); // チュートリアル表示フラグ
  const [tutorialCompleted, setTutorialCompleted] = useState(false); // チュートリアル完了フラグ
  const [isChannelSettingsModalOpen, setIsChannelSettingsModalOpen] = useState(false); // チャンネル設定モーダル
  const [isAnnictClientIdModalOpen, setIsAnnictClientIdModalOpen] = useState(false); // クライアントID設定モーダル
  const [isAnnictTokenModalOpen, setIsAnnictTokenModalOpen] = useState(false); // 個人用アクセストークン入力モーダル
  const [annictTokenInput, setAnnictTokenInput] = useState(''); // 個人用アクセストークン入力
  const [annictClientIdInput, setAnnictClientIdInput] = useState(''); // クライアントID入力
  const [annictClientSecretInput, setAnnictClientSecretInput] = useState(''); // クライアントシークレット入力
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('active'); // 'timeline', 'active', 'watched', 'ignored'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // 感想投稿モーダル
  const [editingId, setEditingId] = useState(null); // 編集中のID
  const [editingEpisodeId, setEditingEpisodeId] = useState(null); // 話数編集中のID
  const [editingReviewAnime, setEditingReviewAnime] = useState(null); // 感想投稿中の作品
  const [reviewComment, setReviewComment] = useState(''); // 感想コメント
  const [reviewRating, setReviewRating] = useState(0); // 評価（0-5）
  const [reviewPosting, setReviewPosting] = useState(false); // 投稿中フラグ
  const [currentTime, setCurrentTime] = useState(new Date());
  const [episodeInput, setEpisodeInput] = useState('');
  const [fetchingAnime, setFetchingAnime] = useState(false); // Annictから作品情報を取得中
  const [isAnnictFetchMenuOpen, setIsAnnictFetchMenuOpen] = useState(false); // Annict取得メニューの開閉状態
  const [enablePreset, setEnablePreset] = useState(true); // プリセットアニメを有効にするか
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // 設定モーダルの開閉状態
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // 確認モーダルの開閉状態
  const [confirmModalConfig, setConfirmModalConfig] = useState(null); // 確認モーダルの設定 { message, onConfirm }
  const [editFilter, setEditFilter] = useState('all'); // 編集フィルター: 'all' | 'unedited' | 'edited'
  const [notificationPermission, setNotificationPermission] = useState('default'); // 通知許可状態: 'default' | 'granted' | 'denied'
  const [notificationEnabled, setNotificationEnabled] = useState(false); // 通知が有効かどうか
  const [notificationTime, setNotificationTime] = useState('20:00'); // 通知時刻（デフォルト: 20:00）
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null); // Service Worker登録
  const notificationTimeoutsRef = React.useRef({}); // 通知タイムアウトの管理
  const dailyNotificationIntervalRef = React.useRef(null); // 日次通知のインターバル

  // フォームの状態
  const [formData, setFormData] = useState({ title: '', day: '月曜', time: '00:00', genre: '再放送/カスタム', date: '' });

  // (1) Auth Initialize - 認証状態の監視のみ（自動ログインなし）
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // (2) Firestore sync
  useEffect(() => {
    if (!user || !db) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userState', 'current');
    
    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setWatchedIds(data.watchedIds || []);
        setIgnoredIds(data.ignoredIds || []);
        setCustomAnime(data.customAnime || []);
        setOverrides(data.overrides || {});
        setEpisodeProgress(data.episodeProgress || {});
        setAnnictData(data.annictData || {});
        
        const userId = data.annictUserId || null;
        setAnnictUserId(userId);
        
        // ローカルにトークンがない場合、グローバルコレクションから読み込む（別ブラウザ間で共有）
        if (!data.annictAccessToken && userId) {
          const token = await loadAnnictTokenFromGlobal(userId);
          if (token) {
            setAnnictAccessToken(token);
            // ローカルにも保存（次回以降はローカルから読み込む）
            setDoc(userDocRef, { annictAccessToken: token }, { merge: true });
          } else {
            setAnnictAccessToken(null);
          }
        } else {
          setAnnictAccessToken(data.annictAccessToken || null);
        }
        
        setAnnictClientId(data.annictClientId || null);
        setAnnictClientSecret(data.annictClientSecret || null);
        setSelectedChannels(data.selectedChannels || []);
        setTutorialCompleted(data.tutorialCompleted || false);
        setEnablePreset(data.enablePreset !== undefined ? data.enablePreset : true);
        setNotificationEnabled(data.notificationEnabled !== undefined ? data.notificationEnabled : false);
        setNotificationTime(data.notificationTime || '20:00');
        // editFilterは常に'all'で初期化（保存しない）
        
        // 初回起動時かつ作品がゼロの場合、チュートリアルを表示
        const hasAnime = (data.customAnime || []).length > 0 || (data.enablePreset !== false && ANIME_DATABASE.length > 0);
        if (!hasAnime && !data.tutorialCompleted && !isTutorialOpen) {
          setIsTutorialOpen(true);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Annictトークンをグローバルコレクションに保存（別ブラウザ間で共有）
  const saveAnnictTokenToGlobal = async (annictUserId, token) => {
    if (!db || !annictUserId) return;
    try {
      const annictUserDocRef = doc(db, 'annictUsers', annictUserId.toString());
      await setDoc(annictUserDocRef, {
        accessToken: token || null,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save Annict token to global:", err);
    }
  };

  // Annictトークンをグローバルコレクションから読み込み（別ブラウザ間で共有）
  const loadAnnictTokenFromGlobal = async (annictUserId) => {
    if (!db || !annictUserId) return null;
    try {
      const annictUserDocRef = doc(db, 'annictUsers', annictUserId.toString());
      const annictUserDoc = await getDoc(annictUserDocRef);
      if (annictUserDoc.exists()) {
        const data = annictUserDoc.data();
        return data.accessToken || null;
      }
      return null;
    } catch (err) {
      console.error("Failed to load Annict token from global:", err);
      return null;
    }
  };

  // (3) Save state to Firestore
  const saveState = async (updates) => {
    if (!user || !db) {
      throw new Error('ユーザーまたはデータベースが初期化されていません');
    }
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userState', 'current');
    try {
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: Date.now()
      }, { merge: true });
      
      // AnnictトークンとユーザーIDが更新された場合、グローバルコレクションにも保存（別ブラウザ間で共有）
      if (updates.annictAccessToken !== undefined && updates.annictUserId) {
        await saveAnnictTokenToGlobal(updates.annictUserId, updates.annictAccessToken);
      }
    } catch (err) {
      console.error("Save error:", err);
      throw err; // エラーを再スローして、呼び出し元で処理できるようにする
    }
  };


  const days = ['All', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'];
  const dayOrder = ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'];

  // 認証コードをアクセストークンに交換
  const exchangeCodeForToken = async (code, state) => {
    const envClientId = import.meta.env.VITE_ANNICT_CLIENT_ID;
    const envClientSecret = import.meta.env.VITE_ANNICT_CLIENT_SECRET;
    const clientId = envClientId && envClientId !== 'YOUR_CLIENT_ID' ? envClientId : annictClientId;
    const clientSecret = envClientSecret && envClientSecret !== 'YOUR_CLIENT_SECRET' ? envClientSecret : annictClientSecret;
    
    if (!clientId) {
      alert('クライアントIDが設定されていません。設定画面からクライアントIDを入力してください。');
      return;
    }
    
    if (!clientSecret) {
      alert('クライアントシークレットが設定されていません。設定画面からクライアントシークレットを入力してください。');
      setIsAnnictClientIdModalOpen(true);
      return;
    }
    
    const redirectUri = window.location.origin + window.location.pathname;
    
    try {
      const response = await fetch('https://annict.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token exchange error:', errorData);
        alert('アクセストークンの取得に失敗しました。再度認証してください。');
        return;
      }
      
      const data = await response.json();
      const accessToken = data.access_token;
      
      if (accessToken) {
        // AnnictユーザーIDを取得
        try {
          const meResponse = await fetch('https://api.annict.com/v1/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (meResponse.ok) {
            const meData = await meResponse.json();
            const userId = meData.id || null;
            setAnnictAccessToken(accessToken);
            setAnnictUserId(userId);
            saveState({ annictAccessToken: accessToken, annictUserId: userId });
          } else {
            setAnnictAccessToken(accessToken);
            saveState({ annictAccessToken: accessToken });
          }
        } catch (error) {
          console.error('Failed to fetch Annict user ID:', error);
          setAnnictAccessToken(accessToken);
          saveState({ annictAccessToken: accessToken });
        }
        alert('Annict認証が完了しました！');
      } else {
        alert('アクセストークンの取得に失敗しました。');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      alert('アクセストークンの取得中にエラーが発生しました。');
    }
  };

  // OAuthコールバック処理（Firestoreからデータが読み込まれた後に実行）
  useEffect(() => {
    // ローディング中やユーザーが設定されていない場合は実行しない
    if (loading || !user) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      alert(`Annict認証エラー: ${error}`);
      // URLからパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (code && state) {
      // stateの検証
      const savedState = sessionStorage.getItem('annict_oauth_state');
      if (state !== savedState) {
        console.error('OAuth state mismatch');
        alert('認証状態が一致しません。再度認証してください。');
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('annict_oauth_state');
        return;
      }
      
      // アクセストークンを取得
      exchangeCodeForToken(code, state);
      
      // URLからパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('annict_oauth_state');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, annictClientId, annictClientSecret]);

  // Service Worker登録と通知許可状態の確認
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setServiceWorkerRegistration(registration);
      });
    }
    
    // 通知許可状態を確認
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新
    return () => clearInterval(timer);
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!isAnnictFetchMenuOpen) return;
    
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest('.annict-fetch-menu-container')) {
        setIsAnnictFetchMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAnnictFetchMenuOpen]);

  // Annictユーザー情報を取得
  useEffect(() => {
    const fetchAnnictUserInfo = async () => {
      if (!annictAccessToken) {
        setAnnictUserInfo(null);
        return;
      }
      
      try {
        const url = `https://api.annict.com/v1/me`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${annictAccessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Annict API error: ${response.status}`);
        }
        
        const data = await response.json();
        setAnnictUserInfo(data.name || data.username || null);
        setAnnictUserId(data.id || null);
      } catch (error) {
        console.error('Failed to fetch Annict user info:', error);
        setAnnictUserInfo(null);
      }
    };
    
    fetchAnnictUserInfo();
  }, [annictAccessToken]);


  // 時間文字列を分に変換（例: "01:30" -> 90）
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // アニメの放送開始時刻が現在時刻より前かどうかを判定（今週の該当日時で判定）
  // 編集済み（isOverridden）のアニメは常に表示する
  // 設定待ち（dayとtimeが空）のアニメも表示する（編集できるようにするため）
  const hasStarted = (anime) => {
    // 編集済みのアニメは常に表示
    if (anime.isOverridden) return true;
    
    // 時間が設定されていない場合（設定待ち）は表示する
    if (!anime.time || !anime.day) return true;
    
    // 曜日から今週の該当日付を取得
    const dayIndex = dayOrder.indexOf(anime.day);
    if (dayIndex === -1) return true; // 不正な曜日の場合も表示する
    
    const broadcastDate = new Date(weekDates[dayIndex]);
    const [hours, minutes] = anime.time.split(':').map(Number);
    broadcastDate.setHours(hours || 0, minutes || 0, 0, 0);
    
    // 現在時刻と比較（放送開始時刻が現在時刻より前ならtrue）
    return broadcastDate <= currentTime;
  };

  // 合体データベース & オーバーライド適用（先に定義する必要がある）
  const fullDatabase = useMemo(() => {
    // カスタムアニメのタイトルセットを作成（重複チェック用）
    const customTitles = new Set(customAnime.map(a => a.title.trim()));
    
    // プリセットが有効な場合のみANIME_DATABASEを含める
    // ただし、カスタムアニメとタイトルが重複するプリセットアニメは除外
    let baseDatabase = [];
    if (enablePreset && ANIME_DATABASE) {
      baseDatabase = ANIME_DATABASE.filter(presetAnime => {
        // カスタムアニメとタイトルが重複する場合は除外
        return !customTitles.has(presetAnime.title.trim());
      });
    }
    
    const combined = [...baseDatabase, ...customAnime];
    return combined.map(anime => {
      if (overrides[anime.id]) {
        return { ...anime, ...overrides[anime.id], isOverridden: true };
      }
      return anime;
    });
  }, [customAnime, overrides, enablePreset]);

  // 今週の開始日（月曜日）を取得
  const getWeekStart = useMemo(() => {
    const now = currentTime;
    const day = now.getDay(); // 0 (日) から 6 (土)
    const diff = day === 0 ? 6 : day - 1; // 月曜日を基準にした差分
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [currentTime]);

  // 各曜日の日付を計算
  const weekDates = useMemo(() => {
    return dayOrder.map((_, index) => {
      const date = new Date(getWeekStart);
      date.setDate(getWeekStart.getDate() + index);
      return date;
    });
  }, [getWeekStart]);

  // タイムライン用のアニメデータを整理
  const timelineData = useMemo(() => {
    const data = {};
    dayOrder.forEach(day => {
      data[day] = [];
    });

    const activeAnime = fullDatabase.filter(a => {
      // 編集フィルター適用
      if (editFilter === 'unedited' && a.isOverridden) return false;
      if (editFilter === 'edited' && !a.isOverridden) return false;
      
      return !ignoredIds.includes(a.id) && 
        (!searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
        hasStarted(a); // 放送開始時刻が現在時刻より前のアニメのみ表示（編集済みは常に表示）
    });

    activeAnime.forEach(anime => {
      const day = anime.day;
      if (data[day] && anime.time) {
        data[day].push({
          ...anime,
          minutes: timeToMinutes(anime.time),
          isWatched: watchedIds.includes(anime.id)
        });
      }
    });

    // 各曜日で時間順にソート
    dayOrder.forEach(day => {
      data[day].sort((a, b) => a.minutes - b.minutes);
    });

    return data;
  }, [fullDatabase, ignoredIds, watchedIds, searchQuery, currentTime, weekDates, editFilter]);

  // タイムライン用の時間帯を生成（アニメが存在する時間帯のみ）
  const timeSlots = useMemo(() => {
    // 全曜日からアニメが存在する時間（分）を収集
    const allMinutes = new Set();
    dayOrder.forEach(day => {
      const animeInDay = timelineData[day] || [];
      animeInDay.forEach(anime => {
        if (typeof anime.minutes === 'number') {
          // 1時間ごとのスロットの開始時刻（分）を計算（例: 30分 -> 0分、90分 -> 60分）
          const slotStartMinutes = Math.floor(anime.minutes / 60) * 60;
          allMinutes.add(slotStartMinutes);
        }
      });
    });

    // 分を時間に変換し、ソート
    const hours = Array.from(allMinutes)
      .map(minutes => Math.floor(minutes / 60))
      .filter(hour => hour >= 0 && hour <= 25) // 0時から25時まで
      .sort((a, b) => a - b);

    // スロットを生成
    const slots = hours.map(hour => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      minutes: hour * 60
    }));

    return slots;
  }, [timelineData, dayOrder]);

  // 現在時刻の位置を計算
  const currentTimePosition = useMemo(() => {
    if (!getWeekStart) return null;
    const now = currentTime;
    const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; // 月曜日を0とする
    const minutes = now.getHours() * 60 + now.getMinutes();
    
    // 今週の範囲内かチェック
    const weekEnd = new Date(getWeekStart);
    weekEnd.setDate(getWeekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59);
    
    if (now >= getWeekStart && now <= weekEnd) {
      return { dayIndex, minutes };
    }
    return null;
  }, [currentTime, getWeekStart]);

  // アニメの放送日時を取得（Dateオブジェクト）
  // watchedの場合、次の週の放送時刻を返す
  const getAnimeBroadcastTime = (anime, isWatched = false) => {
    if (!anime.day || !anime.time) return null;
    
    const dayIndex = dayOrder.indexOf(anime.day);
    if (dayIndex === -1) return null;
    
    const broadcastDate = new Date(weekDates[dayIndex]);
    const [hours, minutes] = anime.time.split(':').map(Number);
    broadcastDate.setHours(hours || 0, minutes || 0, 0, 0);
    
    // 視聴済みの場合、次の週の放送時刻を計算
    if (isWatched) {
      broadcastDate.setDate(broadcastDate.getDate() + 7);
    }
    
    return broadcastDate;
  };

  // 視聴済みアニメの次の放送時刻が来たかどうかを判定
  const shouldShowWatchedAnime = (anime) => {
    const nextBroadcastTime = getAnimeBroadcastTime(anime, true);
    if (!nextBroadcastTime) return false;
    return nextBroadcastTime <= currentTime;
  };

  // フィルタリング
  const filteredAnime = useMemo(() => {
    let filtered = fullDatabase.filter(anime => {
      // 編集フィルター適用
      if (editFilter === 'unedited' && anime.isOverridden) return false;
      if (editFilter === 'edited' && !anime.isOverridden) return false;
      
      const matchesDay = selectedDay === 'All' || anime.day === selectedDay;
      const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase());
      const isWatched = watchedIds.includes(anime.id);
      const isIgnored = ignoredIds.includes(anime.id);
      
      if (viewMode === 'active') {
        // 未視聴リストの場合
        // 1. 未視聴で放送開始済みのアニメ
        // 2. 視聴済みだが次の放送時刻が来たアニメ（復活）
        const hasStartedCheck = hasStarted(anime);
        const shouldShow = !isIgnored && matchesDay && matchesSearch && hasStartedCheck && (
          !isWatched || shouldShowWatchedAnime(anime)
        );
        return shouldShow;
      } else if (viewMode === 'watched') {
        const hasStartedCheck = hasStarted(anime);
        return matchesDay && matchesSearch && hasStartedCheck && isWatched;
      } else if (viewMode === 'ignored') {
        const hasStartedCheck = hasStarted(anime);
        return matchesDay && matchesSearch && hasStartedCheck && isIgnored;
      }
      return false;
    });
    
    // 未視聴リスト（viewMode === 'active'）の場合、現在時刻を基準にソート
    if (viewMode === 'active') {
      filtered = filtered.sort((a, b) => {
        const isAWatched = watchedIds.includes(a.id);
        const isBWatched = watchedIds.includes(b.id);
        const timeA = getAnimeBroadcastTime(a, isAWatched);
        const timeB = getAnimeBroadcastTime(b, isBWatched);
        
        // 時間が設定されていない場合は最後に
        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;
        
        // 現在時刻を基準に、過去のものから未来のものへソート
        const diffA = timeA.getTime() - currentTime.getTime();
        const diffB = timeB.getTime() - currentTime.getTime();
        
        // 過去のもの（負の値）を先に、未来のもの（正の値）を後に
        return diffA - diffB;
      });
    }
    
    return filtered;
  }, [selectedDay, searchQuery, watchedIds, ignoredIds, viewMode, fullDatabase, currentTime, weekDates, editFilter, dayOrder]);

  // 進捗計算
  const stats = useMemo(() => {
    const activeDatabase = fullDatabase.filter(a => !ignoredIds.includes(a.id));
    const total = activeDatabase.length;
    const watched = watchedIds.filter(id => !ignoredIds.includes(id)).length;
    const percent = total === 0 ? 0 : Math.round((watched / total) * 100);
    return { total, watched, percent };
  }, [watchedIds, ignoredIds, fullDatabase]);

  // 日次通知をスケジュール（一日に一度、設定した時刻に未視聴アニメを通知）
  const scheduleDailyNotification = () => {
    if (!notificationEnabled || notificationPermission !== 'granted') {
      return;
    }

    // 既存のインターバルをクリア
    if (dailyNotificationIntervalRef.current) {
      clearInterval(dailyNotificationIntervalRef.current);
      dailyNotificationIntervalRef.current = null;
    }

    const scheduleNextNotification = () => {
      const now = currentTime;
      const [notifyHour, notifyMinute] = notificationTime.split(':').map(Number);
      
      // 今日の通知時刻を計算
      const todayNotification = new Date(now);
      todayNotification.setHours(notifyHour || 20, notifyMinute || 0, 0, 0);
      
      // 今日の通知時刻が既に過ぎている場合は、明日の通知時刻を設定
      let nextNotification = todayNotification;
      if (nextNotification <= now) {
        nextNotification = new Date(todayNotification);
        nextNotification.setDate(nextNotification.getDate() + 1);
      }
      
      const timeUntilNotification = nextNotification.getTime() - now.getTime();
      
      // 通知をスケジュール
      const timeoutId = setTimeout(() => {
        // 未視聴アニメを取得
        const unwatchedAnime = fullDatabase.filter(anime => {
          // 無視されたアニメは除外
          if (ignoredIds.includes(anime.id)) return false;
          
          // 視聴済みアニメは除外
          if (watchedIds.includes(anime.id)) return false;
          
          return true;
        });
        
        if (unwatchedAnime.length > 0) {
          // 未視聴アニメのリストを通知
          const animeTitles = unwatchedAnime.slice(0, 5).map(a => a.title).join('、');
          const moreCount = unwatchedAnime.length > 5 ? `他${unwatchedAnime.length - 5}件` : '';
          
          sendNotification(`未視聴アニメが${unwatchedAnime.length}件あります`, {
            body: `${animeTitles}${moreCount ? `、${moreCount}` : ''}`,
            tag: 'daily-unwatched-notification',
            data: { count: unwatchedAnime.length }
          });
        }
        
        // 次の日の通知をスケジュール
        scheduleNextNotification();
      }, timeUntilNotification);
      
      notificationTimeoutsRef.current['daily'] = timeoutId;
    };
    
    scheduleNextNotification();
  };

  // 通知スケジュールの更新（通知が有効な場合のみ）
  useEffect(() => {
    if (notificationEnabled && notificationPermission === 'granted') {
      scheduleDailyNotification();
    } else {
      clearNotifications();
    }
    
    return () => {
      clearNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationEnabled, notificationPermission, notificationTime, fullDatabase, watchedIds, ignoredIds, currentTime]);

  const toggleWatch = (id) => {
    const next = watchedIds.includes(id) ? watchedIds.filter(i => i !== id) : [...watchedIds, id];
    setWatchedIds(next);
    saveState({ watchedIds: next });
  };

  const toggleIgnore = (id) => {
    const next = ignoredIds.includes(id) ? ignoredIds.filter(i => i !== id) : [...ignoredIds, id];
    setIgnoredIds(next);
    saveState({ ignoredIds: next });
  };

  // 話数更新
  const updateEpisode = (id, episode) => {
    const episodeNum = parseInt(episode, 10);
    if (isNaN(episodeNum) || episodeNum < 0) return;
    
    const nextProgress = { ...episodeProgress, [id]: episodeNum };
    setEpisodeProgress(nextProgress);
    saveState({ episodeProgress: nextProgress });
    setIsEpisodeModalOpen(false);
    setEditingEpisodeId(null);
    setEpisodeInput('');
  };

  // 話数モーダルを開く
  const openEpisodeModal = (anime) => {
    setEditingEpisodeId(anime.id);
    const currentEpisode = episodeProgress[anime.id] || 0;
    setEpisodeInput(currentEpisode > 0 ? currentEpisode.toString() : '');
    setIsEpisodeModalOpen(true);
  };

  // 次の話数に進む（+1）
  const incrementEpisode = (id, e) => {
    e.stopPropagation();
    const current = episodeProgress[id] || 0;
    updateEpisode(id, (current + 1).toString());
  };

  // 現在の話数を取得（表示用）
  const getCurrentEpisode = (id) => {
    return episodeProgress[id] || 0;
  };

  // 次の話数を取得（表示用）
  const getNextEpisode = (id) => {
    const current = episodeProgress[id] || 0;
    return current > 0 ? current + 1 : 1;
  };

  // Annictへのリンクを生成
  const getAnnictUrl = (anime, episode = null) => {
    const annictInfo = annictData[anime.id];
    
    // Annict情報が設定されている場合
    if (annictInfo && annictInfo.workId) {
      // エピソードIDが設定されている場合、直接エピソードページへ
      if (episode && episode > 0 && annictInfo.episodeIds && annictInfo.episodeIds[episode]) {
        return `https://annict.com/works/${annictInfo.workId}/episodes/${annictInfo.episodeIds[episode]}`;
      }
      // 作品IDのみ設定されている場合、エピソード一覧ページへ（クリック数を減らすため）
      return `https://annict.com/works/${annictInfo.workId}/episodes`;
    }
    
    // Annict情報が未設定の場合は検索ページへ
    const encodedTitle = encodeURIComponent(anime.title);
    return `https://annict.com/search?q=${encodedTitle}`;
  };

  // Annictで感想を投稿（新しいタブで開く）
  const openAnnictEpisode = (anime, e) => {
    e.stopPropagation();
    const nextEp = getNextEpisode(anime.id);
    const url = getAnnictUrl(anime, nextEp);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 感想投稿モーダルを開く
  const openReviewModal = (anime, e) => {
    e.stopPropagation();
    if (!annictAccessToken) {
      alert('Annictで認証してください。');
      return;
    }
    setEditingReviewAnime(anime);
    setReviewComment('');
    setReviewRating(0);
    setIsReviewModalOpen(true);
  };

  // Annict APIを使って感想を投稿
  const postReviewToAnnict = async () => {
    if (!editingReviewAnime || !annictAccessToken) return;
    
    const nextEp = getNextEpisode(editingReviewAnime.id);
    const annictInfo = annictData[editingReviewAnime.id];
    
    if (!annictInfo || !annictInfo.workId) {
      alert('Annictの作品IDが設定されていません。Annict情報を設定してください。');
      return;
    }
    
    const episodeId = annictInfo.episodeIds && annictInfo.episodeIds[nextEp];
    if (!episodeId) {
      alert(`${nextEp}話のエピソードIDが設定されていません。Annict情報を設定してください。`);
      return;
    }
    
    setReviewPosting(true);
    
    try {
      const requestBody = {
        episode_id: episodeId,
        comment: reviewComment.trim() || undefined,
        rating: reviewRating > 0 ? reviewRating : undefined
      };
      
      // undefinedの値を削除
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });
      
      await callAnnictAPI('/me/records', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      alert('感想を投稿しました！');
      setIsReviewModalOpen(false);
      setEditingReviewAnime(null);
      setReviewComment('');
      setReviewRating(0);
    } catch (error) {
      console.error('Review post error:', error);
      alert(`感想の投稿に失敗しました: ${error.message}`);
    } finally {
      setReviewPosting(false);
    }
  };

  // Annict情報を保存
  const saveAnnictData = (id, workId, episodeIds) => {
    const nextAnnictData = {
      ...annictData,
      [id]: { workId, episodeIds: episodeIds || {} }
    };
    setAnnictData(nextAnnictData);
    saveState({ annictData: nextAnnictData });
  };

  // 編集/追加の保存
  const handleSaveAnime = async () => {
    if (!formData.title) return;

    try {
      if (editingId) {
        // 編集モード
        if (editingId.startsWith('custom-')) {
          // カスタム作品の編集
          const nextCustom = customAnime.map(a => a.id === editingId ? { ...a, ...formData } : a);
          setCustomAnime(nextCustom);
          await saveState({ customAnime: nextCustom });
        } else {
          // 固定作品のオーバーライド
          const nextOverrides = { ...overrides, [editingId]: formData };
          setOverrides(nextOverrides);
          await saveState({ overrides: nextOverrides });
        }
      } else {
        // 新規追加モード
        const animeToAdd = {
          ...formData,
          id: `custom-${Date.now()}`,
          isCustom: true
        };
        const nextCustom = [...customAnime, animeToAdd];
        setCustomAnime(nextCustom);
        await saveState({ customAnime: nextCustom });
      }

      closeModal();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('データの保存に失敗しました。もう一度お試しください。');
    }
  };

  const openEditModal = (anime) => {
    setEditingId(anime.id);
    // 既存のdayとtimeから、今週の該当日付を計算（編集時は日付を空にする）
    setFormData({
      title: anime.title,
      day: anime.day,
      time: anime.time,
      genre: anime.genre,
      date: '' // 編集時は日付を空にして、ユーザーが再設定できるようにする
    });
    setIsModalOpen(true);
  };


  // 日付から曜日を取得する関数
  const getDayOfWeekFromDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const dayMap = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
    return dayMap[dayOfWeek] || '';
  };

  // 日付が変更されたときに曜日を自動計算
  const handleDateChange = (dateString) => {
    const calculatedDay = getDayOfWeekFromDate(dateString);
    setFormData({ ...formData, date: dateString, day: calculatedDay || formData.day });
  };

  // ニコニコ動画でタイトルを検索
  const searchOnNicovideo = async () => {
    const title = formData.title.trim();
    if (!title) {
      return;
    }
    
    // クリップボードにタイトルをコピー
    try {
      await navigator.clipboard.writeText(title);
      // ニコニコ動画の2026冬アニメページを開く
      const searchUrl = `https://anime.nicovideo.jp/period/2026-winter.html?from=nanime_side`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      // クリップボードAPIが使えない場合（HTTP環境など）は、URLを開くだけ
      console.warn('クリップボードへのコピーに失敗しました:', err);
      const searchUrl = `https://anime.nicovideo.jp/period/2026-winter.html?from=nanime_side`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', day: '月曜', time: '00:00', genre: '再放送/カスタム', date: '' });
  };

  const deleteCustomAnime = (id) => {
    if (!window.confirm("このカスタム作品を完全に削除しますか？")) return;
    const nextCustom = customAnime.filter(a => a.id !== id);
    setCustomAnime(nextCustom);
    saveState({ 
      customAnime: nextCustom,
      watchedIds: watchedIds.filter(i => i !== id),
      ignoredIds: ignoredIds.filter(i => i !== id)
    });
  };

  const resetOverride = (id) => {
    if (!window.confirm("この作品の編集内容を元に戻しますか？")) return;
    const nextOverrides = { ...overrides };
    delete nextOverrides[id];
    setOverrides(nextOverrides);
    saveState({ overrides: nextOverrides });
  };

  const handleRefresh = () => {
    if (window.confirm("新週の更新が来ました。視聴チェックのみリセットします。")) {
      setWatchedIds([]);
      saveState({ watchedIds: [] });
    }
  };

  // プリセットのオン/オフを切り替え
  const togglePreset = () => {
    const newValue = !enablePreset;
    setEnablePreset(newValue);
    saveState({ enablePreset: newValue });
  };

  // 通知許可をリクエスト
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません。');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      alert('通知がブロックされています。ブラウザの設定から通知を許可してください。');
      setNotificationPermission('denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        return true;
      } else {
        alert('通知が許可されませんでした。');
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      alert('通知許可のリクエストに失敗しました。');
      return false;
    }
  };

  // 通知を送信（Service Worker経由）
  const sendNotification = async (title, options = {}) => {
    if (notificationPermission !== 'granted') {
      return;
    }

    try {
      if (serviceWorkerRegistration) {
        await serviceWorkerRegistration.showNotification(title, {
          body: options.body || '',
          icon: options.icon || '/icon-192.png',
          badge: '/icon-192.png',
          tag: options.tag || 'anime-notification',
          requireInteraction: false,
          ...options
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: options.body || '',
          icon: options.icon || '/icon-192.png',
          tag: options.tag || 'anime-notification',
          ...options
        });
      }
    } catch (error) {
      console.error('Send notification error:', error);
    }
  };

  // 通知のオン/オフを切り替え
  const toggleNotification = async () => {
    if (!notificationEnabled) {
      // 通知を有効にする場合、許可をリクエスト
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationEnabled(true);
        saveState({ notificationEnabled: true });
        scheduleDailyNotification();
      }
    } else {
      // 通知を無効にする場合、スケジュールをクリア
      clearNotifications();
      setNotificationEnabled(false);
      saveState({ notificationEnabled: false });
    }
  };

  // 既存の通知スケジュールをクリア
  const clearNotifications = () => {
    Object.values(notificationTimeoutsRef.current).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    notificationTimeoutsRef.current = {};
    
    // 日次通知のインターバルもクリア
    if (dailyNotificationIntervalRef.current) {
      clearInterval(dailyNotificationIntervalRef.current);
      dailyNotificationIntervalRef.current = null;
    }
  };

  // 旧実装（放送時間1時間前に通知）- 削除予定だが、互換性のため残す
  const scheduleNotifications = () => {
    // 日次通知に変更
    scheduleDailyNotification();
  };

  // データベースをクリア
  const handleClearData = async () => {
    // 状態を先に更新
    setCustomAnime([]);
    setWatchedIds([]);
    setIgnoredIds([]);
    setEpisodeProgress({});
    setAnnictData({});
    setOverrides({});
    
    // Firestoreにも保存（merge: trueでも空配列/空オブジェクトは上書きされる）
    await saveState({
      customAnime: [],
      watchedIds: [],
      ignoredIds: [],
      episodeProgress: {},
      annictData: {},
      overrides: {}
    });
    
    alert('データをクリアしました。');
  };

  // 確認モーダルを開く
  const openConfirmModal = (message, onConfirm) => {
    setConfirmModalConfig({ message, onConfirm });
    setIsConfirmModalOpen(true);
  };

  // 確認モーダルで確定
  const handleConfirm = () => {
    if (confirmModalConfig && confirmModalConfig.onConfirm) {
      confirmModalConfig.onConfirm();
    }
    setIsConfirmModalOpen(false);
    setConfirmModalConfig(null);
  };

  if (!app || !auth || !db) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-red-500/50 rounded-3xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <X size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Firebase設定エラー</h2>
          <p className="text-neutral-400 mb-6">
            Firebaseの設定が完了していません。
            <br />
            <code className="text-xs bg-neutral-800 px-2 py-1 rounded mt-2 inline-block">.env</code>ファイルを確認してください。
          </p>
          <div className="text-left bg-neutral-800 p-4 rounded-xl text-xs text-neutral-300 font-mono">
            <p className="mb-2 font-bold text-neutral-500">必要な環境変数:</p>
            <p>VITE_FIREBASE_API_KEY</p>
            <p>VITE_FIREBASE_AUTH_DOMAIN</p>
            <p>VITE_FIREBASE_PROJECT_ID</p>
            <p>VITE_FIREBASE_STORAGE_BUCKET</p>
            <p>VITE_FIREBASE_MESSAGING_SENDER_ID</p>
            <p>VITE_FIREBASE_APP_ID</p>
            <p className="mt-4 text-neutral-500">または</p>
            <p>VITE_FIREBASE_CONFIG (JSON形式)</p>
          </div>
          <p className="text-xs text-neutral-500 mt-6">
            SETUP.mdを参照してセットアップを完了してください。
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // チュートリアル完了処理
  const completeTutorial = () => {
    setIsTutorialOpen(false);
    setTutorialCompleted(true);
    saveState({ tutorialCompleted: true });
  };

  // AnnictクライアントIDを保存
  const saveAnnictClientId = async () => {
    const clientId = annictClientIdInput.trim();
    const clientSecret = annictClientSecretInput.trim();
    if (!clientId) {
      alert('クライアントIDを入力してください');
      return;
    }
    setAnnictClientId(clientId);
    if (clientSecret) {
      setAnnictClientSecret(clientSecret);
      await saveState({ annictClientId: clientId, annictClientSecret: clientSecret });
    } else {
      await saveState({ annictClientId: clientId });
    }
    setIsAnnictClientIdModalOpen(false);
    const savedClientId = clientId; // 保存したクライアントIDを変数に保存
    setAnnictClientIdInput('');
    setAnnictClientSecretInput('');
    
    // クライアントIDを保存した後、自動的にOAuth認証を開始
    startAnnictAuth(savedClientId);
  };

  // Annict OAuth認証を開始
  const startAnnictAuth = (providedClientId = null) => {
    // 環境変数またはユーザー設定のクライアントIDを取得
    const envClientId = import.meta.env.VITE_ANNICT_CLIENT_ID;
    let clientId = null;
    
    // providedClientIdが明示的に渡された場合（文字列で空でない場合）はそれを使用
    if (providedClientId && typeof providedClientId === 'string' && providedClientId.trim()) {
      clientId = providedClientId.trim();
    } else if (envClientId && envClientId !== 'YOUR_CLIENT_ID') {
      clientId = envClientId;
    } else if (annictClientId && typeof annictClientId === 'string' && annictClientId.trim()) {
      clientId = annictClientId.trim();
    }
    
    // クライアントIDが設定されていない場合
    if (!clientId) {
      setIsAnnictClientIdModalOpen(true);
      return;
    }
    
    // clientIdが文字列であることを確認
    if (typeof clientId !== 'string') {
      console.error('Invalid clientId type:', typeof clientId, clientId);
      alert('クライアントIDの形式が正しくありません。');
      return;
    }
    
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'read write';
    const state = Math.random().toString(36).substring(7);
    
    // stateをセッションストレージに保存（認証後の検証用）
    sessionStorage.setItem('annict_oauth_state', state);
    
    const authUrl = `https://annict.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    // 同じウィンドウで認証ページにリダイレクト（コールバック処理のため）
    window.location.href = authUrl;
  };
  
  // Annict API呼び出し用のヘルパー関数
  const callAnnictAPI = async (endpoint, options = {}) => {
    if (!annictAccessToken) {
      throw new Error('アクセストークンが設定されていません。Annictで認証してください。');
    }
    
    const url = `https://api.annict.com/v1${endpoint}`;
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${annictAccessToken}`,
        'Content-Type': 'application/json',
      },
    };
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Annict API error: ${response.status} ${errorData}`);
    }
    
    return await response.json();
  };


  // Annictから今季アニメ情報を取得してリストに追加（削除予定 - 使用しない）
  const fetchCurrentSeasonAnime_DEPRECATED = async () => {
    if (!annictAccessToken) {
      alert('Annictでログインしてください。');
      return;
    }
    
    setFetchingAnime(true);
    try {
      // /me/programs から放送予定を取得
      const programsUrl = `https://api.annict.com/v1/me/programs?per_page=50`;
      const programsResponse = await fetch(programsUrl, {
        headers: {
          'Authorization': `Bearer ${annictAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!programsResponse.ok) {
        throw new Error(`Annict API error: ${programsResponse.status}`);
      }
      
      const programsData = await programsResponse.json();
      
      if (!programsData || !programsData.programs || programsData.programs.length === 0) {
        alert('放送予定が見つかりませんでした。Annictで作品に「見てる」または「見たい」ステータスを設定してください。');
        return;
      }
      
      // 既存のcustomAnimeのIDを取得（重複チェック用）
      const existingIds = new Set(customAnime.map(a => a.id));
      const existingAnnictWorkIds = new Set(customAnime.filter(a => a.annictWorkId).map(a => a.annictWorkId));
      
      // プリセット（ANIME_DATABASE）のタイトルセットを作成（重複チェック用）
      const presetTitles = new Set(ANIME_DATABASE.map(a => a.title.trim()));
      
      console.log('[Annict取得] プリセット作品数:', presetTitles.size);
      console.log('[Annict取得] 既存のcustomAnime数:', customAnime.length);
      console.log('[Annict取得] 取得したプログラム数:', programsData.programs.length);
      
      // 曜日の日本語マッピング（0=日, 1=月, ..., 6=土）
      const dayMap = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
      
      // プログラム情報から作品情報を抽出
      const newAnimeList = [];
      const annictDataUpdates = {};
      let skippedCount = 0;
      let skippedReasons = { duplicateWorkId: 0, duplicateTitle: 0 };
      
      programsData.programs.forEach(program => {
        if (!program.work || !program.work.title) return;
        
        const workId = program.work.id;
        const title = program.work.title.trim();
        
        // 既に追加されている作品（Annict workIdでチェック）はスキップ
        if (existingAnnictWorkIds.has(workId)) {
          skippedCount++;
          skippedReasons.duplicateWorkId++;
          console.log(`[Annict取得] スキップ（既存のworkId）: ${title} (workId: ${workId})`);
          return;
        }
        
        // プリセット（ANIME_DATABASE）とタイトルが重複する作品はスキップ
        if (presetTitles.has(title)) {
          skippedCount++;
          skippedReasons.duplicateTitle++;
          console.log(`[Annict取得] スキップ（プリセットと重複）: ${title} (workId: ${workId})`);
          return;
        }
        
        // 放送時間から曜日と時間を取得
        let day = '月曜'; // デフォルト
        let time = '00:00'; // デフォルト
        
        if (program.started_at) {
          const date = new Date(program.started_at);
          const dayOfWeek = date.getDay();
          day = dayMap[dayOfWeek] || '月曜';
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          time = `${hours}:${minutes}`;
        }
        
        const animeId = `annict-${workId}`;
        const newAnime = {
          id: animeId,
          title: program.work.title,
          day: day,
          time: time,
          genre: 'Annictから取得',
          isCustom: true,
          annictWorkId: workId
        };
        
        newAnimeList.push(newAnime);
        existingAnnictWorkIds.add(workId);
        
        // Annict情報も保存
        annictDataUpdates[animeId] = { workId: workId, episodeIds: {} };
        
        console.log(`[Annict取得] 追加: ${title} (workId: ${workId}, ${day} ${time})`);
      });
      
      console.log(`[Annict取得] 結果: ${newAnimeList.length}件追加, ${skippedCount}件スキップ (workId重複: ${skippedReasons.duplicateWorkId}, タイトル重複: ${skippedReasons.duplicateTitle})`);
      
      if (newAnimeList.length === 0) {
        const message = skippedCount > 0 
          ? `新しい作品が見つかりませんでした。\n${skippedCount}件の作品が既にリストに含まれているか、プリセットと重複しているためスキップされました。`
          : '新しい作品が見つかりませんでした。Annictで「見てる」または「見たい」ステータスを設定した作品がない可能性があります。';
        alert(message);
        return;
      }
      
      // customAnimeに追加
      const updatedCustomAnime = [...customAnime, ...newAnimeList];
      setCustomAnime(updatedCustomAnime);
      
      // Annict情報も更新
      const updatedAnnictData = { ...annictData, ...annictDataUpdates };
      setAnnictData(updatedAnnictData);
      
      // Firestoreに保存
      saveState({ 
        customAnime: updatedCustomAnime,
        annictData: updatedAnnictData
      });
      
      alert(`${newAnimeList.length}件の作品をリストに追加しました！`);
    } catch (error) {
      console.error('Failed to fetch current season anime from Annict:', error);
      alert(`Annictから作品情報を取得できませんでした: ${error.message}`);
    } finally {
      setFetchingAnime(false);
    }
  };

  // Annictから登録されているアニメ情報を取得してリストに追加（/me/worksから）
  const fetchRegisteredAnime = async () => {
    if (!annictAccessToken) {
      alert('Annictでログインしてください。');
      return;
    }
    
    setFetchingAnime(true);
    try {
      // 複数のステータスを取得（watching, wanna_watch）
      const statuses = ['watching', 'wanna_watch'];
      const allWorks = [];
      
      for (const status of statuses) {
        const worksUrl = `https://api.annict.com/v1/me/works?filter_status=${status}&per_page=50`;
        const worksResponse = await fetch(worksUrl, {
          headers: {
            'Authorization': `Bearer ${annictAccessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!worksResponse.ok) {
          console.warn(`Failed to fetch works with status ${status}:`, worksResponse.status);
          continue;
        }
        
        const worksData = await worksResponse.json();
        if (worksData && worksData.works) {
          allWorks.push(...worksData.works);
        }
      }
      
      if (allWorks.length === 0) {
        alert('登録されている作品が見つかりませんでした。Annictで作品に「見てる」または「見たい」ステータスを設定してください。');
        return;
      }
      
      // 既存のcustomAnimeのIDを取得（重複チェック用）
      const existingAnnictWorkIds = new Set(customAnime.filter(a => a.annictWorkId).map(a => a.annictWorkId));
      
      // プリセットが有効な場合のみ、プリセット（ANIME_DATABASE）のタイトルセットを作成（重複チェック用）
      const presetTitles = enablePreset ? new Set(ANIME_DATABASE.map(a => a.title.trim())) : new Set();
      
      console.log('[Annict取得-登録作品] プリセット有効:', enablePreset);
      console.log('[Annict取得-登録作品] プリセット作品数:', presetTitles.size);
      console.log('[Annict取得-登録作品] 既存のcustomAnime数:', customAnime.length);
      console.log('[Annict取得-登録作品] 取得した作品数:', allWorks.length);
      
      // 各作品を処理
      const newAnimeList = [];
      const annictDataUpdates = {};
      let skippedCount = 0;
      let continuedCount = 0;
      let skippedReasons = { duplicateWorkId: 0, duplicateTitle: 0, notCurrentSeason: 0 };
      const dayMap = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
      const currentSeason = '2026-winter'; // 今季のシーズン
      
      for (const work of allWorks) {
        const workId = work.id;
        const title = work.title.trim();
        const seasonName = work.season_name || null;
        
        // 既に追加されている作品（Annict workIdでチェック）はスキップ
        if (existingAnnictWorkIds.has(workId)) {
          skippedCount++;
          skippedReasons.duplicateWorkId++;
          console.log(`[Annict取得-登録作品] スキップ（既存のworkId）: ${title} (workId: ${workId})`);
          continue;
        }
        
        // プリセットが有効な場合のみ、プリセット（ANIME_DATABASE）とタイトルが重複する作品をスキップ
        if (enablePreset && presetTitles.has(title)) {
          skippedCount++;
          skippedReasons.duplicateTitle++;
          console.log(`[Annict取得-登録作品] スキップ（プリセットと重複）: ${title} (workId: ${workId})`);
          continue;
        }
        
        // プログラム情報を取得して放送時間を取得（継続作品も含めて、放送予定がある作品を取得）
        let day = ''; // 設定待ち（空文字列）
        let time = ''; // 設定待ち（空文字列）
        let hasProgram = false;
        
        try {
          const programsUrl = `https://api.annict.com/v1/programs?filter_work_id=${workId}&per_page=1`;
          const programsResponse = await fetch(programsUrl, {
            headers: {
              'Authorization': `Bearer ${annictAccessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (programsResponse.ok) {
            const programsData = await programsResponse.json();
            if (programsData && programsData.programs && programsData.programs.length > 0) {
              hasProgram = true;
              const program = programsData.programs[0];
              if (program.started_at) {
                const date = new Date(program.started_at);
                const dayOfWeek = date.getDay();
                day = dayMap[dayOfWeek] || '';
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                time = `${hours}:${minutes}`;
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch program for work ${workId}:`, err);
        }
        
        // 今季アニメ（2026-winter）でない場合でも、放送予定がある継続作品は取得する
        // ただし、放送予定がなく、今季アニメでもない場合はスキップ
        if (seasonName !== currentSeason && !hasProgram) {
          skippedCount++;
          skippedReasons.notCurrentSeason++;
          console.log(`[Annict取得-登録作品] スキップ（今季アニメではなく、放送予定もなし）: ${title} (workId: ${workId}, season_name: ${seasonName || 'null'})`);
          continue;
        }
        
        // 継続作品の場合（season_nameが2026-winterでないが、放送予定がある）
        if (seasonName !== currentSeason && hasProgram) {
          continuedCount++;
          console.log(`[Annict取得-登録作品] 継続作品として追加: ${title} (workId: ${workId}, season_name: ${seasonName || 'null'})`);
        }
        
        const animeId = `annict-${workId}`;
        const newAnime = {
          id: animeId,
          title: title,
          day: day,
          time: time,
          genre: 'Annictから取得',
          isCustom: true,
          annictWorkId: workId
        };
        
        newAnimeList.push(newAnime);
        existingAnnictWorkIds.add(workId);
        
        // Annict情報も保存
        annictDataUpdates[animeId] = { workId: workId, episodeIds: {} };
        
        console.log(`[Annict取得-登録作品] 追加: ${title} (workId: ${workId}, ${day} ${time})`);
      }
      
      console.log(`[Annict取得-登録作品] 結果: ${newAnimeList.length}件追加 (継続作品: ${continuedCount}件), ${skippedCount}件スキップ (workId重複: ${skippedReasons.duplicateWorkId}, タイトル重複: ${skippedReasons.duplicateTitle}, 今季アニメ以外かつ放送予定なし: ${skippedReasons.notCurrentSeason})`);
      
      if (newAnimeList.length === 0) {
        const message = skippedCount > 0 
          ? `新しい作品が見つかりませんでした。\n${skippedCount}件の作品が既にリストに含まれているか${enablePreset ? '、プリセットと重複している' : ''}か、2026年冬アニメではなく放送予定もないためスキップされました。`
          : 'Annictで「見てる」または「見たい」ステータスを設定した2026年冬アニメまたは継続作品が見つかりませんでした。';
        alert(message);
        return;
      }
      
      // customAnimeに追加
      const updatedCustomAnime = [...customAnime, ...newAnimeList];
      setCustomAnime(updatedCustomAnime);
      
      // Annict情報も更新
      const updatedAnnictData = { ...annictData, ...annictDataUpdates };
      setAnnictData(updatedAnnictData);
      
      // Firestoreに保存
      saveState({ 
        customAnime: updatedCustomAnime,
        annictData: updatedAnnictData
      });
      
      // 成功メッセージを作成
      let successMessage = `Annictで「見てる」「見たい」に登録した作品から、${newAnimeList.length}件をリストに追加しました！`;
      if (continuedCount > 0) {
        successMessage += `\n（うち${continuedCount}件は継続作品です）`;
      }
      if (newAnimeList.length > 0 && newAnimeList.length <= 5) {
        // 5件以下の場合はタイトルを表示
        const titles = newAnimeList.map(a => a.title).join('、');
        successMessage += `\n\n追加された作品：\n${titles}`;
      } else if (newAnimeList.length > 5) {
        // 5件を超える場合は最初の5件と「他○件」を表示
        const titles = newAnimeList.slice(0, 5).map(a => a.title).join('、');
        const moreCount = newAnimeList.length - 5;
        successMessage += `\n\n追加された作品：\n${titles}\n他${moreCount}件`;
      }
      
      alert(successMessage);
    } catch (error) {
      console.error('Failed to fetch registered anime from Annict:', error);
      alert(`Annictから作品情報を取得できませんでした: ${error.message}`);
    } finally {
      setFetchingAnime(false);
    }
  };


  // AnnictクライアントIDが設定されているかチェック
  const envClientId = import.meta.env.VITE_ANNICT_CLIENT_ID;
  const hasAnnictClientId = (envClientId && envClientId !== 'YOUR_CLIENT_ID') || annictClientId;

  // 個人用アクセストークンでログイン
  const loginWithPersonalToken = async () => {
    const token = annictTokenInput.trim();
    if (!token) {
      alert('アクセストークンを入力してください。');
      return;
    }
    
    try {
      // トークンを検証（/v1/meエンドポイントで確認）
      const response = await fetch('https://api.annict.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('アクセストークンが無効です。正しいトークンを入力してください。');
          return;
        }
        throw new Error(`Annict API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // AnnictユーザーIDを取得
      const userId = data.id || null;
      
      // トークンが有効な場合、AnnictユーザーIDと一緒に保存
      setAnnictAccessToken(token);
      setAnnictUserId(userId);
      saveState({ annictAccessToken: token, annictUserId: userId });
      setIsAnnictTokenModalOpen(false);
      setAnnictTokenInput('');
      alert('Annictにログインしました！');
    } catch (error) {
      console.error('Failed to login with personal token:', error);
      alert(`ログインに失敗しました: ${error.message}`);
    }
  };

  // Googleログイン処理
  const handleGoogleSignIn = async () => {
    if (!auth) {
      alert('認証サービスが利用できません');
      return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // ユーザーがポップアップを閉じた場合はエラーを表示しない
        return;
      }
      alert(`ログインに失敗しました: ${error.message}`);
    }
  };

  // Firebaseログアウト処理（Googleログアウト）
  const handleGoogleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      alert(`ログアウトに失敗しました: ${error.message}`);
    }
  };

  // Annictログアウト処理（Annict連携のみ解除）
  const handleAnnictLogout = () => {
    setAnnictAccessToken(null);
    setAnnictUserInfo(null);
    setAnnictUserId(null);
    saveState({ annictAccessToken: null, annictUserId: null });
  };

  // ログインしていない場合のログイン画面
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
              2026 Winter Anime Hub
            </h1>
            <p className="text-sm text-neutral-400">
              dアニメストアニコニコ支店で見てる人向けサービス
            </p>
          </div>
          <div className="bg-blue-600/20 p-6 rounded-2xl mb-6">
            <Sparkles className="text-blue-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-black text-white mb-2">ログインしてください</h2>
            <p className="text-sm text-neutral-400">
              Googleアカウントでログインして、アニメ視聴管理を始めましょう
            </p>
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </button>
          <p className="text-xs text-neutral-500 mt-6">
            ログイン後、設定からAnnictと連携できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              2026 Winter Anime Hub
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              dアニメストアニコニコ支店で見てる人向けサービス
            </p>
            <div className="flex items-center gap-3 mt-2 text-neutral-500">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                <User size={12} />
                {user?.displayName || user?.email || 'ユーザー'}
                {annictAccessToken && (
                  <span className="text-purple-400 ml-1">• Annict連携済み</span>
                )}
              </span>
              <p className="text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider">
                <Calendar size={12} /> Cloud Sync Active
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            {annictAccessToken && (
              <div className="relative annict-fetch-menu-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAnnictFetchMenuOpen(!isAnnictFetchMenuOpen);
                  }}
                  disabled={fetchingAnime}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all shadow-lg font-bold text-xs uppercase"
                  title="Annictからアニメを取得"
                >
                  {fetchingAnime ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      取得中...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Annictから取得
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
                
                {!fetchingAnime && isAnnictFetchMenuOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        fetchRegisteredAnime();
                        setIsAnnictFetchMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      <div>
                        <div className="font-bold text-white">登録アニメを取得</div>
                        <div className="text-xs text-neutral-400">今季アニメ・継続作品を取得</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={handleGoogleLogout}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase"
              title="Googleログアウト"
            >
              <LogOut size={16} />
              ログアウト
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl transition-all shadow-lg active:scale-95 font-bold text-xs uppercase tracking-widest"
            >
              <Plus size={18} />
              作品追加
            </button>
            <button 
              onClick={handleRefresh}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-3 rounded-2xl transition-all shadow-xl active:scale-95 border border-neutral-700 font-bold text-xs uppercase tracking-widest"
            >
              <RefreshCw size={18} />
              週次更新
            </button>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-3 rounded-2xl transition-all shadow-xl active:scale-95 border border-neutral-700 font-bold text-xs uppercase"
              title="設定"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        {/* 進捗ダッシュボード */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
              <BarChart3 size={64} />
            </div>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">実質進捗率</p>
            <h3 className="text-4xl font-black text-white">{stats.percent}%</h3>
            <div className="mt-4 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">視聴予定作品</p>
            <h3 className="text-4xl font-black text-white">{stats.watched} <span className="text-xl text-neutral-600 font-medium">/ {stats.total}</span></h3>
            <p className="text-blue-400 text-[10px] mt-2 font-bold uppercase tracking-wider">
              {Object.keys(overrides).length} 作品を修正済み
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl">
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setViewMode('timeline')}
                className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'hover:bg-neutral-800 text-neutral-400'}`}
              >
                <span className="flex items-center gap-2">
                  <Grid3x3 size={14} />
                  週間タイムライン
                </span>
                {viewMode === 'timeline' && <ChevronRight size={14} />}
              </button>
              <button 
                onClick={() => setViewMode('active')}
                className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${viewMode === 'active' ? 'bg-blue-600 text-white' : 'hover:bg-neutral-800 text-neutral-400'}`}
              >
                <span className="flex items-center gap-2">
                  <List size={14} />
                  未視聴リスト
                </span>
                {viewMode === 'active' && <ChevronRight size={14} />}
              </button>
              <button 
                onClick={() => setViewMode('watched')}
                className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${viewMode === 'watched' ? 'bg-blue-600 text-white' : 'hover:bg-neutral-800 text-neutral-400'}`}
              >
                視聴済み
                {viewMode === 'watched' && <ChevronRight size={14} />}
              </button>
              <button 
                onClick={() => setViewMode('ignored')}
                className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${viewMode === 'ignored' ? 'bg-blue-600 text-white' : 'hover:bg-neutral-800 text-neutral-400'}`}
              >
                スルー / 非表示
                {viewMode === 'ignored' && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </section>

        {/* コントロール */}
        <div className="sticky top-4 z-10 space-y-4 mb-8 bg-neutral-950/90 backdrop-blur-xl p-3 rounded-2xl border border-neutral-900 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text"
                placeholder="作品を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 w-full no-scrollbar">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap border ${
                    selectedDay === day 
                      ? 'bg-blue-600 text-white border-blue-500' 
                      : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          {/* 編集フィルター */}
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-black text-neutral-500 uppercase whitespace-nowrap">編集状態:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setEditFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                  editFilter === 'all'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setEditFilter('unedited')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                  editFilter === 'unedited'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                未編集のみ
              </button>
              <button
                onClick={() => setEditFilter('edited')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                  editFilter === 'edited'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                編集済みのみ
              </button>
            </div>
          </div>
        </div>

        {/* 週間タイムライン */}
        {viewMode === 'timeline' && (
          <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
            {/* 週間ヘッダー */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-800/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar size={18} />
                  週間タイムライン
                </h2>
                <div className="text-xs text-neutral-400 font-bold">
                  {getWeekStart && weekDates && weekDates.length > 6 && (
                    <>
                      {getWeekStart.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                    </>
                  )}
                </div>
              </div>
              {currentTimePosition && (
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <Clock size={12} />
                  現在時刻: {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            {/* タイムラインターブル */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-8 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-20">
                  <div className="p-3 text-xs font-black text-neutral-500 uppercase border-r border-neutral-800">
                    時間
                  </div>
                  {dayOrder.map((day, index) => {
                    const date = weekDates && weekDates[index] ? weekDates[index] : null;
                    const isToday = currentTimePosition?.dayIndex === index;
                    return (
                      <div 
                        key={day}
                        className={`p-3 text-center border-r border-neutral-800 last:border-r-0 ${
                          isToday ? 'bg-blue-900/20' : ''
                        }`}
                      >
                        <div className={`text-xs font-black uppercase ${isToday ? 'text-blue-400' : 'text-neutral-400'}`}>
                          {day}
                        </div>
                        {date && (
                          <div className={`text-[10px] mt-1 ${isToday ? 'text-blue-300' : 'text-neutral-500'}`}>
                            {date.getMonth() + 1}/{date.getDate()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* タイムスロット */}
                <div className="relative">
                  {timeSlots && timeSlots.length > 0 ? (
                    timeSlots.map((slot, slotIndex) => (
                      <div key={slot.hour} className="grid grid-cols-8 border-b border-neutral-800/50">
                        {/* 時間ラベル */}
                        <div className="p-2 text-xs text-neutral-600 font-mono border-r border-neutral-800 bg-neutral-950/50">
                          {slot.label}
                        </div>

                        {/* 各曜日のセル */}
                        {dayOrder.map((day, dayIndex) => {
                          try {
                            const slotStart = slot.minutes || 0;
                            const slotEnd = slotIndex < (timeSlots.length - 1) ? (timeSlots[slotIndex + 1]?.minutes || 26 * 60) : 26 * 60;
                            const animeInSlot = (timelineData && timelineData[day] ? timelineData[day] : []).filter(anime => {
                              // この時間スロットに該当するアニメを取得
                              if (!anime || typeof anime.minutes !== 'number') return false;
                              return anime.minutes >= slotStart && anime.minutes < slotEnd;
                            });

                            const isCurrentTimeSlot = currentTimePosition?.dayIndex === dayIndex && 
                              currentTimePosition?.minutes >= slot.minutes && 
                              currentTimePosition?.minutes < slotEnd;

                            return (
                              <div 
                                key={day}
                                className={`min-h-[60px] p-1 border-r border-neutral-800/50 last:border-r-0 relative ${
                                  isCurrentTimeSlot ? 'bg-blue-900/10' : ''
                                }`}
                              >
                                {animeInSlot.map((anime) => (
                                  <div
                                    key={anime.id}
                                    onClick={() => toggleWatch(anime.id)}
                                    className={`mb-1 p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02] text-xs ${
                                      anime.isWatched
                                        ? 'bg-blue-600/20 border border-blue-500/30 opacity-60'
                                        : 'bg-neutral-800 border border-neutral-700 hover:border-blue-500/50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className={`flex-shrink-0 mt-0.5 ${anime.isWatched ? 'text-blue-400' : 'text-neutral-500'}`}>
                                        {anime.isWatched ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 border border-neutral-600 rounded" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-bold text-[10px] text-white truncate">
                                          {anime.time}
                                        </div>
                                        <div className={`text-[11px] mt-0.5 ${anime.isWatched ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                                          {anime.title}
                                        </div>
                                        {/* 話数表示（タイムライン） */}
                                        {(() => {
                                          const currentEp = getCurrentEpisode(anime.id);
                                          const nextEp = getNextEpisode(anime.id);
                                          if (currentEp > 0) {
                                            return (
                                              <div className="mt-0.5">
                                                <span className="text-[9px] text-blue-400">次: {nextEp}話</span>
                                              </div>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* 現在時刻インジケーター */}
                                {isCurrentTimeSlot && currentTimePosition && (
                                  <div 
                                    className="absolute left-0 right-0 h-0.5 bg-blue-500 z-10"
                                    style={{
                                      top: `${Math.max(0, Math.min(100, ((currentTimePosition.minutes - slot.minutes) / 60) * 100))}%`
                                    }}
                                  >
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            );
                          } catch (err) {
                            console.error('Timeline cell error:', err);
                            return (
                              <div key={day} className="min-h-[60px] p-1 border-r border-neutral-800/50 last:border-r-0">
                                {/* Error state */}
                              </div>
                            );
                          }
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-8 p-8 text-center text-neutral-500">
                      タイムラインを読み込み中...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* アニメリスト */}
        {viewMode !== 'timeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAnime.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center">
                  <div className="bg-blue-600/20 p-4 rounded-2xl inline-block mb-4">
                    <Sparkles className="text-blue-400" size={48} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">作品がまだ登録されていません</h3>
                  <p className="text-neutral-400 mb-6">
                    まずは「作品追加」ボタンから作品を追加するか、Annictと連携して自動的にリストを作成しましょう
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                    >
                      作品を追加
                    </button>
                    <button
                      onClick={() => setIsTutorialOpen(true)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                    >
                      Annictと連携
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredAnime.map(anime => {
            const isWatched = watchedIds.includes(anime.id);
            const isIgnored = ignoredIds.includes(anime.id);
            
            return (
              <div 
                key={anime.id}
                className={`group relative flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                  isWatched 
                    ? 'bg-neutral-900/40 border-neutral-900' 
                    : isIgnored ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-sm'
                }`}
              >
                <div 
                  onClick={() => toggleWatch(anime.id)}
                  className="mr-4 flex-shrink-0 cursor-pointer"
                >
                  {isWatched ? (
                    <div className="bg-blue-500 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-90">
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div className="bg-neutral-800 text-neutral-600 p-2 rounded-xl group-hover:bg-neutral-700 transition-colors">
                      <div className="w-5 h-5 border-2 border-neutral-600 rounded-md" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => toggleWatch(anime.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${anime.isOverridden ? 'text-blue-400' : 'text-neutral-500'}`}>
                      {anime.day && anime.time ? (
                        `${anime.day} ${anime.time}`
                      ) : (
                        <span className="text-yellow-500">設定待ち</span>
                      )}
                      {anime.isCustom && <span className="bg-indigo-900/40 text-indigo-400 px-1 rounded">CUSTOM</span>}
                      {anime.isOverridden && <span className="bg-blue-900/40 text-blue-400 px-1 rounded">EDITED</span>}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm truncate transition-all ${isWatched ? 'line-through text-neutral-600' : 'text-neutral-100'}`}>
                    {anime.title}
                  </h3>
                  {/* 話数表示 */}
                  {(() => {
                    const currentEp = getCurrentEpisode(anime.id);
                    const nextEp = getNextEpisode(anime.id);
                    if (currentEp > 0) {
                      return (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-neutral-400">現在: {currentEp}話</span>
                          <span className="text-[10px] text-blue-400 font-bold">次: {nextEp}話</span>
                          <a
                            href={getAnnictUrl(anime, nextEp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] text-purple-400 hover:text-purple-300 underline flex items-center gap-0.5"
                            title={`Annictで${nextEp}話の感想を投稿`}
                          >
                            Annict
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      );
                    } else {
                      return (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-neutral-500">次: 1話から</span>
                          <a
                            href={getAnnictUrl(anime)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] text-purple-400 hover:text-purple-300 underline flex items-center gap-0.5"
                            title="Annictで作品を検索"
                          >
                            Annict
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      );
                    }
                  })()}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  {/* Annict連携ボタン（話数が設定されている場合のみ表示） */}
                  {getCurrentEpisode(anime.id) > 0 && annictAccessToken && (
                    <button
                      onClick={(e) => openReviewModal(anime, e)}
                      className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
                      title={`アプリ内で${getNextEpisode(anime.id)}話の感想を投稿`}
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                  {getCurrentEpisode(anime.id) > 0 && (
                    <button
                      onClick={(e) => openAnnictEpisode(anime, e)}
                      className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
                      title={`Annictで${getNextEpisode(anime.id)}話の感想を投稿`}
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                  {/* 話数更新ボタン */}
                  <button
                    onClick={(e) => { e.stopPropagation(); incrementEpisode(anime.id, e); }}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all"
                    title={`次の話（${getNextEpisode(anime.id)}話）に進む`}
                  >
                    <SkipForward size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEpisodeModal(anime); }}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="話数を手動で入力"
                  >
                    <Play size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(anime); }}
                    className="p-2 text-neutral-600 hover:text-white transition-colors"
                    title="情報を編集"
                  >
                    <Edit2 size={16} />
                  </button>
                  {anime.isOverridden && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); resetOverride(anime.id); }}
                      className="p-2 text-neutral-600 hover:text-blue-400 transition-colors"
                      title="元に戻す"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                  {anime.isCustom && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCustomAnime(anime.id); }}
                      className="p-2 text-neutral-600 hover:text-red-500 transition-colors"
                      title="完全に削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleIgnore(anime.id); }}
                    className={`p-2 rounded-lg transition-all ${isIgnored ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800'}`}
                  >
                    {isIgnored ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
            );
          })
            )}
          </div>
        )}

        {/* 話数入力モーダル */}
        {isEpisodeModalOpen && editingEpisodeId && (() => {
          const editingAnime = fullDatabase.find(a => a.id === editingEpisodeId);
          return editingAnime ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                  <h2 className="text-xl font-black uppercase tracking-tighter">
                    話数を入力
                  </h2>
                  <button 
                    onClick={() => { setIsEpisodeModalOpen(false); setEditingEpisodeId(null); setEpisodeInput(''); }} 
                    className="text-neutral-500 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{editingAnime.title}</h3>
                    <p className="text-sm text-neutral-400 mb-4">
                      現在の話数を入力してください（例: 9話まで見た場合は「9」と入力）
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">話数</label>
                    <input 
                      type="number" 
                      value={episodeInput}
                      onChange={(e) => setEpisodeInput(e.target.value)}
                      placeholder="例: 9"
                      min="0"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateEpisode(editingEpisodeId, episodeInput);
                        }
                      }}
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                      入力後、次回は「{episodeInput ? parseInt(episodeInput) + 1 : 1}話」と表示されます
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsEpisodeModalOpen(false); setEditingEpisodeId(null); setEpisodeInput(''); }}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      キャンセル
                    </button>
                    <button 
                      onClick={() => updateEpisode(editingEpisodeId, episodeInput)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-blue-600/20"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* モーダル (追加・編集共通) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  {editingId ? '作品情報を編集' : '作品をマニュアル追加'}
                </h2>
                <button onClick={closeModal} className="text-neutral-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">作品タイトル</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="タイトルを入力"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-neutral-500 uppercase block">放送日時（推奨）</label>
                      <button
                        onClick={searchOnNicovideo}
                        disabled={!formData.title.trim()}
                        className="flex items-center gap-1 text-[9px] text-purple-400 hover:text-purple-300 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
                        title="ニコニコ動画の2026冬アニメページでタイトルを検索"
                      >
                        <ExternalLink size={12} />
                        ニコニコで検索
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] text-neutral-400 mb-1 block">日付</label>
                        <input 
                          type="date" 
                          value={formData.date}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-neutral-400 mb-1 block">時間</label>
                        <input 
                          type="time" 
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {formData.date && (
                      <p className="text-xs text-blue-400 mt-2">
                        自動計算: {getDayOfWeekFromDate(formData.date)} {formData.time}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-neutral-800 pt-4">
                    <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">または、曜日を直接選択</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <select 
                          value={formData.day}
                          onChange={(e) => setFormData({...formData, day: e.target.value, date: ''})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none"
                        >
                          {days.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <input 
                          type="time" 
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSaveAnime}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-sm mt-4"
                >
                  {editingId ? '変更を保存する' : 'リストに追加する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* チュートリアルモーダル */}
        {isTutorialOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Sparkles className="text-purple-400" size={24} />
                  はじめに
                </h2>
                <button 
                  onClick={completeTutorial}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="text-center mb-6">
                  <div className="bg-blue-600/20 p-6 rounded-2xl inline-block mb-4">
                    <Sparkles className="text-blue-400" size={64} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">アニメ視聴管理を始めましょう</h3>
                  <p className="text-neutral-400">
                    作品を手動で追加するか、Annictと連携して自動的にリストを作成できます
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="bg-blue-600/20 p-2 rounded-lg flex-shrink-0">
                      <Plus className="text-blue-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">1. 作品を追加する</h4>
                      <p className="text-sm text-neutral-400 mb-3">
                        「作品追加」ボタンから手動で作品を追加できます
                      </p>
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          completeTutorial();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition-all text-sm"
                      >
                        作品を追加
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="bg-purple-600/20 p-2 rounded-lg flex-shrink-0">
                      <Radio className="text-purple-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">2. （オプション）Annictアカウントと連携</h4>
                      <p className="text-sm text-neutral-400 mb-3">
                        Annictと連携すると、視聴予定を自動的に取得できます（任意の機能です）
                      </p>
                      {!annictAccessToken ? (
                        <button
                          onClick={() => {
                            setIsTutorialOpen(false);
                            setIsAnnictTokenModalOpen(true);
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg transition-all text-sm"
                        >
                          Annictでログイン
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle size={16} />
                          <span>Annictと連携済み</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="bg-indigo-600/20 p-2 rounded-lg flex-shrink-0">
                      <Download className="text-indigo-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">3. （オプション）Annictから登録アニメを取得</h4>
                      <p className="text-sm text-neutral-400 mb-3">
                        Annictで「見てる」または「見たい」ステータスを設定した作品の放送予定を自動的にリストに追加します（今季アニメ・継続作品を含む）
                      </p>
                      {!annictAccessToken ? (
                        <p className="text-xs text-neutral-500">
                          まずAnnictで認証してください
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            fetchRegisteredAnime();
                            completeTutorial();
                          }}
                          disabled={fetchingAnime}
                          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                        >
                          {fetchingAnime ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              取得中...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Annictから登録アニメを取得
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex gap-3">
                    <button
                      onClick={completeTutorial}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 個人用アクセストークン入力モーダル */}
        {isAnnictTokenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  Annictでログイン
                </h2>
                <button 
                  onClick={() => { setIsAnnictTokenModalOpen(false); setAnnictTokenInput(''); }} 
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-4">
                    個人用アクセストークンでAnnictにログインできます。
                  </p>
                  <a 
                    href="https://annict.com/settings/apps" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg mb-4"
                  >
                    <ExternalLink size={18} />
                    Annictのアクセストークン設定ページを開く
                  </a>
                  <div className="bg-neutral-800/50 p-4 rounded-xl space-y-2 text-xs text-neutral-300">
                    <p className="font-bold text-neutral-200 mb-2">手順：</p>
                    <ol className="list-decimal list-inside space-y-1.5">
                      <li>「新しいアクセストークンを作成」をクリック</li>
                      <li>説明を入力（任意、例：「AnimeWatchHelper」）</li>
                      <li>スコープで「read」と「write」を選択</li>
                      <li>作成後、表示される「アクセストークン」をコピーして下の入力欄に貼り付け</li>
                    </ol>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">
                    Annict個人用アクセストークン
                  </label>
                  <input 
                    type="password" 
                    value={annictTokenInput}
                    onChange={(e) => setAnnictTokenInput(e.target.value)}
                    placeholder="アクセストークンを入力"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loginWithPersonalToken();
                      }
                    }}
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    一度設定すると、次回から自動的に使用されます
                    <br />
                    <span className="text-green-400">✓ あなたのデータはFirestoreのセキュリティルールにより保護されています。他のユーザーからアクセスされることはありません。</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsAnnictTokenModalOpen(false); setAnnictTokenInput(''); }}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={loginWithPersonalToken}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-purple-600/20"
                  >
                    ログイン
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AnnictクライアントID設定モーダル */}
        {isAnnictClientIdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  AnnictクライアントIDを設定
                </h2>
                <button 
                  onClick={() => { setIsAnnictClientIdModalOpen(false); setAnnictClientIdInput(''); setAnnictClientSecretInput(''); }} 
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-4">
                    Annict連携には、まずAnnictでアプリケーションを登録してクライアントIDを取得する必要があります。
                  </p>
                  <a 
                    href="https://annict.com/oauth/applications" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg mb-4"
                  >
                    <ExternalLink size={18} />
                    Annictのアプリケーション設定ページを開く
                  </a>
                  <div className="bg-neutral-800/50 p-4 rounded-xl space-y-2 text-xs text-neutral-300">
                    <p className="font-bold text-neutral-200 mb-2">手順：</p>
                    <ol className="list-decimal list-inside space-y-1.5">
                      <li>「新しいアプリケーションを作成」をクリック</li>
                      <li>アプリケーション名を入力（任意、例：「AnimeWatchHelper」）</li>
                      <li>リダイレクトURIに <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-purple-400 font-mono">{window.location.origin + window.location.pathname}</code> を入力</li>
                      <li>作成後、表示される「クライアントID」と「クライアントシークレット」をコピーして下の入力欄に貼り付け</li>
                    </ol>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">
                    AnnictクライアントID
                  </label>
                  <input 
                    type="text" 
                    value={annictClientIdInput}
                    onChange={(e) => setAnnictClientIdInput(e.target.value)}
                    placeholder="クライアントIDを入力"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveAnnictClientId();
                      }
                    }}
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    一度設定すると、次回から自動的に使用されます
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">
                    Annictクライアントシークレット（オプション）
                  </label>
                  <input 
                    type="password" 
                    value={annictClientSecretInput}
                    onChange={(e) => setAnnictClientSecretInput(e.target.value)}
                    placeholder="クライアントシークレットを入力（OAuth認証に必要）"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    クライアントシークレットは、OAuth認証でアクセストークンを取得するために必要です
                    <br />
                    <span className="text-green-400">✓ あなたのデータはFirestoreのセキュリティルールにより保護されています。他のユーザーからアクセスされることはありません。</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsAnnictClientIdModalOpen(false); setAnnictClientIdInput(''); setAnnictClientSecretInput(''); }}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={saveAnnictClientId}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-purple-600/20"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 感想投稿モーダル */}
        {isReviewModalOpen && editingReviewAnime && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  感想を投稿
                </h2>
                <button 
                  onClick={() => { setIsReviewModalOpen(false); setEditingReviewAnime(null); setReviewComment(''); setReviewRating(0); }} 
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{editingReviewAnime.title}</h3>
                  <p className="text-sm text-neutral-400">
                    {getNextEpisode(editingReviewAnime.id)}話の感想を投稿
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase mb-2 block">
                    評価（オプション）
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        className={`flex-1 py-3 rounded-xl transition-all font-bold ${
                          reviewRating >= rating
                            ? 'bg-yellow-500 text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        <Star 
                          size={20} 
                          className={`mx-auto ${reviewRating >= rating ? 'fill-current' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <p className="text-xs text-neutral-500 mt-2 text-center">
                      {reviewRating} / 5
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">
                    コメント（オプション）
                  </label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="感想を入力してください..."
                    rows={6}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {reviewComment.length} 文字
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setIsReviewModalOpen(false); setEditingReviewAnime(null); setReviewComment(''); setReviewRating(0); }}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                    disabled={reviewPosting}
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={postReviewToAnnict}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2"
                    disabled={reviewPosting}
                  >
                    {reviewPosting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        投稿中...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={18} />
                        投稿する
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 設定モーダル */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
              <div className="flex-shrink-0 p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  設定
                </h2>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)} 
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* プリセットアニメのオン/オフ */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">プリセットアニメ</h3>
                      <p className="text-sm text-neutral-400">
                        初期設定されている2026年冬アニメのリストを表示/非表示
                      </p>
                    </div>
                    <button
                      onClick={togglePreset}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        enablePreset ? 'bg-blue-600' : 'bg-neutral-700'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          enablePreset ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {enablePreset ? 'プリセットアニメを表示中' : 'プリセットアニメを非表示'}
                  </p>
                </div>

                {/* 通知設定 */}
                <div className="border-t border-neutral-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <Bell size={18} />
                        通知
                      </h3>
                      <p className="text-sm text-neutral-400">
                        一日に一度、設定した時刻に未視聴アニメを通知します
                      </p>
                    </div>
                    <button
                      onClick={toggleNotification}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notificationEnabled && notificationPermission === 'granted' ? 'bg-blue-600' : 'bg-neutral-700'
                      }`}
                      disabled={notificationPermission === 'denied'}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          notificationEnabled && notificationPermission === 'granted' ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {notificationEnabled && notificationPermission === 'granted' && (
                    <div className="mb-4">
                      <label className="text-[10px] font-black text-neutral-500 uppercase mb-1 block">
                        通知時刻
                      </label>
                      <input
                        type="time"
                        value={notificationTime}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          setNotificationTime(newTime);
                          saveState({ notificationTime: newTime });
                          if (notificationEnabled && notificationPermission === 'granted') {
                            scheduleDailyNotification();
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        設定した時刻に未視聴アニメのリストを通知します
                      </p>
                    </div>
                  )}
                  {notificationPermission === 'denied' && (
                    <p className="text-xs text-red-400 mt-2">
                      通知がブロックされています。ブラウザの設定から通知を許可してください。
                    </p>
                  )}
                  {notificationPermission === 'default' && !notificationEnabled && (
                    <p className="text-xs text-neutral-500 mt-2">
                      通知を有効にすると、設定した時刻に未視聴アニメを通知します
                    </p>
                  )}
                </div>

                {/* Googleアカウント設定 */}
                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <User size={18} />
                    アカウント
                  </h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    ログイン中のアカウント: {user?.displayName || user?.email || 'ユーザー'}
                  </p>
                  <button
                    onClick={handleGoogleLogout}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Googleからログアウト
                  </button>
                </div>

                {/* Annict認証設定 */}
                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <User size={18} />
                    Annict認証
                  </h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    Annictと連携すると、視聴予定を自動的に取得できます。個人用アクセストークンでログインしてください。
                  </p>
                  {!annictAccessToken ? (
                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(false);
                        setIsAnnictTokenModalOpen(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} />
                      Annictでログイン
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                        <CheckCircle size={16} />
                        <span>Annictと連携済み</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsSettingsModalOpen(false);
                          handleAnnictLogout();
                        }}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
                      >
                        Annictログアウト
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-bold text-white mb-2">データ管理</h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    カスタム作品、視聴状態、エピソード進捗、Annict情報などをクリアします
                  </p>
                  <button
                    onClick={() => {
                      setIsSettingsModalOpen(false);
                      openConfirmModal(
                        "すべてのデータをクリアしますか？\n（カスタム作品、視聴状態、エピソード進捗、Annict情報などが削除されます）",
                        handleClearData
                      );
                    }}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    すべてのデータをクリア
                  </button>
                  <p className="text-xs text-neutral-500 mt-2 text-center">
                    ※ プリセットアニメとAnnict連携情報は保持されます
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 確認モーダル */}
        {isConfirmModalOpen && confirmModalConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-800 bg-neutral-800/50">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                  確認
                </h2>
              </div>
              <div className="p-6">
                <p className="text-white whitespace-pre-line mb-6">
                  {confirmModalConfig.message}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      setConfirmModalConfig(null);
                    }}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    実行
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-20 py-10 border-t border-neutral-900 flex flex-col items-center gap-4 text-center">
          <p className="text-neutral-600 text-[10px] uppercase font-black tracking-widest">
            2026 Winter Anime Hub / Personal Management Console
          </p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-700 font-bold uppercase tracking-tighter">
            <span>Powered by Firebase & Google AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;

