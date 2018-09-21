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

    render(ctx) {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Paddle;