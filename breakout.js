import Game from "./game.js";

let canvas = document.getElementById("breakout");
let ctx = canvas.getContext("2d");

ctx.canvas.width = window.innerWidth; // Resize canvas to window size
ctx.canvas.height = window.innerHeight;

let previous = 0;
let game = new Game(canvas);

function run(timestamp) {
    let elapsed = (timestamp - previous) / 1000; //work out the elapsed time
    game.update(elapsed); //update the game with the elapsed time
    game.render(); //render the scene
    previous = timestamp; //set the (globally defined) previous timestamp ready for next time
    window.requestAnimationFrame(run); //ask browser to call this function again, when it's ready
}

//trigger the game loop
window.requestAnimationFrame(run);
