'use strict';
if ( !window.requestAnimationFrame ) {
  window.requestAnimationFrame = ( function() {
    return window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(  callback, fps ) {
      window.setTimeout( callback, 1000 / fps );
    };
  } )();
}

var sizes = function(){
	var xScroll, yScroll;

	if (window.innerHeight && window.scrollMaxY) {
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.offsetHeight){ // Explorer 6 strict mode
		xScroll = document.documentElement.scrollWidth;
		yScroll = document.documentElement.scrollHeight;
	} else { // Explorer Mac...would also work in Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}

	var windowWidth, windowHeight;

	if (self.innerHeight) { // all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}

	// for small pages with total height less then height of the viewport
	if(yScroll < windowHeight){
		var pageHeight = windowHeight;
	} else {
		pageHeight = yScroll;
	}

	// for small pages with total width less then width of the viewport
	if(xScroll < windowWidth){
		var pageWidth = windowWidth;
	} else {
		pageWidth = xScroll;
	}
	return {pageWidth,pageHeight,windowWidth,windowHeight};
}();




var svg1 = document.getElementById('svg_1');
svg1.addEventListener('click',drawImage);
function drawImage() {
	var pathLength =  window.getComputedStyle(this).strokeDasharray;
	var path = this;
	var offset = parseInt(pathLength);
	console.log(offset);

	drawSVG();
	function drawSVG() {
	
		if (offset > 0) {
			path.style.strokeDashoffset = offset;
			offset -=7;
			requestAnimationFrame(drawSVG,60)
		}
	}

}




function scrollin() {
	var svg = document.getElementById('svg_0');
	var path = document.getElementById('svg_1');
	var pathLength = path.getTotalLength();
	var scrolled = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
	var coord = svg.getBoundingClientRect();
	var w = coord.top;
	var h = coord.bottom;
	var windowOnStartScroll = sizes.windowHeight/4;


	var scrollStart = scrolled + w - windowOnStartScroll;
	var scrollEnd = scrolled + h - windowOnStartScroll*3;


	var scrolledLength = scrollEnd - scrollStart;
	var punkt = pathLength/scrolledLength;
	var as = pathLength - (scrolled - scrollStart) * punkt;
	if (scrolled < scrollStart) path.style.strokeDashoffset = pathLength;
	if (scrolled > scrollStart && scrolled < scrollEnd) {
		path.style.strokeDashoffset = as;

	}
}


class svgScrollDrawing {
	constructor() {
		this.svg = document.getElementById('svg_3');
		this.pathCount = document.querySelectorAll('#svg_3 path');
		for (var i = 0; i < this.pathCount.length; i++) {
			this._dataInit(i);
			this._calculate();
		}
	}
	_dataInit(i) {
		this.svgCoordinateInWindow = this.svg.getBoundingClientRect();
		this.path = this.pathCount[i];
		this.pathLength = this.path.getTotalLength();
		this.scrollCoordinate = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
		this.fourthWindowHeight = sizes.windowHeight/5;

	}
	_calculate() {
		var scrollStartCoordinate = this.scrollCoordinate + this.svgCoordinateInWindow.top - this.fourthWindowHeight*3;
		var scrollEndCoordinate = this.scrollCoordinate + this.svgCoordinateInWindow.top - this.fourthWindowHeight;
		this.scrolledLength = scrollEndCoordinate - scrollStartCoordinate;
		var cons = this.pathLength/this.scrolledLength;

		if (this.scrollCoordinate > scrollStartCoordinate && this.scrollCoordinate < scrollEndCoordinate) {
			this.path.style.strokeDashoffset = this.pathLength - (this.scrollCoordinate - scrollStartCoordinate) * cons;

		} else if (this.scrollCoordinate < scrollStartCoordinate) {
			this.path.style.strokeDashoffset = this.pathLength;
		} else {
			this.path.style.strokeDashoffset = 0;
		}
	}
}

var path = document.querySelectorAll('#svg_3 path');
for (var i = 0; i < path.length; i++) {
	var a = path[i].getTotalLength();
	path[i].style.strokeDasharray = a;
	path[i].style.strokeDashoffset = a;
}

window.onscroll = function() { 
	new svgScrollDrawing();
}
