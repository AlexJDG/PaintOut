import { clamp } from './utils.js';

class Ball {

    constructor(xPos, yPos, speed, radius) {
        this.x = xPos;
        this.y = yPos;
        this.xSpeed = 0; // Pixels per second
        this.ySpeed = speed;
        this.radius = radius;
        this.colour = "white";

        // Load the sound into three buffers which we will cycle to avoid audio clipping
        this.sound = Array(3).fill(null).map(() => new Audio('./assets/audio/pop.wav'));
        this.soundPtr = 0;
    }

    setResetCb(resetCb) {
        this.resetCb = resetCb;
    }

    pop() {
        // Play the next sound in the buffer and increment the pointer
        return this.sound[this.soundPtr++ % 3].play();
    }

    paint(colour) {
        this.colour = colour;
    }

    update(elapsedTime) {
        this.x += this.xSpeed * elapsedTime;
        this.y += this.ySpeed * elapsedTime;
    }

    reset() {
        this.resetCb(this);
    }

    checkBorderCollisions(canvas) {
        // Normalise x so the center of the screen is 0
        let normalisedX = this.x - canvas.width / 2;
        if (Math.abs(normalisedX) > (canvas.width / 2) - this.radius) {
            // If we're more than one half screen away from the middle (outside bounds)
            // flip horizontal speed and clamp the position to the left & right bounds
            this.xSpeed = -this.xSpeed;
            this.x = clamp(this.x, this.radius, canvas.width - this.radius);
        }

        if (this.y - this.radius < 0) {
            // If we're at the top of the screen
            // bounce down
            this.ySpeed = -this.ySpeed;
            this.y = this.radius;
        }

        if (this.y + this.radius > canvas.height) {
            this.reset();
        }
    }

    render(ctx) {
        // Draw the ball
        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default Ball;