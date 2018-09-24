import {clamp} from "./utils.js";

class Paddle {

    constructor(width, height, speed, canvas) {
        this.x = (canvas.width / 2) - (width / 2);
        this.y = (canvas.height - height) - 2;
        this.width = width;
        this.height = height;
        this.xSpeed = speed;
        this.colour = "white";
    }

    paint(colour) {
        this.colour = colour;
    }

    setResetCb(resetCb) {
        this.resetCb = resetCb;
    }

    reset() {
        this.resetCb(this);
    }

    update(elapsed, keysDown) {
        // Set the direction to zero
        let dir = 0;

        if ("ArrowLeft" in keysDown) {
            dir = -1;
        }
        if ("ArrowRight" in keysDown) {
            dir = 1;
        }

        // Move the paddle and clamp it to the screen edges
        this.x += this.xSpeed * elapsed * dir;
        this.x = clamp(this.x, 0, window.innerWidth - this.width);
    }

    render(ctx) {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Paddle;