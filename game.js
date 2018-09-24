import Paddle from "./paddle.js";
import Ball from "./ball.js";
import Brick from "./brick.js";
import {colour, quadratic} from "./utils.js";

const B_BORDER = 5; // Space between bricks
const B_ROWS = 8; // Number of rows of bricks

const B_HEIGHT = Math.floor((window.innerHeight / B_ROWS) * 0.4); // Height of bricks in pixels
const B_WIDTH = 2 * B_HEIGHT; // Width of bricks in pixels
const B_COLS = Math.min(20, Math.floor(window.innerWidth / (B_WIDTH + B_BORDER))); // Number of columns of bricks

const HEADING_FONT = '68px codeproregular';
const BODY_FONT = '34px codeproregular';
const TEXT_COLOUR = '#727272';

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.paddle = new Paddle(200, 20, 500, this.canvas);
        this.ball = new Ball(this.canvas.width / 2, this.paddle.y, 600, 15);

        this.bricks = new Array(B_ROWS * B_COLS).fill(null).map((item, index) => {
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
            if (row % 3 === 0) {
                brick.lock();
            }

            return brick;
        });

        this.score = 0;
        this.timeScale = 0;

        this.ball.setResetCb(ball => {
            ball.x = this.canvas.width / 2;
            ball.y = (this.paddle.y - ball.radius) - 1;
            this.ball.bounceOffPaddle(this.paddle);
        });

        this.paddle.setResetCb(paddle => {
            paddle.x = (this.canvas.width - this.paddle.width) / 2;
        });

        this.keysDown = {};

        window.addEventListener("keydown", e => {
            this.keysDown[e.key] = true;
        });

        window.addEventListener("keyup", e => {
            delete this.keysDown[e.key];
        });
    }

    die() {
        this.ball.reset();
        this.paddle.reset();
        this.pause();
        this.score -= 100;

        // Pause for 500ms
        setTimeout(() => {
            this.unpause();
        }, 500);
    }

    reset() {
        this.ball.reset();
        this.paddle.reset();
        this.bricks.forEach(brick => brick.reset());

        this.score = 0;
        this.unpause();
    }

    pause() {
        this.timeScale = 0;
    }

    unpause() {
        this.timeScale = 1;
    }

    numberOfBricks() {
        return this.bricks.filter(brick => brick.isVisible()).length;
    }

    isGameOver() {
        return this.numberOfBricks() === 0;
    }

    isNewGame() {
        return this.numberOfBricks() === B_ROWS * B_COLS && this.timeScale === 0;
    }

    update(elapsed) {

        if (this.isGameOver()) {
            this.pause();
        }

        // Update the ball's position according to the elapsed time
        this.ball.update(elapsed * this.timeScale);
        this.paddle.update(elapsed * this.timeScale, this.keysDown);

        if ("Enter" in this.keysDown) {
            // Enter key
            if (this.isNewGame()) {
                this.unpause();
            }
            if (this.isGameOver()) {
                this.reset();
            }
        }

        this.ball.processBorderCollisions(this.canvas);

        // If we're off screen, die
        if (this.ball.isOffScreen(this.canvas)) {
            this.die();
        }

        // TODO: Refactor the shit outta the rest of this method
        //bounce the this.ball off the paddle
        if (((this.ball.x + this.ball.radius >= this.paddle.x) && (this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width)) && ((this.ball.y + this.ball.radius >= this.paddle.y) && (this.ball.y + this.ball.radius <= this.paddle.y + this.paddle.height))) {
            this.ball.bounceOffPaddle(this.paddle);
            this.ball.y = this.paddle.y - 1 - this.ball.radius;
            this.paddle.colour = this.ball.colour;
        }

        // Bounce the this.ball off the bricks and disable bricks when they are hit
        this.bricks.forEach(brick => {
            if (brick.visible) {

                if (((this.ball.x + this.ball.radius >= brick.x) && (this.ball.x < brick.x)) && ((this.ball.y <= brick.y + brick.height + this.ball.radius / 2) && (this.ball.y >= brick.y - this.ball.radius / 2)) && this.ball.xSpeed > 0) //brick left side
                {
                    this.ball.x = brick.x - this.ball.radius - 1;
                    this.ball.xSpeed *= -1;
                    brick.hit(this.ball);
                    this.score += 10;
                }
                else if (((this.ball.y - this.ball.radius <= brick.y + brick.height) && (this.ball.y >= brick.y)) && ((this.ball.x <= brick.x + brick.width + this.ball.radius / 2) && (this.ball.x >= brick.x - this.ball.radius / 2)) && this.ball.ySpeed < 0) //brick bottom side
                {
                    this.ball.y = brick.y + brick.height + this.ball.radius + 1;
                    this.ball.ySpeed *= -1;
                    brick.hit(this.ball);
                    this.score += 10;
                }

                else if (((this.ball.x - this.ball.radius <= brick.x + brick.width) && (this.ball.x > brick.x + brick.width)) && ((this.ball.y >= brick.y - this.ball.radius / 2) && (this.ball.y <= brick.y + brick.height + this.ball.radius / 2)) && this.ball.xSpeed < 0) //brick right side
                {
                    this.ball.x = brick.x + brick.width + this.ball.radius + 1;
                    this.ball.xSpeed *= -1;
                    brick.hit(this.ball);
                    this.score += 10;
                }

                else if (((this.ball.y + this.ball.radius >= brick.y) && (this.ball.y <= brick.y)) && ((this.ball.x <= brick.x + brick.width + this.ball.radius / 2) && (this.ball.x >= brick.x - this.ball.radius / 2)) && this.ball.ySpeed > 0) //brick top side
                {
                    this.ball.y = brick.y - this.ball.radius - 1;
                    this.ball.ySpeed *= -1;
                    brick.hit(this.ball);
                    this.score += 10;
                }
            }
        });

    }

    render() {
        let renderer = this.canvas.getContext("2d");
        //clear the canvas
        renderer.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ball.render(renderer);

        //draw the score
        renderer.font = '68px codeproregular';
        renderer.fillStyle = '#727272';
        renderer.textBaseline = 'bottom';
        renderer.textAlign = 'left';
        renderer.fillText('Score: ' + this.score.toString(), 8, window.innerHeight);

        //draw the paddle
        this.paddle.render(renderer);

        //draw the bricks
        this.bricks.forEach(brick => {
            brick.render(renderer);
        });

        if (this.isGameOver()) {
            // If there are no bricks left then the game must be over
            renderer.font = HEADING_FONT;
            renderer.fillStyle = TEXT_COLOUR;
            renderer.textBaseline = 'middle';
            renderer.textAlign = 'center';
            renderer.fillText('Congratulations! You Win!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            renderer.font = BODY_FONT;
            renderer.fillText('Press enter to play again.', this.canvas.width / 2, this.canvas.height / 2 + 38);
        }

        //draw the rules
        if (this.isNewGame()) {
            renderer.font = HEADING_FONT;
            renderer.fillStyle = TEXT_COLOUR;
            renderer.textBaseline = 'middle';
            renderer.textAlign = 'center';
            renderer.fillText("P a i n t O u t !", this.canvas.width / 2, window.innerHeight / 2 - 20);
            renderer.font = BODY_FONT;
            renderer.fillText("Left and Right arrow keys control the paddle", this.canvas.width / 2, this.canvas.height / 2 + 38);
            renderer.fillText("Press enter to release the ball", this.canvas.width / 2, this.canvas.height / 2 + (38 * 2));
        }
    }
}

export default Game;