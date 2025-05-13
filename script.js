function addTask() {
  const taskInput = document.getElementById('taskInput');
  const timeInput = document.getElementById('timeInput');
  const taskText = taskInput.value.trim();
  const timeText = timeInput.value;

  if (taskText === '') return;

  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = `${taskText} ${timeText ? ` - Due: ${timeText}` : ''}`;
  span.onclick = () => li.classList.toggle('completed');

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.onclick = () => li.remove();

  li.appendChild(span);
  li.appendChild(removeBtn);
  document.getElementById('taskList').appendChild(li);

  if (timeText) {
    const now = new Date();
    const [hours, minutes] = timeText.split(':').map(Number);
    const dueTime = new Date(now);
    dueTime.setHours(hours, minutes, 0, 0);

    const msUntilDue = dueTime - now;
    const msBefore5Min = msUntilDue - 5 * 60 * 1000;

    if (msBefore5Min > 0) {
      setTimeout(() => {
        alert(`⏰ 5 minutes left to finish: "${taskText}"`);
      }, msBefore5Min);
    }

    if (msUntilDue > 0) {
      setTimeout(() => {
        alert(`🔔 Time's up for: "${taskText}"`);
      }, msUntilDue);
    }
  }

  taskInput.value = '';
  timeInput.value = '';
}

self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icon-192.png'
  });
});

firebase.initializeApp({
  apiKey: "AIzaSyDPp8cUturZoa2J3Mo3gSeJa3CIu4ey6Cg",
  authDomain: "project-in-pf1.firebaseapp.com",
  projectId: "project-in-pf1",
  storageBucket: "project-in-pf1.firebasestorage.app",
  messagingSenderId: "283902391908",
  appId: "1:283902391908:web:011385151f13f0c963d171",
  measurementId: "G-HNG77DHEF7"
});


const messaging = firebase.messaging();


Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    messaging.getToken({ vapidKey: "BGohZTAzvsRCZWVRuh6Tjc4siW-TI64zc59KTfhQe5VyDekv0lb3p6Gmb69tB0q22K_mePWTmPeFNmmy0ZLhsaU" })
      .then(token => {
        console.log("📱 FCM Token:", token);
  
      });
  } else {
    console.warn("🚫 Notification permission denied");
  }

  
});



