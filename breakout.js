import Ball from './ball.js';
import Paddle from './paddle.js';
import Brick from './brick.js';
import { quadratic, colour } from "./utils.js";

let canvas = document.getElementById("breakout");
let ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth; // Resize canvas to window size
ctx.canvas.height = window.innerHeight;

const B_BORDER = 5; // Space between bricks
const B_ROWS = 8; // Number of rows of bricks

const B_HEIGHT = Math.floor((window.innerHeight / B_ROWS) * 0.4); // Height of bricks in pixels
const B_WIDTH = 2 * B_HEIGHT; // Width of bricks in pixels
const B_COLS = Math.min(20, Math.floor(window.innerWidth / (B_WIDTH + B_BORDER))); // Number of columns of bricks

let score = 0;
let timeScale = 0;
let gameOver = false;
let newGame = true;

const paddle = new Paddle(200, 20, 500, canvas);
const ball = new Ball(canvas.width / 2, paddle.y, 600, 15);

ball.setResetCb(ball => {
    ball.x = canvas.width / 2;
    ball.y = (paddle.y - ball.radius) - 1;
    bounce(10);
    paddle.x = (canvas.width / 2) - (paddle.width / 2)
    console.log("Ball off screen");
    timeScale = 0;
    setTimeout(() => {
        timeScale = 1;
    }, 500);
});

let bricks = new Array(B_ROWS * B_COLS).fill(null);

function initBricks() {
    bricks = bricks.map((item, index) => {
        let row = Math.floor(index / B_COLS); // The row we're on
        let col = index % B_COLS; // The column we're on
        let brick = new Brick(
            col * (B_WIDTH + B_BORDER) + (canvas.width - ((B_WIDTH + B_BORDER) * B_COLS)) / 2,
            row * (B_HEIGHT + B_BORDER),
            B_WIDTH,
            B_HEIGHT
        );
        // Paint them funky colours
        brick.paint(colour(quadratic(col, B_COLS, -1, 1), Math.floor((row + 1) / B_ROWS * 255), quadratic(col, B_COLS, 1, 0)));

        // Lock every third row
        if (row % 3 == 0) {
            brick.lock();
        }

        return brick;
    });
}

let keysDown = {};

window.addEventListener("keydown", e => {
    keysDown[e.keyCode] = true;
});

window.addEventListener("keyup", e => {
    delete keysDown[e.keyCode];
});

function bounce(bouncePoint) {
    var maxBounceAngle = Math.PI / 3; // 60 degrees

    // Normalises bounce point to give values between -1 and 1
    var normalisedBouncePoint = (bouncePoint / (paddle.width / 2));
    var bounceAngle = normalisedBouncePoint * maxBounceAngle;
    var ballSpeed = Math.sqrt(Math.pow(ball.xSpeed, 2) + Math.pow(ball.ySpeed, 2));

    ball.xSpeed = ballSpeed * Math.sin(bounceAngle);
    ball.ySpeed = ballSpeed * -Math.cos(bounceAngle);
    console.log("Paddle Collision");
}

function render() {
    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ball.render(ctx);

    //draw the score
    ctx.font = '68px codeproregular';
    ctx.fillStyle = '#727272';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score.toString(), 8, window.innerHeight);

    //draw the paddle
    paddle.render(ctx);

    //draw the bricks
    bricks.forEach(brick => {
        brick.render(ctx);
    })

    //draw the game over text
    if (gameOver) {
        ctx.font = '68px codeproregular';
        ctx.fillStyle = '#727272';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('Congratulations! You Win!', window.innerWidth / 2, window.innerHeight / 2 - 20);
        ctx.font = '34px codeproregular';
        ctx.fillText('Press enter to play again.', window.innerWidth / 2, (window.innerHeight / 2) + 38);
    }

    //draw the rules
    if (newGame) {
        ctx.font = '68px codeproregular';
        ctx.fillStyle = '#727272';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText("P a i n t O u t !", window.innerWidth / 2, window.innerHeight / 2 - 20);
        ctx.font = '34px codeproregular';
        ctx.fillText("Left and Right arrow keys control the paddle", window.innerWidth / 2, window.innerHeight / 2 + 38);
        ctx.fillText("Press enter to release the ball", window.innerWidth / 2, (window.innerHeight / 2) + (38 * 2));
    }
}

function update(elapsed) {
    if (bricks.filter(brick => brick.isVisible()).length == 0) {
        timeScale = 0;
        gameOver = true;
    }

    // Update the ball's position according to the elapsed time
    ball.update(elapsed * timeScale);

    //update the paddle position
    if (37 in keysDown) //left arrow key
    {
        if (paddle.x > 0)
            paddle.x -= paddle.xSpeed * elapsed * timeScale;
        else
            paddle.x = 0;
    }

    if (39 in keysDown) //right arrow key
    {
        if (paddle.x + paddle.width < window.innerWidth)
            paddle.x += paddle.xSpeed * elapsed * timeScale;
        else
            paddle.x = window.innerWidth - paddle.width;
    }

    if (13 in keysDown) //enter key
    {
        if (newGame) {
            newGame = false;
            ball.reset();
        }
        if (gameOver) {
            gameOver = false;
            ball.reset();
            initBricks();
        }
    }

    ball.checkBorderCollisions(canvas);

    //bounce the Ball off the paddle
    if (((ball.x + ball.radius >= paddle.x) && (ball.x - ball.radius <= paddle.x + paddle.width)) && ((ball.y + ball.radius >= paddle.y) && (ball.y + ball.radius <= paddle.y + paddle.height))) {
        bounce(((paddle.x + paddle.width / 2) - ball.x) * -1);
        ball.y = paddle.y - 1 - ball.radius;
        paddle.colour = ball.colour;
    }

    // Bounce the Ball off the bricks and disable bricks when they are hit
    bricks.forEach(brick => {
        if (brick.visible) {

            if (((ball.x + ball.radius >= brick.x) && (ball.x < brick.x)) && ((ball.y <= brick.y + brick.height + ball.radius / 2) && (ball.y >= brick.y - ball.radius / 2)) && ball.xSpeed > 0) //brick left side
            {
                ball.x = brick.x - ball.radius - 1;
                ball.xSpeed *= -1;
                brick.hit(ball);
            }
            else if (((ball.y - ball.radius <= brick.y + brick.height) && (ball.y >= brick.y)) && ((ball.x <= brick.x + brick.width + ball.radius / 2) && (ball.x >= brick.x - ball.radius / 2)) && ball.ySpeed < 0) //brick bottom side
            {
                ball.y = brick.y + brick.height + ball.radius + 1;
                ball.ySpeed *= -1;
                brick.hit(ball);
            }

            else if (((ball.x - ball.radius <= brick.x + brick.width) && (ball.x > brick.x + brick.width)) && ((ball.y >= brick.y - ball.radius / 2) && (ball.y <= brick.y + brick.height + ball.radius / 2)) && ball.xSpeed < 0) //brick right side
            {
                ball.x = brick.x + brick.width + ball.radius + 1;
                ball.xSpeed *= -1;
                brick.hit(ball);
            }

            else if (((ball.y + ball.radius >= brick.y) && (ball.y <= brick.y)) && ((ball.x <= brick.x + brick.width + ball.radius / 2) && (ball.x >= brick.x - ball.radius / 2)) && ball.ySpeed > 0) //brick top side
            {
                ball.y = brick.y - ball.radius - 1;
                ball.ySpeed *= -1;
                brick.hit(ball);
            }
        }
    });

}

var previous;

function run(timestamp) {
    if (!previous) previous = timestamp; //start with no elapsed time
    var elapsed = (timestamp - previous) / 1000; //work out the elapsed time
    update(elapsed); //update the game with the elapsed time
    render(); //render the scene
    previous = timestamp; //set the (globally defined) previous timestamp ready for next time
    window.requestAnimationFrame(run); //ask browser to call this function again, when it's ready
}

initBricks();
//trigger the game loop
window.requestAnimationFrame(run);
