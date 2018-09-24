const LOCK_COLOUR = "#4f4f4f";
const LOCKED = 2;
const UNLOCKED = 1;
const NORMAL = 0;

class Brick {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.type = NORMAL;
    }

    lock() {
        this.type = LOCKED;
        this.colour = LOCK_COLOUR;
    }

    hit(ball) {
        ball.pop();
        if (this.type === LOCKED) {
            // If this is a locked (grey) brick we should unlock it and paint it with the ball's colour
            this.type = UNLOCKED;
            this.colour = ball.colour;
        }
        else {
            // ...otherwise paint the ball and hide the brick
            ball.paint(this.colour);
            this.visible = false;
        }
    }

    reset() {
        // Make visible
        this.visible = true;

        // Re-lock unlocked bricks
        if (this.type === UNLOCKED) {
            this.type = LOCKED;
            this.colour = LOCK_COLOUR;
        }
    }

    isVisible() {
        return this.visible;
    }

    paint(colour) {
        this.colour = colour;
    }

    render(ctx) {
        if (this.visible) {
            ctx.fillStyle = this.colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

export default Brick;