self.addEventListener('push', function(event) {
    let data = event.data.json();
    const title = data.title || 'Task Reminder';
    const options = {
      body: data.body,
      icon: 'icon-192.png',  // Use the icon from your app
      badge: 'icon-192.png'
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Optional: Handle notification click
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/')  // Open the main page of the app
    );
  });
  