# 🐍 Snake Mania

A classic Snake game built with **HTML, CSS, JavaScript**, and **Firebase Firestore** for storing player data and global high scores.  

## Features

- Player high score tracking
- Global top score across all players
- Sound effects for food, movement, game over, and background music
- Reset game data option
- Responsive design for desktop & mobile

## Setup

1. Clone the repo:  
   ```bash
   git clone https://github.com/your-username/snake-mania.git
   cd snake-mania
Install dependencies:

bash
Copy code
npm install
Add Firebase credentials in a .env file:

env
Copy code
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DB_URL=https://your-project.firebaseio.com
Run the dev server:

bash
Copy code
npm run dev
Controls
Arrow keys to move the snake

Eat food to increase score

Alerts for personal and top high scores

Deployment
Deployable on Vercel, Netlify, or any static hosting. Make sure environment variables are set.