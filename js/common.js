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
};

class jobWithSvg {
	constructor() {
		this._findAllSVGAnim();
		this._getConstantOptions();
		this._getAllAnimSVGCoordinates();
	}

	_findAllSVGAnim() {

		var allSVGOnSite = document.getElementsByTagName('svg');
		this.allAnimSVG = {};

		for (var q = 0; q < allSVGOnSite.length; q++) {
			var a = allSVGOnSite[q];
			if (!a.hasAttribute('data-svg-animation')) {continue;}
			var SVGId = a.getAttribute('id');
			this.allAnimSVG['SVG' + SVGId] = {};
			this.allAnimSVG['SVG' + SVGId].baseObj = a;
			this.allAnimSVG['SVG' + SVGId].id = SVGId;
			this.__findPathInSVGAndSetStrokes(this.allAnimSVG['SVG' + SVGId]);
		}
	}

	__findPathInSVGAndSetStrokes(svgObject) {

		var pathCollection = svgObject.baseObj.querySelectorAll('path');

		svgObject.allPathInSVG = {};

		for (var i = 0; i < pathCollection.length; i++) {
			var a = pathCollection[i].getTotalLength();
			pathCollection[i].style.strokeDasharray = a;
			pathCollection[i].style.strokeDashoffset = a;
			
			svgObject.allPathInSVG['path'+i] = {};
			svgObject.allPathInSVG['path'+i].basePath = pathCollection[i]
			svgObject.allPathInSVG['path'+i].pathLength = a;
		}
	}

	_getConstantOptions() {
		this.screenSize = sizes();
		this.allAnimSVGNames = Object.getOwnPropertyNames(this.allAnimSVG);
	}

	_getAllAnimSVGCoordinates() {

		var scrollValue = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

		for (var i = 0; i < this.allAnimSVGNames.length; i++) {

			var a = this.allAnimSVG[this.allAnimSVGNames[i]];

			a.coordinatesInWindow = a.baseObj.getBoundingClientRect();

			a.coordinatesInDocument = a.coordinatesInWindow.top + scrollValue;

			a.startAnim = a.coordinatesInWindow.top + scrollValue - this.screenSize.windowHeight/10*7;
			a.endAnim = a.coordinatesInWindow.top + scrollValue - this.screenSize.windowHeight/10*2;
			this.__getScrollMultiplerForAllAnimSVG(this.allAnimSVGNames[i]);
		}
	}
	__getScrollMultiplerForAllAnimSVG(svgName) {
		var a = this.allAnimSVG[svgName].allPathInSVGNames = Object.getOwnPropertyNames(this.allAnimSVG[svgName].allPathInSVG);
		for (var i = 0; i < a.length; i++) {
			this.allAnimSVG[svgName].allPathInSVG[a[i]].multiple =
			 this.allAnimSVG[svgName].allPathInSVG[a[i]].pathLength/(this.allAnimSVG[svgName].endAnim - this.allAnimSVG[svgName].startAnim);
		}
	}

	howSvgActive(scrollValue) {
		var screenTop = scrollValue;
		var screenEnd = scrollValue + this.screenSize.windowHeight;
		for (var i = 0; i < this.allAnimSVGNames.length; i++) {
			var a = this.allAnimSVG[this.allAnimSVGNames[i]].coordinatesInDocument;
			if (a > screenTop && a < screenEnd) 
				this.__calculate(scrollValue,this.allAnimSVGNames[i]);
		}
	}

	__calculate(scrollValue,svgName) {
		if (scrollValue > this.allAnimSVG[svgName].startAnim && scrollValue < this.allAnimSVG[svgName].endAnim) {
			for (var i = 0; i < this.allAnimSVG[svgName].allPathInSVGNames.length; i++) {
				var a = this.allAnimSVG[svgName].allPathInSVG[this.allAnimSVG[svgName].allPathInSVGNames[i]];
				a.basePath.style.strokeDashoffset = a.pathLength - (scrollValue - this.allAnimSVG[svgName].startAnim) * a.multiple;
			}
		} else if (scrollValue < this.allAnimSVG[svgName].startAnim) {
			for (var i = 0; i < this.allAnimSVG[svgName].allPathInSVGNames.length; i++) {
				var a = this.allAnimSVG[svgName].allPathInSVG[this.allAnimSVG[svgName].allPathInSVGNames[i]];
				a.basePath.style.strokeDashoffset = a.pathLength;
			}
		} else {
			for (var i = 0; i < this.allAnimSVG[svgName].allPathInSVGNames.length; i++) {
				var a = this.allAnimSVG[svgName].allPathInSVG[this.allAnimSVG[svgName].allPathInSVGNames[i]];
				a.basePath.style.strokeDashoffset = 0;
			}
		}
	}
}
var initSVG = new jobWithSvg();

window.onscroll = function() {
	var scrollValue = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
	initSVG.howSvgActive(scrollValue);
}


/*
allAnimSVG = {
	SVGtree : {
		baseObj:#svg_id_tree,
		id:tree,
		allPathInSVG:[...],
	}
}

*/

//===================================================


// var svgIds = function() {
// 	var a = document.getElementsByTagName('svg');
// 	var svgIds = [];
// 	for (var q = 0; q < a.length; q++) {
// 		if (!a[q].hasAttribute('data-svg-animation')) {continue;}
// 		var svgId = a[q].getAttribute('id');
// 		svgIds[q] = svgId;
// 		var path = a[q].querySelectorAll('path');
// 		for (var i = 0; i < path.length; i++) {
// 			var a = path[i].getTotalLength();
// 			path[i].style.strokeDasharray = a;
// 			path[i].style.strokeDashoffset = a;
// 		}
// 	}
// 	return svgIds;
// }();

// var coordinatiesSvgDrawing = function() {

// };


// class svgScrollDrawing {
// 	constructor(svgId) {
// 		this.svgId = svgId;
// 		this.svg = document.getElementById(this.svgId);
// 		this.pathCount = this.svg.querySelectorAll('path');
// 		for (var i = 0; i < this.pathCount.length; i++) {
// 			this._dataInit(i);
// 			this._calculate();
// 		}
// 	}
// 	_dataInit(i) {
// 		this.svgCoordinateInWindow = this.svg.getBoundingClientRect();
// 		this.path = this.pathCount[i];
// 		this.pathLength = this.path.getTotalLength();
// 		this.scrollCoordinate = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
// 		this.fourthWindowHeight = sizes().windowHeight/5;

// 	}
// 	_calculate() {
// 		var scrollStartCoordinate = this.scrollCoordinate + this.svgCoordinateInWindow.top - this.fourthWindowHeight*3;
// 		var scrollEndCoordinate = this.scrollCoordinate + this.svgCoordinateInWindow.top - this.fourthWindowHeight;
// 		this.scrolledLength = scrollEndCoordinate - scrollStartCoordinate;
// 		var cons = this.pathLength/this.scrolledLength;

// 		if (this.scrollCoordinate > scrollStartCoordinate && this.scrollCoordinate < scrollEndCoordinate) {
// 			this.path.style.strokeDashoffset = this.pathLength - (this.scrollCoordinate - scrollStartCoordinate) * cons;

// 		} else if (this.scrollCoordinate < scrollStartCoordinate) {
// 			this.path.style.strokeDashoffset = this.pathLength;
// 		} else {
// 			this.path.style.strokeDashoffset = 0;
// 		}
// 	}
// }


// window.onscroll = function() {
// 	new svgScrollDrawing('tree');
// }
//===================================================



// var svg1 = document.getElementById('svg_1');
// svg1.addEventListener('click',drawImage);

// function drawImage() {
// 	var pathLength =  window.getComputedStyle(this).strokeDasharray;
// 	var path = this;
// 	var offset = parseInt(pathLength);
// 	console.log(offset);

// 	drawSVG();
// 	function drawSVG() {
	
// 		if (offset > 0) {
// 			path.style.strokeDashoffset = offset;
// 			offset -=7;
// 			requestAnimationFrame(drawSVG,60)
// 		}
// 	}

// }

// function scrollin() {
// 	var svg = document.getElementById('svg_0');
// 	var path = document.getElementById('svg_1');
// 	var pathLength = path.getTotalLength();
// 	var scrolled = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
// 	var coord = svg.getBoundingClientRect();
// 	var w = coord.top;
// 	var h = coord.bottom;
// 	var windowOnStartScroll = sizes.windowHeight/4;


// 	var scrollStart = scrolled + w - windowOnStartScroll;
// 	var scrollEnd = scrolled + h - windowOnStartScroll*3;


// 	var scrolledLength = scrollEnd - scrollStart;
// 	var punkt = pathLength/scrolledLength;
// 	var as = pathLength - (scrolled - scrollStart) * punkt;
// 	if (scrolled < scrollStart) path.style.strokeDashoffset = pathLength;
// 	if (scrolled > scrollStart && scrolled < scrollEnd) {
// 		path.style.strokeDashoffset = as;

// 	}
// }