var canvas = document.getElementById("breakout");
	
var ctx = canvas.getContext("2d");

ctx.canvas.width  = window.innerWidth; //resize canvas to window size
ctx.canvas.height = window.innerHeight;
//values not intended to be modifiable prefixed with 'CONST_'

var CONST_brickBorder = 5; //space between bricks
var CONST_yBricks = 8; //number of rows of bricks

var CONST_brickHeight = Math.floor((window.innerHeight/CONST_yBricks)*0.4); //height of bricks in pixels
var CONST_brickWidth = 2*CONST_brickHeight; //width of bricks in pixels
var CONST_xBricks; //number of columns of bricks

var CONST_lockedBrickColour = "#4f4f4f"

var score = 0;
var timeScale = 0;
var gameOver = 'false';
var newGame = 'true';

if(20*(CONST_brickWidth+CONST_brickBorder)<=window.innerWidth) //if 20 brick columns fit on the screen
{
	CONST_xBricks=20; 
}
else //less than 20 columns fit
{
	CONST_xBricks=Math.floor(window.innerWidth/(CONST_brickWidth+CONST_brickBorder)); //use as many as fit
}

var popSound = new Array(3);
for (i = 0; i < 3; i++)
{
	popSound[i]= new Audio('./assets/audio/pop.wav');
}
var audioPtr = 0;


var bricksInitd = 0; //keeps track of whether the bricks have been created

function Paddle(width, height, speed)
{
	this.x = (canvas.width/2)-(width/2);
	this.y = (canvas.height-height)-2;
	this.width = width;
	this.height = height;
	this.xSpeed = speed;
	this.colour = "white";		
}
 
 var paddle = new Paddle(200, 20, 500);
 
function Ball(xPos, yPos, xSpeed, ySpeed, radius)
{
	this.x = xPos; //pixels
	this.y = yPos; //pixels
	this.xSpeed = xSpeed; //pixels per second
	this.ySpeed = ySpeed; //pixels per second 
	this.radius = radius; //pixels 
	this.colour = "white";
}

var ball = new Ball(canvas.width / 2, paddle.y, 0, 600, 15);



var bricks = [];

function playPop()
{
	popSound[audioPtr%3].play();
	audioPtr++;
}

//uses a quadratic function to return a number between 0 & 255 based on passed parameters
function quadraticColour(x, xMax, a, h, k)
{	
	var normalisedX = x/xMax * 2;
	return Math.floor((a*(Math.pow(normalisedX-h,2))+k)*255);
}

function Brick(x, y, width, height, colour, visible) //constructor function
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.colour = colour;
	this.visible = visible; //bool
}

function initBricks()
{
	console.log("Bricks initialised");
	for (var i = 0; i < CONST_xBricks; i++)
	{
		for (var j = 0; j < CONST_yBricks; j++)
		{
			bricks.push(new Brick((canvas.width-((CONST_brickWidth+CONST_brickBorder) * CONST_xBricks))/2 + i*(CONST_brickWidth+CONST_brickBorder), j*(CONST_brickHeight+CONST_brickBorder), CONST_brickWidth, CONST_brickHeight, "rgb(" + (quadraticColour(i, CONST_xBricks, -1, 1, 1)).toString(10) + ", " +(Math.floor((j+1)/CONST_yBricks*255)).toString(10) + ", " + (quadraticColour(i,CONST_xBricks, 1, 1, 0)).toString(10) + ")", 1));
			if (j == 0 || j == 3 || j == 6)
			{
				bricks[bricks.length-1].colour = CONST_lockedBrickColour;
			}
		}
	}
}


var keysDown = {};

window.addEventListener("keydown",function(e)
{
	keysDown[e.keyCode] = true;
});

window.addEventListener("keyup",function(e)
{
	delete keysDown[e.keyCode];
});

function bounce(bouncePoint)
{
	var maxBounceAngle = Math.PI/3; //60 degrees
	
	//normalises bounce point to give values between -1 and 1
	var normalisedBouncePoint = (bouncePoint/(paddle.width/2)); 
	var bounceAngle = normalisedBouncePoint * maxBounceAngle;
	var ballSpeed = Math.sqrt(Math.pow(ball.xSpeed,2) + Math.pow(ball.ySpeed,2));
		
	ball.xSpeed = ballSpeed*Math.sin(bounceAngle);
	ball.ySpeed = ballSpeed*-Math.cos(bounceAngle);
	console.log("Paddle Collision");
}

function brickHit(brick)
{
	playPop();
	if (brick.colour != CONST_lockedBrickColour)
	{
		ball.colour = brick.colour;
		brick.visible=0;		
		score += 10;
	}		
	else
	{	
		brick.colour = ball.colour;
	}
}

function resetBall()
{
	ball.x = canvas.width / 2; 
	ball.y = (paddle.y - ball.radius) - 1;
	bounce(10);
	paddle.x = (canvas.width/2)-(paddle.width/2)
	console.log("Ball off screen");
	timeScale = 0;
	setTimeout(resetTimescale, 500);	
}

function render() 
{
	//clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//draw the ball
	ctx.fillStyle = ball.colour;
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fill();
	
	//draw the score
	ctx.font = '68px codeproregular';
	ctx.fillStyle = '#727272';
	ctx.textBaseline = 'bottom';
	ctx.textAlign = 'left';
	ctx.fillText('Score: '+score.toString(), 8, window.innerHeight);
	
	//draw the paddle
	ctx.fillStyle = paddle.colour;
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	
	//draw the bricks
	for (var i = 0; i < bricks.length; i++)
	{	
		var localBrick = bricks[i];
		if (localBrick.visible)
		{
			ctx.fillStyle = localBrick.colour;
			ctx.fillRect(localBrick.x, localBrick.y, localBrick.width, localBrick.height);
		}
	}
	
	//draw the game over text
	if(gameOver == 'true')
	{
		ctx.font = '68px codeproregular';
		ctx.fillStyle = '#727272';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillText('Congratulations! You Win!', window.innerWidth/2, window.innerHeight/2 - 20);	
		ctx.font = '34px codeproregular';
		ctx.fillText('Press enter to play again.', window.innerWidth/2, (window.innerHeight/2) + 38);			
	}
	
	//draw the rules
	if(newGame == 'true')
	{
		ctx.font = '68px codeproregular';
		ctx.fillStyle = '#727272';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillText("PaintOut!", window.innerWidth/2, window.innerHeight/2 - 20);
		ctx.font = '34px codeproregular';
		ctx.fillText("Rules: Use the left and right arrow keys to control the paddle.", window.innerWidth/2, window.innerHeight/2 + 38);
		ctx.fillText("Bounce the ball off the paddle to hit bricks and paint your ball. Each", window.innerWidth/2, (window.innerHeight/2) + (38*2));
		ctx.fillText("brick is worth 10 points, but if the ball falls below the paddle you'll", window.innerWidth/2, (window.innerHeight/2) + (38*3));		
		ctx.fillText("lose 100! Grey bricks need to be painted before they can be broken.", window.innerWidth/2, (window.innerHeight/2) + (38*4));
		ctx.fillText("Press enter to release the ball. Good Luck!", window.innerWidth/2, (window.innerHeight/2) + (38*5));	
	}
}

function resetTimescale()
{
	timeScale = 1;
}

function update(elapsed)
{
	if(bricks.length == 0)
	{
		timeScale = 0;
		gameOver = 'true';
	}
	
	//update the Ball position according to the elapsed time
	ball.y += ball.ySpeed * elapsed * timeScale;
	ball.x += ball.xSpeed * elapsed * timeScale;

	//update the paddle position
	if(37 in keysDown) //left arrow key
	{
		if(paddle.x > 0)
			paddle.x -= paddle.xSpeed * elapsed * timeScale;
		else
			paddle.x = 0;
	}
	
	if(39 in keysDown) //right arrow key
	{
		if(paddle.x+paddle.width < window.innerWidth)
			paddle.x += paddle.xSpeed * elapsed * timeScale;
		else
			paddle.x = window.innerWidth - paddle.width;
	}
	
	if(13 in keysDown) //enter key
	{
		if(newGame == 'true')
		{
			newGame = false;
			resetBall();
		}
		if(gameOver == 'true')
		{
			gameOver = false;
			resetBall();
			initBricks();
		}
	}
	
	//bounce the Ball off all edges
	if(ball.x-ball.radius <= 0) //left edge
	{  
		ball.xSpeed *= -1;
		ball.x = 1 +ball.radius;
	}
	if(ball.x+ball.radius >= canvas.width) //right edge
	{
		ball.xSpeed *= -1;
		ball.x = canvas.width -1 -ball.radius;
	}
	if(ball.y-ball.radius <= 0) //top edge
	{
		ball.ySpeed *= -1;
		ball.y = 1 + ball.radius;
	}
	if(ball.y-ball.radius >= canvas.height) //bottom edge
	{
		resetBall();		
		if (score >= 100)
			score -= 100;
		else
			score = 0;

	}
	
	//bounce the Ball off the paddle
	if( ((ball.x + ball.radius >= paddle.x) && (ball.x - ball.radius <= paddle.x+paddle.width)) && ((ball.y+ball.radius >= paddle.y) && (ball.y+ball.radius <= paddle.y+paddle.height)) )
	{
		bounce(((paddle.x + paddle.width / 2) - ball.x)*-1);
		ball.y = paddle.y -1 -ball.radius;
		paddle.colour = ball.colour;
	}
	
	//bounce the Ball off the bricks and disable bricks when they are hit
	for (i = 0; i < bricks.length; i++)
	{
		var localBrick=bricks[i];
		if(localBrick.visible)
		{
			
			if (((ball.x + ball.radius >= localBrick.x) && (ball.x < localBrick.x)) && ((ball.y <= localBrick.y + localBrick.height + ball.radius/2) && (ball.y >= localBrick.y - ball.radius/2)) && ball.xSpeed > 0) //brick left side
			{
				ball.x = localBrick.x - ball.radius -1;
				ball.xSpeed *= -1;
				brickHit(localBrick);
			}
			else if (((ball.y - ball.radius <= localBrick.y + localBrick.height) && (ball.y >= localBrick.y)) && ((ball.x <= localBrick.x + localBrick.width + ball.radius/2) && (ball.x >= localBrick.x - ball.radius/2)) && ball.ySpeed < 0) //brick bottom side
			{
				ball.y = localBrick.y + localBrick.height + ball.radius + 1;
				ball.ySpeed *= -1;
				brickHit(localBrick);
			}
			
			else if (((ball.x - ball.radius <= localBrick.x + localBrick.width) && (ball.x > localBrick.x + localBrick.width)) && ((ball.y >= localBrick.y - ball.radius/2) && (ball.y <= localBrick.y + localBrick.height + ball.radius/2)) && ball.xSpeed < 0) //brick right side
			{
				ball.x = localBrick.x + localBrick.width + ball.radius +1;
				ball.xSpeed *= -1;
				brickHit(localBrick);
			}
			
			else if (((ball.y + ball.radius >= localBrick.y) && (ball.y <= localBrick.y)) && ((ball.x <= localBrick.x + localBrick.width + ball.radius/2) && (ball.x >= localBrick.x - ball.radius/2)) && ball.ySpeed > 0) //brick top side
			{
				ball.y = localBrick.y - ball.radius - 1;
				ball.ySpeed *= -1;
				brickHit(localBrick);							
			}
		}
	}
	
	//remove disabled bricks
	
	for (i = 0; i < bricks.length; i++)
	{
		if (bricks[i].visible == 0)
		{
			bricks.splice(i, 1);
		}
	}
	
}

var previous;

function run(timestamp)
{
	if (!bricksInitd)
	{
		initBricks();
		bricksInitd = 1;
	} 
	if (!previous) previous = timestamp; //start with no elapsed time
	var elapsed = (timestamp - previous) / 1000; //work out the elapsed time
	update(elapsed); //update the game with the elapsed time
	render(); //render the scene
	previous = timestamp; //set the (globally defined) previous timestamp ready for next time
	window.requestAnimationFrame(run); //ask browser to call this function again, when it's ready
}

//trigger the game loop
window.requestAnimationFrame(run);
