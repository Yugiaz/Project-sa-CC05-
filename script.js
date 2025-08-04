// Floating Hearts
function createHeart() {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.innerText = '❤️';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.animationDuration = (2 + Math.random() * 3) + 's';
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 5000);
}

// Quotes Rotation
const quotes = [
  "Love is composed of a single soul inhabiting two bodies. – Aristotle",
  "I saw that you were perfect, and so I loved you. – Angelita Lim",
  "You are my heart, my life, my one and only thought. – Arthur Conan Doyle",
  "Every love story is beautiful, but ours is my favorite. – Unknown",
  "I love you more than yesterday but less than tomorrow. – Edmond Rostand",
  "To the world you may be one person, but to one person you are the world. – Dr. Seuss",
  "You will forever be my always. – Unknown"
];

let currentQuoteIndex = 0;

function rotateQuote() {
  const quoteDisplay = document.getElementById('quote-display');
  quoteDisplay.style.opacity = 0;

  setTimeout(() => {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    quoteDisplay.textContent = `"${quotes[currentQuoteIndex]}"`;
    quoteDisplay.style.opacity = 1;
  }, 500);
}

// Love Reasons Slideshow
let reasonIndex = 0;
const loveReasons = document.querySelectorAll("#love-reasons li");

function rotateLoveReasons() {
  loveReasons.forEach((li, index) => {
    li.classList.remove("active");
    if (index === reasonIndex) {
      li.classList.add("active");
    }
  });
  reasonIndex = (reasonIndex + 1) % loveReasons.length;
}

// Start App
function startApp() {
  document.querySelector('.intro-screen').classList.add('hidden');
  document.querySelector('.main-content').classList.remove('hidden');
  document.querySelector('.love-quotes').classList.remove('hidden');
  document.querySelector('.why-i-love-you').classList.remove('hidden');
  

  const music = document.getElementById('bg-music');
  music.play().catch(() => {
    console.log("Music autoplay blocked. User interaction required.");
  });

  setInterval(createHeart, 400);
  setInterval(rotateQuote, 5000);
  setInterval(rotateLoveReasons, 5000);
  rotateQuote(); // show first quote
  rotateLoveReasons(); // show first reason
}
