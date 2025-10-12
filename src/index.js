//Game constants and variables
import { db, doc, setDoc, getDoc, updateDoc, deleteDoc } from "./config.js";
let inputDir = {x: 0, y: 0};
import musicFile from "./assets/music.mp3";
import foodFile from './assets/food.mp3';
import gameOverFile from './assets/gameover.mp3';
import moveFile from './assets/move.mp3';
const board = document.getElementById("board");
const musicSound = new Audio(musicFile);
const foodSound = new Audio(foodFile);
const gameOverSound = new Audio(gameOverFile);
const moveSound = new Audio(moveFile);
let score = 0;
const Score = document.getElementById('score');
let speed = 5;
let lastPaintTime = 0;
let snakeArr = [
    {x: 13, y: 15}
]
let food = {x:6, y:7};

//Game Functions
let existingPlayer = false;
async function getPlayerName() {
  let playerName = localStorage.getItem("playerName");

  while (!playerName || playerName.trim() === "") {
    playerName = prompt("Enter your name (cannot be empty):");
    if (playerName === null) {
      alert("You must enter a name to play!");
      continue;
    }
    playerName = playerName.trim();
  }

  localStorage.setItem("playerName", playerName);

  const playerRef = doc(db, "Players", playerName); // use player's name as doc ID
    const docSnap = await getDoc(playerRef);

    if (!docSnap.exists()) {
    await setDoc(playerRef, { playerName: playerName, highScore: 0 });
    console.log("✅ Created new player document:", playerName);
    } else {
    console.log("📄 Existing player document found:", docSnap.data());
    existingPlayer = true;
    }

  return playerName;
}
async function updateHighScore(playerName, score) {
    if (typeof playerName !== "string" || !playerName.trim()) {
        console.error("❌ Invalid playerName:", playerName);
        return;
    }

    const playerRef = doc(db, "Players", playerName);
    const playerSnap = await getDoc(playerRef);

    if(playerSnap.exists()){
        const currHigh = playerSnap.data().highScore || 0;

        if(score > currHigh){
            await updateDoc(playerRef, { highScore: score });
            alert(`🔥 New high score for ${playerName}: ${score}`);
        } else {
            console.log(`No update needed. Current high: ${currHigh}`);
        }
    } else {
        console.log("player document not found");
    }
}

async function resetGameData(playerName) {
    const confirmReset = confirm("Are you sure you want to delete all your saved data?");
    if (!confirmReset) return;
    if(!playerName) return;
    // Clear relevant data
    localStorage.removeItem("playerName");
    localStorage.removeItem("playerData");
    const playerData = doc(db, "Players", playerName);
    try{
        await deleteDoc(playerData);
        console.log(`Data deleted for "${playerName}"`);
        alert("✅ All data cleared! Restart the game to begin fresh.");
    }catch(error){
        console.error("error deleting doc:", error);
    }
    alert("✅ All data cleared! Restart the game to begin fresh.");
    location.reload(); // refresh to reset display and prompt for name again
}
async function saveTopScore(score){
    const playerName = localStorage.getItem("playerName");
    const topPlayer = JSON.parse(localStorage.getItem("topPlayer"));

    const topPlayerRef = doc(db, "Meta", "topScore");
    const top = await getDoc(topPlayerRef);
    if(top.exists()){
        const currTop = top.data().TopScore || 0;

        if(score > currTop){
            await updateDoc(topPlayerRef, {Name: playerName, TopScore: score });
            alert(`${playerName} just set a NEW TOP SCORE: ${score} points! 🏆`);
        } else {
            console.log(`No update needed. Current high: ${currTop}`);
        }
    } else {
        console.log("player document not found");
    }
    if(!topPlayer || score > topPlayer.score){
        const newTopPlayer = { name: playerName, score: score };
        localStorage.setItem("topPlayer", JSON.stringify(newTopPlayer));
    }
}
async function displayTopScore(){
    const topScoreDisplay = document.getElementById("top-score");

    const topPlayerRef = doc(db, "Meta", "topScore");
    const topSnap = await getDoc(topPlayerRef);

    if (topSnap.exists()) {
        const data = topSnap.data();
        topScoreDisplay.innerText = `🏆 Top Player: ${data.Name} — ${data.TopScore} pts`;
    } else {
        topScoreDisplay.innerText = "🏆 No top score yet!";
    }
}
function savePlayerScore(score){
    const playerName = localStorage.getItem("playerName");
    const playerData = {name: playerName, lastScore: score};
    localStorage.setItem("playerData", JSON.stringify(playerData));
}

async function displayPlayerInfo(){
    const playerData = JSON.parse(localStorage.getItem("playerData"));
    const playerDisplay = document.getElementById("player-info");
    const playerRef = doc(db, "Players", playerName);
    const playerInfo = await getDoc(playerRef);

    if(playerData && existingPlayer){
        const data = playerInfo.data();
        playerDisplay.innerText = `🎮 Welcome back, ${data.playerName}! 
            Your last score: ${playerData.lastScore}`;
    }else{
        playerDisplay.innerHTML = "🎮 Welcome, new player!";
    }
}
function main(ctime){
    window.requestAnimationFrame(main);
    if((ctime-lastPaintTime)/1000 < 1/speed){
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
    // console.log(ctime);
}
function isCollide(snake){
    if (!snake || snake.length === 0) return false;
    for (let i = 1; i < snakeArr.length; i++) {
        if(snake[i].x === snake[0].x && snake[i].y === snake[0].y){
            return true;
        }
    }
    if (
        snake[0].x >= 18 || 
        snake[0].x <= 0 || 
        snake[0].y >= 18 || 
        snake[0].y <= 0
    ) {
        return true;
    }
}
let gameOver = false;
async function gameEngine(){
    if (gameOver) return;
    //Part 1: Updating the snake array
    if(isCollide(snakeArr)){
        gameOver = true;
        gameOverSound.play();
        musicSound.pause();
        const playerName = localStorage.getItem("playerName");
        savePlayerScore(score);
        await updateHighScore(playerName, score);
        await saveTopScore(score);
        await displayTopScore();
        await displayPlayerInfo();
        inputDir = {x:0, y:0};
        alert("Game Over. Press any key to play again!");
        snakeArr = [{x:13, y:15}];
        musicSound.play()
        score = 0;
        gameOver = false;
        return;
    }

    //if you have eaten the food, increment the score and regenerate the food
    if(snakeArr[0].y === food.y && snakeArr[0].x ===food.x){
        foodSound.play();
        score += 1;
        Score.innerHTML = "Score: " + score;
        snakeArr.unshift({x:snakeArr[0].x+inputDir.x, y: snakeArr[0].y+inputDir.y});
        let a = 2;
        let b = 16;
        food = { 
        x: Math.round(a + (b - a) * Math.random()), 
        y: Math.round(a + (b - a) * Math.random())
        };
    }

    //Moving the snake
    for (let i =snakeArr.length-2; i >= 0; i--){
        snakeArr[i+1] = {...snakeArr[i]};
    }
    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;
    //Part 2: Display the snake and food
    //Display the snake
    board.innerHTML = "";
    snakeArr.forEach((e, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;
        snakeElement.classList.add(index === 0 ? 'head' : 'snake');
        board.appendChild(snakeElement);
    })
    //Display the food
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    board.appendChild(foodElement);
}

//main logic starts here
async function startGame() {
  const playerName = await getPlayerName(); // ✅ Wait for name
  displayTopScore();
  displayPlayerInfo();

  window.requestAnimationFrame(main);
}

startGame(); 

window.requestAnimationFrame(main);
let musicStarted = false;
window.addEventListener('keydown', e => {
    if (!musicStarted) {
        musicSound.play();
        musicStarted = true;
    }
    inputDir = {x:0, y:1}; //start the game
    moveSound.play();
    switch (e.key){
        case "ArrowUp":
            console.log("ArrowUp")
            inputDir.x = 0;
            inputDir.y = -1;
            break;
        case "ArrowDown":
            console.log("ArrowDown")
            inputDir.x = 0;
            inputDir.y = 1;
            break;
        case "ArrowLeft":
            console.log("ArrowLeft")
            inputDir.x = -1;
            inputDir.y = 0;
            break;
        case "ArrowRight":
            console.log("ArrowRight")
            inputDir.x = 1;
            inputDir.y = 0;
            break;
        default:
            break;
    }
});
window.addEventListener('keydown', async (e) => {
    if (!musicStarted) {
        try {
            await musicSound.play();
            musicStarted = true;
        } catch(err) {
            console.error("Music play failed:", err);
        }
    }
});
const playerName = localStorage.getItem("playerName");
document.getElementById("reset-btn").addEventListener("click", () => resetGameData(playerName));
