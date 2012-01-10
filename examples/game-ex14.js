//Map class
function Map(gridSizeW, gridSizeH)
{
	// Tile texture
	this.tile = new Image();
	this.tile.src = "../img/tile.png";

	// Grid dimensions
	this.grid = {
		width: gridSizeW,
		height: gridSizeH
	}

	// Tile map matrix
	this.tileMap = [];

	//Building texture
	this.building = new Image();
	this.building.src = "../img/icecream.png";
}

// Game class for example 14
function Game(canvas, game, gridSizeW, gridSizeH) {
	this.started = true;
	this.gameContainer = game;
	this.canvas = canvas;

	// Get the 2D Context
	this.c = canvas.getContext('2d');

	// Can we run the game?
	var missingDeps = [];
	var dependencies = [Modernizr.rgba, 
						Modernizr.canvas,
						Modernizr.borderradius,
						Modernizr.boxshadow,
						Modernizr.cssgradients];

	for (var i = 0, dep = dependencies.length; i < dep; i++) {
		if (!dependencies[i]) {
			missingDeps.push(dependencies[i]);
		}
	}

	//Create a map
	this.map = new Map(gridSizeW, gridSizeH);
	

	if (missingDeps.length !== 0) {
		alert("This browser doesn't include some of the technologies needed to play the game");
		this.started = false;
		return;
	}


	// Drag helper
	this.dragHelper = {
		active: false,
		x: 0,
		y: 0	
	}

	// Zoom helper, 3 zoom levels supported
	this.zoomHelper = {
		level: 1,
		NORMAL: 1,
		FAR: 0.50,
		CLOSE: 2
	}

	// Scroll position helper, keeps track of scrolling
	this.scrollPosition = { x: 0, y: 0 }


	// Default zoom level
	this.map.tile.width *= this.zoomHelper.level;
	this.map.tile.height *= this.zoomHelper.level;

	// Initially center the starting point horizontally and vertically
	this.scrollPosition.y -= (this.map.grid.height * this.zoomHelper.level) + this.scrollPosition.y;
	this.scrollPosition.x -= (this.map.grid.width * this.zoomHelper.level) + this.scrollPosition.x;

	this.doResize();
	this.draw();
}

Game.prototype.handleGestureEnd = function(e) {
	e.preventDefault();

	if (Math.floor(e.scale) == 0) {
		this.zoomIn();
	} else {
		this.zoomOut();
	}
}

Game.prototype.handleScroll = function(e) {
	e.preventDefault();

	var scrollValue = (e.wheelDelta == undefined) ? e.detail * -1 : e.wheelDelta;

	if (scrollValue >= 0) {
		this.zoomIn();
	} else {
		this.zoomOut();
	}
}

Game.prototype.handleKeyDown = function(e) {
	switch (e.keyCode) {
		case Keys.UP:
		case Keys.W:
			this.scrollPosition.y += 20;
			break;
		case Keys.DOWN:
		case Keys.S:
			this.scrollPosition.y -= 20;
			break;
		case Keys.LEFT:
		case Keys.A:
			this.scrollPosition.x += 20;
			break;
		case Keys.RIGHT:
		case Keys.D:
			this.scrollPosition.x -= 20;
			break;
		case Keys.X:
			this.zoomIn();
			break;
		case Keys.Z:
			this.zoomOut();
			break;
		case Keys.R:
			this.rotateGrid();
			break;
	}

	this.draw();
}

Game.prototype.handleDrag = function(e, Tools) {
	e.preventDefault();

	switch (Tools.current) {
		case Tools.MOVE:
			if (this.dragHelper.active) {
				var x, y;

				if (Modernizr.touch) {
					x = e.touches[0].pageX;
					y = e.touches[0].pageY;
				} else {
					x = e.clientX;
					y = e.clientY;
				}

				// Smooth scrolling effect
				this.scrollPosition.x -= (this.dragHelper.x - x) / 18;
				this.scrollPosition.y -= (this.dragHelper.y - y) / 18;
			}

			this.draw();
			break;
	}
}

Game.prototype.handleMouseUp = function(e, Tools) {
	e.preventDefault();

	switch (Tools.current) {
		case Tools.MOVE:
			this.dragHelper.active = false;
			break;
	}
}

Game.prototype.handleMouseDown = function(e, Tools) {
	var x, y;

	e.preventDefault();
	
	if (Modernizr.touch) {
		x = e.touches[0].pageX;
		y = e.touches[0].pageY;
	} else {
		x = e.clientX;
		y = e.clientY;
	}

	switch (Tools.current) {
		case Tools.MOVE:
			this.dragHelper.active = true;
			this.dragHelper.x = x;
			this.dragHelper.y = y;
			this.draw();
			break;
		case Tools.ZOOM_IN:
			this.zoomIn();
			break;
		case Tools.ZOOM_OUT:
			this.zoomOut();
			break;
		case Tools.DEMOLISH:

			var pos = this.translatePixelsToMatrix(x, y);

			if (this.map.tileMap[pos.row] != undefined && this.map.tileMap[pos.row][pos.col] != undefined) {
				this.map.tileMap[pos.row][pos.col] = null;
			}
			this.draw();
			break;
		case Tools.BUILD:
			var pos = this.translatePixelsToMatrix(x, y);
			this.map.tileMap[pos.row] = (this.map.tileMap[pos.row] === undefined) ? [] : this.map.tileMap[pos.row];
			this.map.tileMap[pos.row][pos.col] = 1;
			this.draw();
			break;
		
	}
}

Game.prototype.doResize = function() {
	this.canvas.width = document.body.clientWidth;
	this.canvas.height = document.body.clientHeight;
	this.draw();
}

Game.prototype.translatePixelsToMatrix = function(x, y) {
	var tileHeight = this.map.tile.height * this.zoomHelper.level;
	var tileWidth = this.map.tile.width * this.zoomHelper.level;

	var gridOffsetY = (this.map.grid.height * this.zoomHelper.level) + this.scrollPosition.y;
	var gridOffsetX = (this.map.grid.width * this.zoomHelper.level);

	// By default the grid appears centered horizontally
	gridOffsetX += (this.canvas.width / 2) - ((tileWidth / 2) * this.zoomHelper.level) + this.scrollPosition.x;

	var col = (2 * (y - gridOffsetY) - x + gridOffsetX) / 2;
	var row = x + col - gridOffsetX - tileHeight;
		
	col = Math.round(col / tileHeight);
	row = Math.round(row / tileHeight);
	
	return {
		row: row,
		col: col
	}
}

Game.prototype.draw = function(srcX, srcY, destX, destY) {
	srcX = (srcX === undefined) ? 0 : srcX;
	srcY = (srcY === undefined) ? 0 : srcY;
	destX = (destX === undefined) ? this.canvas.width : destX;
	destY = (destY === undefined) ? this.canvas.height : destY;

	this.c.clearRect (0, 0, this.canvas.width, this.canvas.height);
	this.c.fillStyle = '#0C3B00'; // Green background
	this.c.fillRect (0, 0, this.canvas.width, this.canvas.height);

	var pos_TL = this.translatePixelsToMatrix(1, 1);
	var pos_BL = this.translatePixelsToMatrix(1, this.canvas.height);
	var pos_TR = this.translatePixelsToMatrix(this.canvas.width, 1);
	var pos_BR = this.translatePixelsToMatrix(this.canvas.width, this.canvas.height);

	var startRow = pos_TL.row;
	var startCol = pos_TR.col;
	var rowCount = pos_BR.row + 1;
	var colCount = pos_BL.col + 1;

	startRow = (startRow < 0) ? 0 : startRow;
	startCol = (startCol < 0) ? 0 : startCol;

	rowCount = (rowCount > this.map.grid.width) ? this.map.grid.width : rowCount;
	colCount = (colCount > this.map.grid.height) ? this.map.grid.height : colCount;

	var tileHeight = this.map.tile.height * this.zoomHelper.level;
	var tileWidth = this.map.tile.width * this.zoomHelper.level;

	for (var row = startRow; row < rowCount; row++) {
		for (var col = startCol; col < colCount; col++) {
			var xpos = (row - col) * tileHeight + (this.map.grid.width * this.zoomHelper.level);
			xpos += (this.canvas.width / 2) - ((tileWidth / 2) * this.zoomHelper.level) + this.scrollPosition.x;

			var ypos = (row + col) * (tileHeight / 2) + (this.map.grid.height * this.zoomHelper.level) + this.scrollPosition.y;
			
			if (this.map.tileMap[row] != undefined && this.map.tileMap[row][col] != undefined) 
			{
				// Place building
				if (Math.round(xpos) + tileWidth >= srcX &&
					Math.round(ypos) + tileHeight >= srcY &&
					Math.round(xpos) <= destX &&
					Math.round(ypos) <= destY) 
				{
					this.c.drawImage(this.map.building, Math.round(xpos), Math.round(ypos), tileWidth, tileHeight);	
				}
			} 
			else 
			{
				if (Math.round(xpos) + tileWidth >= srcX &&
					Math.round(ypos) + tileHeight >= srcY &&
					Math.round(xpos) <= destX &&
					Math.round(ypos) <= destY) 
				{

					this.c.drawImage(this.map.tile, Math.round(xpos), Math.round(ypos), tileWidth, tileHeight);	

				}
			}

		}
	}
}

Game.prototype.zoomIn = function() {
	switch(this.zoomHelper.level) {
		case this.zoomHelper.NORMAL:
			this.zoomHelper.level = this.zoomHelper.CLOSE;
			break;
		case this.zoomHelper.FAR:
			this.zoomHelper.level = this.zoomHelper.NORMAL;
			break;
		case this.zoomHelper.CLOSE:
			return;
	}
	

	// Center the view
	this.scrollPosition.y -= (this.map.grid.height * this.zoomHelper.level) + this.scrollPosition.y;		
	this.scrollPosition.x -= (this.map.grid.width * this.zoomHelper.level) + this.scrollPosition.x;

	this.draw();
}

Game.prototype.zoomOut = function() {
	switch(this.zoomHelper.level) {
		case this.zoomHelper.NORMAL:
			this.zoomHelper.level = this.zoomHelper.FAR;
			break;
		case this.zoomHelper.CLOSE:
			this.zoomHelper.level = this.zoomHelper.NORMAL;
			break;
		case this.zoomHelper.FAR:
			return;
	}

	// Center the view
	this.scrollPosition.y -= (this.map.grid.height * this.zoomHelper.level) + this.scrollPosition.y;
	this.scrollPosition.x -= (this.map.grid.width * this.zoomHelper.level) + this.scrollPosition.x;

	this.draw();
}

Game.prototype.rotateGrid = function(mW, mH, sW, sH) {
    var m = [];

    mW = (mW === undefined) ? this.map.grid.width : mW;
    mH = (mH === undefined) ? this.map.grid.height : mH;

    sW = (sW === undefined) ? 0 : sW;
    sH = (sH === undefined) ? 0 : sH;

    for (var i = sW; i < mW; i++) {
        for (var j = sH; j < mH; j++) {
        	var row = (mW - j) - 1;

        	if (this.map.tileMap[row] !== undefined && this.map.tileMap[row][i]) {
        		m[i] = (m[i] === undefined) ? [] : m[i];
        		m[i][j] = this.map.tileMap[row][i];
        	}
        }
    }

    this.map.tileMap = m;
}