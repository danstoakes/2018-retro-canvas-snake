/*
 * A canvas-based implementation of the classic arcade game, Snake. This implementation
 * features two modes: classic and remastered, as well as pause functionality.
 */

constants = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 400,
    DRAW_SPEED: 100,
    START_LENGTH: 5,
    MODE_CLASSIC: "Classic",
    MODE_REMASTERED: "Remastered"
}

directions = {
    left: 1,
    up: 2,
    right: 3,
    down: 4,
    still: 5
};

game = {
    mode: constants.MODE_CLASSIC,
    started: false,
    moved: false,
    paused: false,
    dead: false,
    displayMenu: true,
    squareSize: constants.CANVAS_WIDTH / 20,
    length: constants.START_LENGTH,
    x: 10,
    y: 10,
    xVelocity: 0,
    yVelocity: 0,
    foodX: 12,
    foodY: 12,
    trail: [],
    timeIntervals: [],
    colour: "green",
    direction: directions.still
};

/**
 * Function that is called when the initial HTML document has been completely loaded.
 */
document.addEventListener("DOMContentLoaded", function ()
{
    var canvas = document.getElementById("canvas");
    canvas.width = constants.CANVAS_WIDTH;
    canvas.height = constants.CANVAS_HEIGHT;

    /**
    * Function that is called when the user clicks the mouse.
    * @param event - the click event.
    */
    canvas.addEventListener("mousedown", function (event)
    {
        if (game.started)
        {
            // pause the game if it is still running
            if (!game.dead)
                pause(canvas, context);
        } else
        {
            var clickCoordinates = getClickCoordinates(canvas, event);
            // if the menu should be displayed
            if (game.displayMenu)
            {
                var playButton = {
                    width: 200,
                    height: 100,
                    x: (canvas.width / 2) - (200 / 2),
                    y: (canvas.width / 1.25) - (100 / 1.25)
                };
                // draw the mode buttons if the user has clicked the "Play" button
                if (isWithinButtonBounds(clickCoordinates, playButton))
                {
                    game.displayMenu = false;
                    drawModeButtons(canvas, canvas.getContext("2d"));
                }
            } else
            {
                var classicButton = {
                    width: 100,
                    height: 50,
                    x: (canvas.width / 10),
                    y: (canvas.height / 1.25) - (50 / 1.25)
                };
                var remasteredButton = {
                    width: 100,
                    height: 50,
                    x: canvas.width - (100 + (canvas.width / 10)),
                    y: (canvas.height / 1.25) - (50 / 1.25)
                };
                // if the user has clicked either of the mode buttons
                if (isWithinButtonBounds(clickCoordinates, classicButton) || isWithinButtonBounds(clickCoordinates, remasteredButton))
                {
                    if (isWithinButtonBounds(clickCoordinates, classicButton))
                    {
                        game.mode = constants.MODE_CLASSIC;
                    } else if (isWithinButtonBounds(clickCoordinates, remasteredButton))
                    {
                        game.mode = constants.MODE_REMASTERED;
                    }
                    // reset the variables if the player died previously
                    if (game.dead)
                    {
                        game.dead = false;
                        game.moved = false;
                        game.x = 10;
                        game.y = 10;
                        game.xVelocity = 0;
                        game.yVelocity = 0;
                        game.timeIntervals.push(setInterval(play, constants.DRAW_SPEED, canvas, context));
                    }
                    game.started = true;
                }
            }
        }
    });
    // get the canvas context and use it to colour the canvas black
    var context = canvas.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    /**
    * Function that is called when the user presses a key.
    * @param event - the key press event.
    */
    document.addEventListener("keydown", function (event)
    {
        // only set the moved variable if the user has moved
        if (game.direction != directions.still)
            game.moved = true;

        switch (event.keyCode)
        {
            case 32:
                // space pressed: pause the game if it is valid
                if (game.started)
                {
                    if (!game.dead)
                    {
                        pause(canvas, context);
                    } else
                    {
                        drawPlayButton(canvas, context);
                    }
                }
                break;
            case 37:
                // left pressed: move the snake left if not moving oppositely
                if (game.direction != directions.right)
                {
                    game.direction = directions.left;
                    game.xVelocity = -1;
                    game.yVelocity = 0;
                }
                break;
            case 38:
                // up pressed: move the snake up if not moving oppositely
                if (game.direction != directions.down)
                {
                    game.direction = directions.up;
                    game.xVelocity = 0;
                    game.yVelocity = -1;
                }
                break;
            case 39:
                // right pressed: move the snake right if not moving oppositely
                if (game.direction != directions.left)
                {
                    game.direction = directions.right;
                    game.xVelocity = 1;
                    game.yVelocity = 0;
                }
                break;
            case 40:
                // down pressed: move the snake down if not moving oppositely
                if (game.direction != directions.up)
                {
                    game.direction = directions.down;
                    game.xVelocity = 0;
                    game.yVelocity = 1;
                }
                break;
        }
    });
    // draw the play button and start the game
    drawPlayButton(canvas, context);
    game.timeIntervals.push(setInterval(play, constants.DRAW_SPEED, canvas, context));
});

/**
 * Function that draws the play button on the canvas.
 * @param canvas - the canvas to draw upon.
 * @param context - the context of the canvas.
 */
function drawPlayButton(canvas, context)
{
    var width = 200,
        height = 100;
    // draw the background colour
    context.fillStyle = "#57a82f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw the Snake logo
    context.font = "60px Courier New";
    context.fillStyle = "green";
    context.fillText("Snake", (canvas.width / 2) - ((18 * ("Snake").length)), canvas.height / 3);
    // draw the Play button
    context.font = "30px Courier New";
    context.lineWidth = "6";
    context.fillStyle = "green";
    context.fillRect((canvas.width / 2) - (width / 2), (canvas.height / 1.25) - (height / 1.25), width, height);
    context.fillStyle = "white";
    context.fillText("Play", (canvas.width / 2) - 40, (canvas.height / 1.25) - game.squareSize);
}

/**
 * Function that draws the mode buttons on the canvas.
 * @param canvas - the canvas to draw upon.
 * @param context - the context of the canvas.
 */
function drawModeButtons(canvas, context)
{
    var width = 100,
        height = 50;
    // draw the background colour
    context.fillStyle = "#57a82f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw the Snake logo
    context.font = "60px Courier New";
    context.fillStyle = "green";
    context.fillText("Snake", (canvas.width / 2) - ((18 * ("Snake").length)), canvas.height / 3);
    // daw the header for choosing a mode
    context.font = "40px Courier New";
    context.fillStyle = "green";
    context.fillText("Select a mode", (canvas.width / 2) - ((12 * ("Select a mode").length)), canvas.height / 2);
    // draw the mode buttons
    context.fillStyle = "green";
    context.fillRect(canvas.width / 10, (canvas.height / 1.25) - (height / 1.25), width, height);
    context.fillRect(canvas.width - (width + (canvas.width / 10)), (canvas.height / 1.25) - (height / 1.25), width, height);
    context.font = "20px Courier New";
    context.fillStyle = "white";
    context.fillText("Classic", (canvas.width / 10) + 5, (canvas.height / 1.25) - 10);
    context.fillText("Remaster", (canvas.width - (width + (canvas.width / 10))) + 2.5, (canvas.height / 1.25) - 10);
}

/**
 * Function that draws the "Paused" annotation on the canvas.
 * @param canvas - the canvas to draw upon.
 * @param context - the context of the canvas.
 * @param oldFont - the original font.
 */
function drawPauseText(canvas, context, oldFont)
{
    context.font = "40px Courier New";
    context.fillStyle = game.colour;
    context.fillText("Paused", (canvas.width / 2) - (12 * ("Paused").length), (canvas.height / 2) + (game.squareSize / 2));
    context.font = oldFont;
}

/*
 * Function that plays a sound when the snake eats a snack.
 */
function playEatSound()
{
    document.getElementById("eatSound").play();
}

/*
 * Function that plays a sound when the snake dies.
 */
function playDieSound()
{
    document.getElementById("dieSound").play();
}

/**
 * Function that determines whether a click position is within a button's bounds.
 * @param position - the coordinates of the click as a tuple.
 * @param button - the button dimensions and attributes as an object.
 * @return boolean - whether the click position is within a button's bounds.
 */
function isWithinButtonBounds(position, button)
{
    return position.x > button.x && position.x < button.x + button.width &&
        position.y < button.y + button.height && position.y > button.y;
}

/**
 * Function that returns the coordinates from a click performed by the user.
 * @param canvas - the canvas to draw upon.
 * @param event - the click event.
 */
function getClickCoordinates(canvas, event)
{
    return {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop
    };
}

/**
 * Function that updates the canvas frame by redrawing it.
 * @param canvas - the canvas to draw upon.
 * @param context - the context of the canvas.
 */
function updateFrame(canvas, context)
{
    // adjust positioning depending on if the snake length has an even number of characters
    var x = canvas.width - ((4 + game.length.toString().length) * game.squareSize);
    if (game.length.toString().length % 2 == 0)
        x = canvas.width - ((3.5 + game.length.toString().length) * game.squareSize);
    // draw the background colour
    context.fillStyle = "#57a82f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw the border
    context.fillStyle = "black";
    for (var i = 0; i < canvas.width; i += game.squareSize)
    {
        context.fillRect(i, 0, game.squareSize, game.squareSize);
        context.fillRect(i, canvas.height - game.squareSize, game.squareSize, game.squareSize);
        context.fillRect(0, i, game.squareSize, game.squareSize);
        context.fillRect(canvas.width - game.squareSize, i, game.squareSize, game.squareSize);
    }
    // draw the border annotations
    context.fillStyle = game.colour;
    context.font = "20px Courier New";
    if (game.paused)
    {
        drawPauseText(canvas, context, context.font);
        context.fillText("Paused", 5, canvas.height - 5);
    } else if (game.dead)
    {
        context.fillText("Dead", 5, canvas.height - 5);
    } else
    {
        context.fillText(game.mode, 5, canvas.height - 5);
    }
    context.fillText("Length:" + game.length, x, canvas.height - 5);
}

/**
 * Function that handles snake movement, growth, and collision detection.
 * @param canvas - the canvas to draw upon.
 * @param context - the context of the canvas.
 */
function play(canvas, context)
{
    if (game.started)
    {
        // increment the snake position with its directional velocity
        game.x += game.xVelocity;
        game.y += game.yVelocity;
        // check if the snake has hit any of the boundaries in x
        if (game.x < 1)
        {
            if (game.mode == constants.MODE_REMASTERED)
            {
                // place the snake at the opposite end of the canvas in x
                game.x = game.squareSize - 2;
            } else
            {
                end();
            }
        } else if (game.x > (game.squareSize - 2))
        {
            // the snake has hit the right hand side of the canvas
            if (game.mode == constants.MODE_REMASTERED)
            {
                game.x = 1;
            } else
            {
                end();
            }
        }
        // check if the snake has hit any of the boundaries in y
        if (game.y < 1)
        {
            if (game.mode == constants.MODE_REMASTERED)
            {
                // place the snake at the opposite end of the canvas in y
                game.y = game.squareSize - 2;
            } else
            {
                end();
            }
        } else if (game.y > (game.squareSize - 2))
        {
            // the snake has hit the bittom of the canvas
            if (game.mode == constants.MODE_REMASTERED)
            {
                game.y = 1;
            } else
            {
                end();
            }
        }

        updateFrame(canvas, context);

        for (var i = 0; i < game.trail.length; i++)
        {
            // draw the snake
            context.fillRect(game.trail[i].x * game.squareSize, game.trail[i].y * game.squareSize,
                game.squareSize - 2, game.squareSize - 2);
            // check if the snake is moving onto itself
            if (game.trail[i].x == game.x && game.trail[i].y == game.y)
            {
                if (game.started && game.moved)
                {
                    end();
                    updateFrame(canvas, context);
                }
            }
        }
        // add the current position to the snake
        game.trail.push({
            x: game.x,
            y: game.y
        });

        while (game.trail.length > game.length)
            game.trail.shift();
        // check if the snake has hit any of the food
        if (game.x == game.foodX && game.y == game.foodY)
        {
            playEatSound();
            game.length++;

            game.foodX = Math.floor(Math.random() * (game.squareSize - 2)) + 1;
            game.foodY = Math.floor(Math.random() * (game.squareSize - 2)) + 1;
            // loop until the apple has spawned in a unique position (no overlap)
            var overlap = true;
            while (overlap)
            {
                // loop through each part of the snake's body
                for (var i = 0; i < game.trail.length; i++)
                {
                    if (game.trail[i].x == game.foodX && game.trail[i].y == game.foodY)
                    {
                        // overlap occurred, so recalculate the positions
                        overlap = true;
                        game.foodX = Math.floor(Math.random() * (game.squareSize - 2)) + 1;
                        game.foodY = Math.floor(Math.random() * (game.squareSize - 2)) + 1;
                    } else
                    {
                        // no overlap occurred, so move on
                        if (i == game.trail.length - 1)
                            overlap = false;
                    }
                }
            }
        }
        // draw the apple
        context.fillStyle = "red";
        context.beginPath();
        context.arc((game.foodX * game.squareSize) + game.squareSize / 2,
            (game.foodY * game.squareSize) + game.squareSize / 2, game.squareSize / 2, 0, 2 * Math.PI);
        context.fill();

        if (game.dead)
        {
            // reset the game
            game.length = 5;
            setTimeout(drawModeButtons, 2000, canvas, context);
        }
    }
}

/**
 * Function that handles pausing the game.
 * @param canvas - the canvas to draw upon.
 * @param context - the context of the canvas.
 */
function pause(canvas, context)
{
    if (game.timeIntervals.length == 0)
    {
        // unpause the game if it is already paused
        game.paused = false;
        game.timeIntervals.push(setInterval(play, constants.DRAW_SPEED, canvas, context));
    } else
    {
        // pause the game if it is not already paused
        game.paused = true;
        for (var i = 0; i < game.timeIntervals.length; i++)
            window.clearInterval(game.timeIntervals[i]);
        game.timeIntervals.length = 0;
    }
    updateFrame(canvas, context);
}

/**
 * Function that handles ending the game/the player losing.
 */
function end()
{
    // play the death sound and reset the variables
    playDieSound();
    game.dead = true;
    game.started = false;
    game.direction = directions.still;
    // clear all refresh intervals and end the game
    for (var i = 0; i < game.timeIntervals.length; i++)
        window.clearInterval(game.timeIntervals[i]);
    game.timeIntervals.length = 0;
}