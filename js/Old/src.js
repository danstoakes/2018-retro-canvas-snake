document.addEventListener("DOMContentLoaded", function () {
	var started = false,
		mode = "Classic",
		squaresize = 20,
		difficulty = 100,
		x = y = 10,
		ax = Math.floor(Math.random() * (squaresize - 2)) + 1,
		ay = Math.floor(Math.random() * (squaresize - 2)) + 1,
		xv = yv = 0,
		length = 5,
		dead = moved = paused = false,
		direction = "",
		colour = "green",
		timeIntervals = [],
		trail = [],
		canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		menuscreen = true,
		eatSound = new playSound("sound/EatSound.mp3"),
		dieSound = new playSound("sound/DieSound.mp3");
		
	canvas.width = 400;
	canvas.height = 400;
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	function generatePlayButton () {
		var width = 200,
			height = 100;
		
		context.fillStyle = "#57a82f";
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		context.font = "60px Courier New";
		context.fillStyle = "green";
		context.fillText("Snake", (canvas.width / 2) - ((18 * ("Snake").length)), canvas.height / 3);
		
		context.font = "30px Courier New";
		context.lineWidth = "6";
		context.fillStyle = "green";
		context.fillRect((canvas.width / 2) - (width / 2), (canvas.height / 1.25) - (height / 1.25), width, height);
		context.fillStyle = "white";
		context.fillText("Play", (canvas.width / 2) - 40, (canvas.height / 1.25) - 20);
	}
	
	function generatePlayModes () {
		var width  = 100,
			height = 50;
		
		context.fillStyle = "#57a82f";
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		context.font = "60px Courier New";
		context.fillStyle = "green";
		context.fillText("Snake", (canvas.width / 2) - ((18 * ("Snake").length)), canvas.height / 3);
		
		context.font = "40px Courier New";
		context.fillStyle = "green";
		context.fillText("Select a mode", (canvas.width / 2) - ((12 * ("Select a mode").length)), canvas.height / 2);
		
		context.fillStyle = "green";
		context.fillRect(canvas.width / 10, (canvas.height / 1.25) - (height / 1.25), width, height);
		context.fillRect(canvas.width - (width + (canvas.width / 10)), (canvas.height / 1.25) - (height / 1.25), width, height);
		context.font = "20px Courier New";
		context.fillStyle = "white";
		context.fillText("Classic", (canvas.width / 10) + 5, (canvas.height / 1.25) - 10);
		context.fillText("Remaster", (canvas.width - (width + (canvas.width / 10))) + 2.5, (canvas.height / 1.25) - 10);
	}
	
	function updateFrame (length) {
		var x;
		
		if (length.toString().length % 2 == 0) {
			x = (canvas.width - ((3.5 + length.toString().length)  * squaresize));
		} else {
			x = (canvas.width - ((4 + length.toString().length)  * squaresize));
		}
		
		context.fillStyle = "#57a82f";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "black";
		for (var i = 0; i < canvas.width; i+=20) {
			context.fillRect(i, 0, 20, 20);
			context.fillRect(i, canvas.height - squaresize, 20, 20);
			context.fillRect(0, i, 20, 20);
			context.fillRect(canvas.width - squaresize, i, 20, 20);
		}
		context.fillStyle = colour;
		context.font = "20px Courier New";
		if (paused) {
			context.fillText("Paused", 5, canvas.height - 5);
		} else if (dead) {
			context.fillText("Dead", 5, canvas.height - 5);
		} else {
			context.fillText(mode, 5, canvas.height - 5);
		}
		context.fillText("Length:" + length, x, canvas.height - 5);
	}
		
	function getClickCoordinates (e) {
		var x, y;
		
		x = e.pageX - canvas.offsetLeft;
		y = e.pageY - canvas.offsetTop;
		
		return {
			x: x,
			y: y
		};
	}
	
	function checkIfInBounds (position, button) {
		return position.x > button.x && position.x < button.x + button.width && position.y < button.y + button.height && position.y > button.y;
	}
	
	var button = {
		width: 200,
		height: 100,
		x: (canvas.width / 2) - (200 / 2), // using width and heights of object
		y: (canvas.width / 1.25) - (100 / 1.25)
	};
	
	var classic = {
		width: 100,
		height: 50,
		x: (canvas.width / 10),
		y: (canvas.height / 1.25) - (50 / 1.25)
	};
	
	var remaster = {
		width: 100,
		height: 50,
		x: canvas.width - (100 + (canvas.width / 10)),
		y: (canvas.height / 1.25) - (50 / 1.25)
	};
	
	canvas.addEventListener("mousedown", function (e) {
		if (started) {
			if (!dead) {
				pause();
			}
		} else {
			var clickCoordinates = getClickCoordinates(e);
			
			if (menuscreen) {
				if (checkIfInBounds(clickCoordinates, button)) {
					menuscreen = false;
					generatePlayModes();
				}
			} else {
				if (checkIfInBounds(clickCoordinates, classic) || checkIfInBounds(clickCoordinates, remaster)) {
					if (checkIfInBounds(clickCoordinates, classic)) {
						mode = "Classic";
					} else {
						mode = "Remastered";
					}
					if (dead) {
						dead = moved = false;
						x = y = 10;
						xv = yv = 0;
						timeIntervals.push(setInterval(play, difficulty));
					}
					started = true;
				}
			}
		}
	});
	document.addEventListener("keydown", function (e) {
		moved = true;
		
		switch (e.keyCode) {
			case 32:
				if (started) {
					if (!dead) {
						pause();
					} else {
						generatePlayButton();
					}
				}
				break;
			case 37:
				if (direction != "right") {
					direction = "left";
					xv = -1;
					yv = 0;
				}
				break;
			case 38:
				if (direction != "down") {
					direction = "up";
					xv = 0;
					yv = -1;
				}
				break;
			case 39:
				if (direction != "left") {
					direction = "right";
					xv = 1;
					yv = 0;
				}
				break;
			case 40:
				if (direction != "up") {
					direction = "down";
					xv = 0;
					yv = 1;
				}
				break;
		}
	});
	timeIntervals.push(setInterval(play, difficulty));
	
	function play () {
		if (started) {
			
			x += xv;
			y += yv;
			
			if (x < 1) {
				if (mode != "Classic") {
					x = squaresize - 2; // possible node for error
				} else {
					end();
				}
			}
			if (x > (squaresize - 2)) {
				if (mode != "Classic") {
					x = 1;
				} else {
					end();
				}
			}
			if (y < 1) {
				if (mode != "Classic") {
					y = squaresize - 2;
				} else {
					end();
				}
			}
			if (y > (squaresize - 2)) { // 2 to account for the fact of borders
				if (mode != "Classic") {
					y = 1;
				} else {
					end();
				}
			}
			
			updateFrame(length);
			
			for (var i = 0; i < trail.length; i++) {
				if (i !== (trail.length - 1)) {
					context.fillRect(trail[i].x * squaresize, trail[i].y * squaresize, squaresize - 2, squaresize - 2);
				} else {
					context.fillRect(trail[i].x * squaresize, trail[i].y * squaresize, squaresize - 2, squaresize - 2);
				}
				
				if (trail[i].x == x && trail[i].y == y) {
					if (started && moved) {
						end();
						updateFrame(length);
					}
				}
			}
			
			trail.push({
				x: x,
				y: y
			});
			
			while (trail.length > length) {
				trail.shift();
			}
			
			if (x == ax && y == ay) {
				eatSound.play();
				length++;
				ax = Math.floor(Math.random() * (squaresize - 2)) + 1;
				ay = Math.floor(Math.random() * (squaresize - 2)) + 1;
				
				for (var i = 0; i < trail.length; i++) {
					if (trail[i].x == ax && trail[i].y == ay) {
						ax = Math.floor(Math.random() * (squaresize - 2)) + 1;
						ay = Math.floor(Math.random() * (squaresize - 2)) + 1;
					}
				}
			}
			
			context.fillStyle = "red";
			context.beginPath();
			context.arc((ax * squaresize) + squaresize / 2, (ay * squaresize) + squaresize / 2, squaresize / 2, 0, 2 * Math.PI);
			context.fill();
			
			if (dead) {
				length = 5;
				
				setTimeout(generatePlayModes, 2000);
			}
		}
	}
	
	function pause() {
		if (timeIntervals.length == 0) {
			paused = false;
			timeIntervals.push(setInterval(play, difficulty));
		} else {
			paused = true;
			for (var i = 0; i < timeIntervals.length; i++) {
				window.clearInterval(timeIntervals[i]);
			}
			timeIntervals.length = 0;
		}
		updateFrame(length);
	}
	
	function end() {
		dieSound.play();
		dead = true;
		started = false;
		for (var i = 0; i < timeIntervals.length; i++) {
			window.clearInterval(timeIntervals[i]);
		}
		timeIntervals.length = 0;
		direction = "";
	}
	
	function playSound(src) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
		this.play = function(){
			this.sound.play();
		}
		this.stop = function(){
			this.sound.pause();
		}    
	}
	generatePlayButton();
});