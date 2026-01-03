// Service Worker for PWA notifications
const CACHE_NAME = 'anime-hub-v1';

// インストール時の処理
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 既に開いているウィンドウがあればフォーカス
      for (const client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      // ウィンドウが開いていなければ新規に開く
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// メッセージ受信時の処理（フロントエンドからの通知リクエスト）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});


