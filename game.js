
let snake = []; //snake segments data
let playerData = JSON.parse(localStorage.getItem('players')) || []; //usernames and highscores

const gameGrid = document.querySelector('.game-grid');
const cellSize = 2; 
const rows = 15;
const cols = 15;

const scoreItem = document.querySelector('#score'); //current score
const highScoreItem = document.querySelector('#high-score'); //player high score
let score = 0;

const themeSong = document.querySelector('#theme-music');
const appleCrunch = document.querySelector('#apple-crunch');
const deathSound = document.querySelector('#death');

const loginMenu = document.querySelector('.login');
const loginInput = document.querySelector('#login-input');
const loginBtn = document.querySelector('#login-btn');
const startMenu = document.querySelector('.start-game');
const startBtn = document.querySelector('.start-game button');
const muteBtn = document.querySelector('.mute-btn');
const pauseBtn = document.querySelector('.pause-resume-btn');
const pauseScreen = document.querySelector('.pause-screen');
const gameOverMenu = document.querySelector('.game-over');
const newGameBtn = document.querySelector('.game-over #newgame-btn');

let pIndex = -1; //player index
let gamePaused = false;
let interval = 0; //to call playGame()

const apple = {
    position: { x:0 , y: 0}
}

loginBtn.addEventListener('click',()=>{
    logIn();
    loginMenu.style.display ='none';
    startMenu.style.display = 'flex';
    themeSong.currentTime = 0;
    themeSong.play().catch(error => {
        console.error('Playback failed:', error)});
    muteBtn.style.display = 'block';

})

startBtn.addEventListener('click',()=>{
    startMenu.style.display = 'none';
    initGame();
});


function playGame(){
    moveSnake();
    update();
    drawGame();
}

// user input to move snake
function handleInput(e){
    if (!gamePaused){
        switch(e.key){
            case 'ArrowUp':
                snake[0].direction.x = 0;
                snake[0].direction.y = -1;
                break;
            case 'ArrowDown':
                snake[0].direction.x = 0;
                snake[0].direction.y = 1;
                break;
            case 'ArrowLeft':
                snake[0].direction.x = -1;
                snake[0].direction.y = 0;
                break;
            case 'ArrowRight':
                snake[0].direction.x = 1;
                snake[0].direction.y = 0;
                break;
        }
    }
    if (e.key == 'p' || e.key == 'P'){
        pauseGame();
    }
    if (e.key == 'm' || e.key == 'M'){
        console.log('m');
        muteGame();
    }
}

function initGame(){
    pauseBtn.style.display = 'block';
    document.addEventListener('keydown',handleInput);
    score = 0;
    snake = [];
    snake.push({position: { x:2 , y: 0}, direction: {x:1, y:0}});
    snake.push({position: { x:1 , y: 0}, direction: {x:1, y:0}});
    snake.push({position: { x:0 , y: 0}, direction: {x:1, y:0}});
    placeApple();
    interval = setInterval(playGame,200);
}

function placeApple(){
    apple.x= Math.floor(Math.random()*cols);
    apple.y= Math.floor(Math.random()*rows);
}

function drawGame(){
    scoreItem.innerHTML = `score : ${score}`;
    gameGrid.innerHTML = '';
    drawApple();
    drawSnake();
}

function drawSnake(){
    snake.forEach((item,index)=>{
        //create div
        const segment = document.createElement('div');
        if (index == 0){
            segment.classList.add('snake-head');
        }
        else{
            if (index == snake.length-1){
                segment.classList.add('snake-tail');

            }
            else{
                segment.classList.add('snake-segment');
            }
        }
        //position
        segment.style.left = `${item.position.x*cellSize}rem`; 
        segment.style.top = `${item.position.y*cellSize}rem`;
        //rotate
        if (item.direction.x==1 && item.direction.y ==0 ){
            segment.style.transform = 'rotate(0deg)';
        }
        else if (item.direction.x==-1 && item.direction.y ==0 ){
            segment.style.transform = 'rotate(-180deg)';
        }
        else if (item.direction.x==0 && item.direction.y ==1 ){
            segment.style.transform = 'rotate(90deg)';
        }
        else if (item.direction.x==0 && item.direction.y ==-1 ){
            segment.style.transform = 'rotate(-90deg)';
        }

        gameGrid.appendChild(segment);
    })
}

function drawApple(){
    const appleSprite = document.createElement('div');
    appleSprite.classList.add('apple');
    appleSprite.style.left = `${apple.x*cellSize}rem`;
    appleSprite.style.top = `${apple.y*cellSize}rem`;
    gameGrid.appendChild(appleSprite);
}

function moveSnake(){
    for (var i=snake.length-1; i>0; i--){
        console.log(snake[i].position.x);
        snake[i].position.x = snake[i-1].position.x;
        snake[i].position.y = snake[i-1].position.y;
        snake[i].direction.x = snake[i-1].direction.x;
        snake[i].direction.y = snake[i-1].direction.y;
    }
    //head
    snake[0].position.x += snake[0].direction.x;
    snake[0].position.y += snake[0].direction.y;
}


function update(){
    const head = {x: snake[0].position.x  , y: snake[0].position.y};
    //collision w wall
    if ( head.x>=cols || head.x<0 || head.y>=cols || head.y<0 ){
        gameOver();
    }
    //collision w another segment
    for(let i=1; i<snake.length; i++){
        if (head.x == snake[i].position.x && head.y == snake[i].position.y){
            gameOver();
        }
    }
    // collision w apple
    if (apple.x==head.x && apple.y==head.y){
        appleCrunch.play().catch(error => {
            console.error('Playback failed:', error)});
        score++;
        growSnake();
        placeApple();
    }
}

function growSnake(){
    let newDirX = snake[snake.length-1].direction.x;
    let newDirY = snake[snake.length-1].direction.y;
    let newX = snake[snake.length-1].position.x - newDirX;
    let newY = snake[snake.length-1].position.y - newDirY;
    snake.push({position: { x: newX , y: newY }, direction: {x: newDirX, y: newDirY}})
}

function gameOver(){
    clearInterval(interval);
    savePlayerProgress();
    document.removeEventListener('keydown',handleInput);
    gamePaused = false;
    pauseBtn.style.display = 'none';
    gameOverMenu.style.display= 'flex';
    themeSong.pause();
    deathSound.play().catch(error => {
        console.error('Playback failed:', error)});
}

function savePlayerProgress(){
    if (score>playerData[pIndex].score){
        playerData[pIndex].score = score;
        highScoreItem.innerHTML = `high score : ${playerData[pIndex].score}`;
    }
    localStorage.setItem('players',JSON.stringify(playerData));
}

muteBtn.addEventListener('click',muteGame);
    
function muteGame(){
    console.log('mute');
    themeSong.muted = !themeSong.muted;
    appleCrunch.muted = !appleCrunch.muted;
    deathSound.muted = !deathSound.muted;
    muteBtn.innerHTML = themeSong.muted? "<i class='bx bxs-volume-mute' ></i>" : "<i class='bx bxs-volume-full'></i>";
}

pauseBtn.addEventListener('click',pauseGame);

function pauseGame(){
    //resume
    if (gamePaused){
        gamePaused = false;
        pauseBtn.innerHTML = "<i class='bx bx-pause'>";
        pauseScreen.style.display = 'none';
        gameGrid.style.filter = 'none';
        themeSong.play();
        interval = setInterval(playGame,200);
    } 
    //pause
    else{
        gamePaused = true;
        pauseBtn.innerHTML = "<i class='bx bx-play-circle' ></i>";
        pauseScreen.style.display = 'block';
        gameGrid.style.filter = 'blur(0.2rem)';
        themeSong.play();
        themeSong.pause();
        clearInterval(interval);
    }
}

newGameBtn.addEventListener('click',()=>{
    gameOverMenu.style.display = 'none';
    newGame();
});

function newGame(){
    themeSong.currentTime = 0;
    themeSong.play().catch(error => {
        console.error('Playback failed:', error)});
    initGame();
}

function logIn(){
    pIndex = searchPlayer(loginInput.value);
    highScoreItem.innerHTML = `high score : ${playerData[pIndex].score}`;
}

function searchPlayer(username){
    for (let i = 0; i < playerData.length; i++) {
        if (playerData[i].name === username) {
            return i;
        }
    }
    playerData.push({name:username,score:score});
    return (playerData.length-1);
}
