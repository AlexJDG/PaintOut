const LOCK_COLOUR = "#4f4f4f";

class Brick {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
    }

    lock() {
        this.locked = true;
        this.colour = LOCK_COLOUR;
    }

    hit(ball) {
        ball.pop();
        if (this.locked) {
            // If this is a locked (grey) brick we should unlock it and paint it with the ball's colour
            this.locked = false;
            this.colour = ball.colour;
        }
        else {
            // ...otherwise paint the ball and hide the brick
            ball.paint(this.colour);
            this.visible = false;
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