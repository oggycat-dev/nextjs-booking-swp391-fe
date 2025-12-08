// Firebase Cloud Messaging Service Worker
// Handles background push notifications for admin users

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLPIHnLR1rSTCSwFwDC5w4Tfwdlp1zceM",
  authDomain: "fpt-booking-system.firebaseapp.com",
  projectId: "fpt-booking-system",
  storageBucket: "fpt-booking-system.firebasestorage.app",
  messagingSenderId: "1081921871782",
  appId: "1:1081921871782:web:8cb14aa1977ff2a04c7967"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    tag: payload.data?.type || 'notification',
    data: payload.data,
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  // Save notification to localStorage via client message
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      client.postMessage({
        type: 'NEW_NOTIFICATION',
        notification: {
          id: Date.now().toString(),
          type: payload.data?.type || 'notification',
          title: notificationTitle,
          body: payload.notification?.body || '',
          data: payload.data,
          read: false,
          createdAt: new Date().toISOString(),
        }
      });
    }
  });

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  let url = '/dashboard';
  
  if (data) {
    switch (data.type) {
      case 'new_registration':
      case 'campus_change_request':
        url = '/dashboard/admin/users';
        break;
      case 'new_booking':
        url = data.bookingId 
          ? `/dashboard/admin/bookings?bookingId=${data.bookingId}` 
          : '/dashboard/admin/bookings';
        break;
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push events (fallback)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.notification?.title || 'FPT Booking System';
    const options = {
body: data.notification?.body || 'You have a new notification',
      icon: '/logo.png',
      data: data.data,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };
    
    // Save notification to localStorage via client message
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: 'NEW_NOTIFICATION',
          notification: {
            id: Date.now().toString(),
            type: data.data?.type || 'notification',
            title: title,
            body: data.notification?.body || '',
            data: data.data,
            read: false,
            createdAt: new Date().toISOString(),
          }
        });
      }
    });
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});