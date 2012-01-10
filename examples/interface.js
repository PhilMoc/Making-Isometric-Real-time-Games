function Interface(gm, cnvs, document, gmObj)
{
			// Enums
			this.Keys = {
				UP: 38,
				DOWN: 40,
				LEFT: 37,
				RIGHT: 39,
				W: 87,
				A: 65,
				S: 83,
				D: 68,
				Z: 90,
				X: 88,
				R: 82
			}

			this.Tools = {
				current: 4, // Default tool
				/* - */
				MOVE: 0,
				ZOOM_IN: 1,
				ZOOM_OUT: 2,
				DEMOLISH: 3,
				SELECT: 4,
				BUILD: 5
			}		


				this.canvas = cnvs;
				this.game = gm;


				// Initialize the game object
				this.g = gmObj;

				this.pointer = {
					DOWN: 'mousedown',
					UP: 'mouseup',
					MOVE: 'mousemove'
				};

				if (Modernizr.touch){
					this.pointer.DOWN = 'touchstart';
					this.pointer.UP = 'touchend';
					this.pointer.MOVE = 'touchmove';
				}
				
				

				// Set up the event listeners
				$(window).resize(function() { this.g.doResize(); }.bind(this));
				$(this.canvas).mousedown(function(e) {this.g.handleMouseDown(e, this.Tools);}.bind(this));
				$(this.canvas).mousemove(function(e) { this.g.handleDrag(e, this.Tools); }.bind(this));
				$(document.body).mouseup(function(e) { this.g.handleMouseUp(e, this.Tools); }.bind(this));


				//alert(window);

				if (Modernizr.touch){
					// Detect gestures
					document.body.addEventListener('gestureend', function(e) { this.g.handleGestureEnd(e); }.bind(this), false);
				} else {
					document.body.addEventListener('keydown', function(e) { this.g.handleKeyDown(e); }.bind(this), false);

					// Detect mousewheel scrolling
					$(document.body).mousewheel(function(e, delta) { this.g.handleScroll(e, delta); }.bind(this));
					document.body.addEventListener('DOMMouseScroll', function(e) { this.g.handleScroll(e); }.bind(this), false);
				}

				

				// Listen for GUI events
				var ui = document.getElementById('ui');
				//ui.addEventListener(this.pointer.DOWN, function(e){alert("EVENTLISTENERS WHEEEEEEE");}.bind(this), false);
				$(ui).mouseup(function(e) {
					switch(e.target.getAttribute('id')) {
						case 'panel-toggle':
							var panelContainer = document.getElementById('panel-container');
							var classes = panelContainer.getAttribute('class');

							if (classes != null && classes.length > 0) {
								panelContainer.setAttribute('class', '');
								document.getElementById('panel-toggle').innerHTML = 'Cancel';
							} else {
								panelContainer.setAttribute('class', 'hidden');
								document.getElementById('panel-toggle').innerHTML = 'Build';
							}
							break;
						case 'select':
							this.selectTool(this.Tools.SELECT, document.getElementById('select'));
							break;
						case 'move':
							this.selectTool(this.Tools.MOVE, document.getElementById('move'));
							break;
						case 'zoomIn':
							this.selectTool(this.Tools.ZOOM_IN, document.getElementById('zoomIn'));
							break;
						case 'zoomOut':
							this.selectTool(this.Tools.ZOOM_OUT, document.getElementById('zoomOut'));
							break;
						case 'rotate':
							this.g.rotateGrid();
							this.g.draw();
							break;
						case 'demolish':
							this.selectTool(this.Tools.DEMOLISH, document.getElementById('demolish'));
							break;
						case 'building1':
						case 'building2':
						case 'building3':
							this.Tools.current = this.Tools.BUILD;
							break;
						default:
							// He didn't click on any option and actually click on an empty section of the UI, fallback to the canvas.
							e.srcElement = canvas;
							e.target = canvas;
							e.toElement = canvas;

							this.g.handleMouseDown(e);

							break;
					}
				}.bind(this));
}
			
//Credit to Robert Sosinski for scope binding function - http://www.robertsosinski.com/2009/04/28/binding-scope-in-javascript/
Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}

Interface.prototype.selectTool = function(tool, elem) {
				
				//alert(this.Tools.current);				

				// Remove the "active" class from any element inside the div#tools ul
				for (var i = 0, x = elem.parentNode.childNodes.length; i < x; i++) {
					if (elem.parentNode.childNodes[i].tagName == "LI") {
						elem.parentNode.childNodes[i].className = null;
					}
				}

				elem.className += "active";
			

				switch(tool) {
					case this.Tools.SELECT:
						this.Tools.current = this.Tools.SELECT;
						break;
					case this.Tools.MOVE:
						this.Tools.current = this.Tools.MOVE;
						break;
					case this.Tools.ZOOM_IN:
						this.Tools.current = this.Tools.ZOOM_IN;
						break;
					case this.Tools.ZOOM_OUT:
						this.Tools.current = this.Tools.ZOOM_OUT;
						break;
					case this.Tools.DEMOLISH:
						this.Tools.current = this.Tools.DEMOLISH;
						break;
				}

				//alert(this.Tools.current);

			}
