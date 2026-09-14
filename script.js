"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const finalScoreElement = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const playBtn = document.getElementById("playBtn");
const againBtn = document.getElementById("againBtn");

// ===============================
// AUDIO
// ===============================
const backgroundMusic = new Audio("./bg.mp3");
const eatSound = new Audio("./eat.mp3");
const explosionSound = new Audio("./Explosion1.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

eatSound.volume = 0.8;
explosionSound.volume = 0.9;


// ===============================
// GAME SETTINGS
// ===============================
const WIDTH = 1000;
const HEIGHT = 600;
const CELL = 25;

const COLS = WIDTH / CELL;
const ROWS = HEIGHT / CELL;

const GAME_SPEED = 110;

let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let score = 0;
let best = Number(localStorage.getItem("snakeBest")) || 0;

let gameRunning = false;
let gameTimer = null;

bestElement.textContent = best;


// ===============================
// BACKGROUND IMAGE
// ===============================
const backgroundImage = new Image();
backgroundImage.src = "./back.jpg";


// ===============================
// CREATE SNAKE
// ===============================
function createSnake() {

    snake = [
        { x: 12, y: 12 },
        { x: 11, y: 12 },
        { x: 10, y: 12 },
        { x: 9, y: 12 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
}


// ===============================
// CREATE FOOD
// ===============================
function createFood() {

    do {

        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };

    } while (
        snake.some(
            part => part.x === food.x && part.y === food.y
        )
    );
}


// ===============================
// DRAW BACKGROUND
// ===============================
function drawBackground() {

    if (
        backgroundImage.complete &&
        backgroundImage.naturalWidth > 0
    ) {

        ctx.drawImage(
            backgroundImage,
            0,
            0,
            WIDTH,
            HEIGHT
        );

    } else {

        ctx.fillStyle = "#18220d";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
}


// ===============================
// DRAW FOOD
// ===============================
function drawFood() {

    const x = food.x * CELL + CELL / 2;
    const y = food.y * CELL + CELL / 2;

    ctx.save();

    ctx.shadowColor = "#ff2222";
    ctx.shadowBlur = 20;

    ctx.fillStyle = "#ff3030";

    ctx.beginPath();
    ctx.arc(
        x,
        y,
        CELL * 0.37,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

    // leaf
    ctx.fillStyle = "#7cff70";
    ctx.fillRect(
        x + 3,
        y - 11,
        5,
        7
    );
}


// ===============================
// DRAW SNAKE
// ===============================
function drawSnake() {

    snake.forEach((part, index) => {

        const x = part.x * CELL + 2;
        const y = part.y * CELL + 2;

        const size = CELL - 4;

        const gradient =
            ctx.createLinearGradient(
                x,
                y,
                x + size,
                y + size
            );

        gradient.addColorStop(
            0,
            index === 0
                ? "#e8b5ff"
                : "#c657ff"
        );

        gradient.addColorStop(
            0.5,
            "#982ee5"
        );

        gradient.addColorStop(
            1,
            "#541188"
        );

        ctx.save();

        ctx.shadowColor = "#a52cff";
        ctx.shadowBlur =
            index === 0 ? 16 : 8;

        ctx.fillStyle = gradient;

        ctx.fillRect(
            x,
            y,
            size,
            size
        );

        ctx.restore();

        ctx.strokeStyle =
            "rgba(255,255,255,0.25)";

        ctx.strokeRect(
            x,
            y,
            size,
            size
        );

        // Eyes
        if (index === 0) {

            ctx.fillStyle = "white";

            ctx.beginPath();
            ctx.arc(
                x + 7,
                y + 7,
                3,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                x + size - 10,
                y + 7,
                3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
}


// ===============================
// DRAW GAME
// ===============================
function draw() {

    drawBackground();
    drawFood();
    drawSnake();
}


// ===============================
// CHANGE DIRECTION
// ===============================
function changeDirection(newDirection) {

    if (!gameRunning) return;

    const directions = {

        up: { x: 0, y: -1 },

        down: { x: 0, y: 1 },

        left: { x: -1, y: 0 },

        right: { x: 1, y: 0 }
    };

    const newDir =
        directions[newDirection];

    // Don't allow reverse direction
    if (
        newDir.x === -direction.x &&
        newDir.y === -direction.y
    ) {
        return;
    }

    nextDirection = newDir;
}


// ===============================
// START AUDIO
// ===============================
function startBackgroundMusic() {

    backgroundMusic.pause();

    backgroundMusic.currentTime = 0;

    backgroundMusic.play()
        .catch(error => {
            console.log(
                "Background music error:",
                error
            );
        });
}


// ===============================
// EATING SOUND
// ===============================
function playEatSound() {

    eatSound.pause();

    eatSound.currentTime = 0;

    eatSound.play()
        .catch(error => {
            console.log(
                "Eat sound error:",
                error
            );
        });
}


// ===============================
// EXPLOSION SOUND
// ===============================
function playExplosionSound() {

    explosionSound.pause();

    explosionSound.currentTime = 0;

    explosionSound.play()
        .catch(error => {
            console.log(
                "Explosion sound error:",
                error
            );
        });
}


// ===============================
// START GAME
// ===============================
function startGame() {

    clearInterval(gameTimer);

    createSnake();

    createFood();

    score = 0;

    scoreElement.textContent = score;

    gameRunning = true;

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    // START BACKGROUND MUSIC
    startBackgroundMusic();

    gameTimer =
        setInterval(
            gameLoop,
            GAME_SPEED
        );

    draw();
}


// ===============================
// GAME OVER
// ===============================
function gameOver() {

    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(gameTimer);

    gameTimer = null;

    // STOP BACKGROUND MUSIC
    backgroundMusic.pause();

    backgroundMusic.currentTime = 0;

    // PLAY EXPLOSION
    playExplosionSound();

    // HIGH SCORE
    if (score > best) {

        best = score;

        localStorage.setItem(
            "snakeBest",
            best
        );

        bestElement.textContent = best;
    }

    finalScoreElement.textContent =
        score;

    gameOverScreen.classList.remove(
        "hidden"
    );
}


// ===============================
// MAIN GAME LOOP
// ===============================
function gameLoop() {

    if (!gameRunning) return;

    direction = nextDirection;

    const head = snake[0];

    const newHead = {

        x: head.x + direction.x,

        y: head.y + direction.y
    };


    // ===========================
    // WALL COLLISION
    // ===========================
    if (

        newHead.x < 0 ||

        newHead.x >= COLS ||

        newHead.y < 0 ||

        newHead.y >= ROWS

    ) {

        gameOver();

        return;
    }


    // ===========================
    // FOOD
    // ===========================
    const eatingFood =
        newHead.x === food.x &&
        newHead.y === food.y;


    // ===========================
    // SELF COLLISION
    // ===========================
    const bodyToCheck =
        eatingFood
            ? snake
            : snake.slice(0, -1);


    if (

        bodyToCheck.some(

            part =>
                part.x === newHead.x &&
                part.y === newHead.y

        )

    ) {

        gameOver();

        return;
    }


    // Add new head
    snake.unshift(newHead);


    // ===========================
    // EAT FOOD
    // ===========================
    if (eatingFood) {

        score++;

        scoreElement.textContent =
            score;

        // IMPORTANT:
        // EAT SOUND PLAYS HERE
        playEatSound();

        createFood();

    } else {

        snake.pop();
    }


    draw();
}


// ===============================
// KEYBOARD CONTROLS
// ===============================
document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key;

        if (
            key === "ArrowUp" ||
            key === "w" ||
            key === "W"
        ) {

            event.preventDefault();

            changeDirection("up");
        }

        else if (
            key === "ArrowDown" ||
            key === "s" ||
            key === "S"
        ) {

            event.preventDefault();

            changeDirection("down");
        }

        else if (
            key === "ArrowLeft" ||
            key === "a" ||
            key === "A"
        ) {

            event.preventDefault();

            changeDirection("left");
        }

        else if (
            key === "ArrowRight" ||
            key === "d" ||
            key === "D"
        ) {

            event.preventDefault();

            changeDirection("right");
        }
    }
);


// ===============================
// MOBILE SWIPE
// ===============================
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();

        const touch =
            event.changedTouches[0];

        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    { passive: false }
);


canvas.addEventListener(
    "touchend",
    function(event) {

        event.preventDefault();

        const touch =
            event.changedTouches[0];

        const deltaX =
            touch.clientX -
            touchStartX;

        const deltaY =
            touch.clientY -
            touchStartY;

        const minimumSwipe = 25;

        if (
            Math.abs(deltaX) <
                minimumSwipe &&
            Math.abs(deltaY) <
                minimumSwipe
        ) {
            return;
        }


        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {

            changeDirection(
                deltaX > 0
                    ? "right"
                    : "left"
            );

        } else {

            changeDirection(
                deltaY > 0
                    ? "down"
                    : "up"
            );
        }

    },
    { passive: false }
);


canvas.addEventListener(
    "touchmove",
    function(event) {

        event.preventDefault();

    },
    { passive: false }
);


// ===============================
// BUTTONS
// ===============================
playBtn.addEventListener(
    "click",
    startGame
);

againBtn.addEventListener(
    "click",
    startGame
);

// ===============================
// INITIAL GAME
// ===============================
createSnake();

createFood();

draw();

backgroundImage.addEventListener(
    "load",
    draw
);