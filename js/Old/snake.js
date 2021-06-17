/* Title: Snake
 * Author: Dan Stoakes
 * Version: 1.0.6
*/

class SnakeGame {

	constructor () {
		this.canvas = document.getElementById("canvas");
		this.context = this.canvas.getContext("2d");

		this.settings = {
			constants: {
				SQUARE_SIZE: 20,
				GAME_SPEED: 100,
				DEFAULT_LENGTH: 5,
				SNAKE_COLOUR: "green",
				BORDER_COLOUR: "black",
				BACK_COLOUR: "#57a82f"
			},
			properties: {
				mode: "classic",
				direction: "",
				started: false,
				moved: false,
				paused: false,
				menuscreen: true,
				timeIntervals: [],
				trail: []
			}
		};

		this.game = {
			snake: {
				x: 10,
				y: 10,
				xv: 0,
				yv: 0,
				length: 5,
				dead: false
			},
			food: {
				ax: 5,
				ay: 5
			}
		}

		this.graphics = {
			playButton: {
				width: 200,
				height: 100,
				x: (this.canvas.width / 2) - 50,
				y: (this.canvas.height / 2) + 160
			},
			classicButton: {
				width: 100,
				height: 50,
				x: (this.canvas.width / 10) + 10,
				y: (this.canvas.height / 2) + 200
			},
			remasteredButton: {
				width: 100,
				height: 50,
				x: this.canvas.width - 50,
				y: (this.canvas.height / 2) + 200
			}
		}

		this.init();
	}

	init () {
		this.canvas.height = 400;
		this.canvas.width = 400;

		this.clear();
		this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
		document.addEventListener("keydown", this.keyDown.bind(this));
		this.showPlayButton();
	}

	play () {
		if (this.settings.properties.started) {
			// increase relative positions according to current direction speed
			this.game.snake.x += this.game.snake.xv;
			this.game.snake.y += this.game.snake.yv;

			// check if the user has hit any of the boundaries for x
			if (this.game.snake.x < 1) {
				if (this.settings.properties.mode != "classic") {
					// place the snake at the opposite end
					this.game.snake.x = this.settings.constants.SQUARE_SIZE - 2;
				} else {
					this.end();
				}
			}
			if (this.game.snake.x > this.settings.constants.SQUARE_SIZE - 2) {
				if (this.settings.properties.mode != "classic") {
					this.game.snake.x = 1;
				} else {
					this.end();
				}
			}

			// check if the user has hit any of the boundaries for y
			if (this.game.snake.y < 1) {
				if (this.settings.properties.mode != "classic") {
					this.game.snake.y = this.settings.constants.SQUARE_SIZE - 2;
				} else {
					this.end();
				}
			}
			if (this.game.snake.y > this.settings.constants.SQUARE_SIZE - 2) {
				if (this.settings.properties.mode != "classic") {
					this.game.snake.y = 1;
				} else {
					this.end();
				}
			}

			// update the current canvas visuals
			this.showUpdatedFrame();

			var squareSize = this.settings.constants.SQUARE_SIZE;

			for (var i = 0; i < this.settings.properties.trail.length; i++) {
				// draw the snake
				this.context.fillRect(this.settings.properties.trail[i].x * squareSize, this.settings.properties.trail[i].y * squareSize, squareSize - 2, squareSize - 2);
				// check if the snake is moving onto itself
				if (this.settings.properties.trail[i].x == this.game.snake.x && this.settings.properties.trail[i].y == this.game.snake.y) {
					if (this.settings.properties.started && this.settings.properties.moved) {
						this.end();
						this.showUpdatedFrame();
					}
				}
			}
			// add current positions to the snake
			this.settings.properties.trail.push ({
				x: this.game.snake.x,
				y: this.game.snake.y
			});

			while (this.settings.properties.trail.length > this.game.snake.length) {
				this.settings.properties.trail.shift();
			}
			// check if the snake has hit any food
			if (this.game.snake.x == this.game.food.ax && this.game.snake.y == this.game.food.ay) {
				this.playSound("sound/EatSound.mp3");
				this.game.snake.length++;
				this.game.food.ax = Math.floor(Math.random() * (squareSize - 2)) + 1;
				this.game.food.ay = Math.floor(Math.random() * (squareSize - 2)) + 1;

				// check if the apple has possibly spawned on the snake and redraw
				for (var i = 0; i < this.settings.properties.trail.length; i++) {
					if (this.settings.properties.trail[i].x == this.game.food.ax && this.settings.properties.trail[i].y == this.game.food.y) {
						this.game.food.ax = Math.floor(Math.random() * (squareSize - 2)) + 1;
						this.game.food.ay = Math.floor(Math.random() * (squareSize - 2)) + 1;
					}
				}
			}
			// draw the apple
			this.context.fillStyle = "red";
			this.context.beginPath();
			this.context.arc((this.game.food.ax * squareSize) + squareSize / 2, (this.game.food.ay * squareSize) + squareSize / 2, squareSize / 2, 0, 2 * Math.PI);
			this.context.fill();

			if (this.game.snake.dead) {
				this.game.snake.length = this.settings.constants.DEFAULT_LENGTH;
				// allow for user to see how and where they died by waiting before updating
				setTimeout(this.showPlayOptions.bind(this), 2000);
			}
		}
	}

	pause () {
		if (this.settings.properties.timeIntervals.length == 0) {
			// unpause if paused
			this.settings.properties.paused = false;
			this.settings.properties.timeIntervals.push(setInterval(this.play.bind(this), this.settings.constants.GAME_SPEED));
		} else {
			// pause if not paused
			this.settings.properties.paused = true;
			for (var i = 0; i < this.settings.properties.timeIntervals.length; i++) {
				window.clearInterval(this.settings.properties.timeIntervals[i]);
			}
			this.settings.properties.timeIntervals.length = 0;
		}
		this.showUpdatedFrame();
	}

	end () {
		this.playSound("sound/DieSound.mp3");
		this.game.snake.dead = true;
		this.settings.properties.started = false;
		// clear all refresh intervals and end the game
		for (var i = 0; i < this.settings.properties.timeIntervals.length; i++) {
			window.clearInterval(this.settings.properties.timeIntervals[i]);
		}
		this.settings.properties.timeIntervals.length = 0;
		this.settings.properties.direction = "";
	}

	showLogo () {
		this.clear();

		this.context.font = "60px Courier New";
		this.context.fillStyle = this.settings.constants.SNAKE_COLOUR;
		this.context.fillText("Snake", (this.canvas.width / 2) - (18 * ("Snake").length), this.canvas.height / 3);
	}

	showPlayButton () {
		this.showLogo();

		this.context.font = "30px Courier New";
		this.context.fillStyle = this.settings.constants.SNAKE_COLOUR;
		this.context.fillRect((this.canvas.width / 2) - (this.graphics.playButton.width / 2), (this.canvas.height / 1.25) - (this.graphics.playButton.height / 1.25), this.graphics.playButton.width, this.graphics.playButton.height);
		this.context.fillStyle = "white";
		this.context.fillText("Play", (this.canvas.width / 2) - 40, (this.canvas.height / 1.25) - 20);
	}

	showPlayOptions () {
		this.showLogo();

		this.context.font = "40px Courier New";
		this.context.fillStyle = this.settings.constants.SNAKE_COLOUR;
		this.context.fillText("Select a mode", (this.canvas.width / 2) - ((12 * ("Select a mode").length)), this.canvas.height / 2);

		this.context.fillRect(this.canvas.width / 10, (this.canvas.height / 1.25) - (this.graphics.classicButton.height / 1.25), this.graphics.classicButton.width, this.graphics.classicButton.height);
		this.context.fillRect(this.canvas.width - (this.graphics.remasteredButton.width + (this.canvas.width / 10)), (this.canvas.height / 1.25) - (this.graphics.remasteredButton.height / 1.25), this.graphics.remasteredButton.width, this.graphics.remasteredButton.height);
		this.context.font = "20px Courier New";
		this.context.fillStyle = "white";
		this.context.fillText("Classic", (this.canvas.width / 10) + 5, (this.canvas.height / 1.25) - 10);
		this.context.fillText("Remaster", (this.canvas.width - (this.graphics.remasteredButton.width + (this.canvas.width / 10))) + 2.5, (this.canvas.height / 1.25) - 10);
	}

	showPause(text, font) {
		this.context.font = "40px Courier New";
		this.context.fillStyle = this.settings.constants.SNAKE_COLOUR;
		this.context.fillText(text, (this.canvas.width / 2) - (12 * (text).length), (this.canvas.height / 2) + 20);
		this.context.font = font;
	}

	showUpdatedFrame() {
		// adjust positioning (see below) depending on if the number has an even number of characters or not
		if (this.game.snake.length.toString().length % 2 == 0) {
			var x = (this.canvas.width - ((3.5 + this.game.snake.length.toString().length) * this.settings.constants.SQUARE_SIZE));
		} else {
			var x = (this.canvas.width - ((4 + this.game.snake.length.toString().length) * this.settings.constants.SQUARE_SIZE));
		}
		// clear the canvas
		this.clear();
		// allow for the drawing of the border
		this.context.fillStyle = this.settings.constants.BORDER_COLOUR;

		for (var i = 0; i < this.canvas.width; i += 20) {
			this.context.fillRect(i, 0, 20, 20);
			this.context.fillRect(i, this.canvas.height - this.settings.constants.SQUARE_SIZE, 20, 20);
			this.context.fillRect(0, i, 20, 20);
			this.context.fillRect(this.canvas.width - this.settings.constants.SQUARE_SIZE, i, 20, 20);
		}

		this.context.fillStyle = this.settings.constants.SNAKE_COLOUR;
		this.context.font = "20px Courier New";
		// write all relevant labelling on top of the borders
		if (this.settings.properties.paused) {
			this.showPause("Paused", "20px Courier New");
			this.context.fillText("Paused", 5, this.canvas.height - 5);
		} else if (this.game.snake.dead) {
			this.context.fillText("Dead", 5, this.canvas.height - 5);
		} else {
			this.context.fillText(this.settings.properties.mode.charAt(0).toUpperCase() + this.settings.properties.mode.slice(1), 5, this.canvas.height - 5);
		}

		this.context.fillText("Length:" + this.game.snake.length, x, this.canvas.height - 5);
	}

	mouseDown (e) {
		// check if the game has began and pause if so
		if (this.settings.properties.started) {
			// stop users from cheating death
			if (!this.settings.properties.dead) {
				this.pause();
			}
		} else {
			var clickCoordinates = this.getClickCoordinates(e);

			if (this.settings.properties.menuscreen) {
				// check if play button is pressed on main menu
				if (this.checkIfInBounds(clickCoordinates, this.graphics.playButton)) {
					this.settings.properties.menuscreen = false;
					this.showPlayOptions();
				}
			} else {
				// now on options screen and checking if either option button is clicked
				if (this.checkIfInBounds(clickCoordinates, this.graphics.classicButton) || this.checkIfInBounds(clickCoordinates, this.graphics.remasteredButton)) {
					if (this.checkIfInBounds(clickCoordinates, this.graphics.classicButton)) {
						this.settings.properties.mode = "classic";
					} else {
						this.settings.properties.mode = "remastered";
					}
					// check if the user has died while the timeIntervals loop is running and terminate
					if (this.game.snake.dead) {
						this.game.snake.dead = false;
						this.settings.properties.moved = false;
						this.game.snake.x = 10;
						this.game.snake.y = 10;
						this.game.snake.xv = 0;
						this.game.snake.yv = 0;
					}
					// if not dead, start the game
					this.settings.properties.timeIntervals.push(setInterval(this.play.bind(this), this.settings.constants.GAME_SPEED));
					this.settings.properties.started = true;
				}
			}
		}
	}

	keyDown (e) {
		// ensures pausing before moving by spacebar does not cause death
		if (e.keyCode != 32) {
			this.settings.properties.moved = true;
		}

		switch (e.keyCode) {
			case 32:
				// the "space" key was pressed
				if (this.settings.properties.started) {
					if (!this.game.snake.dead) {
						this.pause();
					} else {
						this.showPlayButton();
					}
				}
				break;
			case 37:
				// the "up" arrow key was pressed
				if (this.settings.properties.direction != "right") {
					this.settings.properties.direction = "left";
					this.game.snake.xv = -1;
					this.game.snake.yv = 0;
				}
				break;
			case 38:
				// the "left" arrow key was pressed
				if (this.settings.properties.direction != "down") {
					this.settings.properties.direction = "up";
					this.game.snake.xv = 0;
					this.game.snake.yv = -1;
				}
				break;
			case 39:
				// the "right" arrow key was pressed
				if (this.settings.properties.direction != "left") {
					this.settings.properties.direction = "right";
					this.game.snake.xv = 1;
					this.game.snake.yv = 0;
				}
				break;
			case 40:
				// the "down" arrow key was pressed
				if (this.settings.properties.direction != "up") {
					this.settings.properties.direction = "down";
					this.game.snake.xv = 0;
					this.game.snake.yv = 1;
				}
				break;
		}
	}

	getClickCoordinates (e) {
		var x, y;

		// x, y are relative to the canvas element, rather than the window
		x = e.pageX - this.canvas.offsetLeft;
		y = e.pageY - this.canvas.offsetTop;

		return {
			x: x,
			y: y
		};
	}

	checkIfInBounds (position, button) {
		return position.x > button.x && position.x < button.x + button.width && position.y < button.y + button.height && position.y > button.y;
	}

	playSound (src) {
		var sound = document.createElement("audio");

		sound.src = src;
		sound.setAttribute("preload", "auto");
		sound.setAttribute("controls", "none");
		sound.style.display = "none";
		document.body.append(sound);

		sound.play();
	}

	clear () {
		// cover the canvas in a rectangle of desired background colour
		this.context.fillStyle = this.settings.constants.BACK_COLOUR;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

const snakeGame = new SnakeGame();