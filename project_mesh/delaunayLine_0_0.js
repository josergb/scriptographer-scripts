/**
 *	delaunay line 0.0
 *
 *	Ken Frederick
 *	ken.frederick@gmx.de
 *
 *	http://kennethfrederick.de/
 *	http://blog.kennethfrederick.de/
 *
 *	this idea is 100% ripped off from jonathan puckey
 *	http://www.jonathanpuckey.com/projects/delaunay-raster/
 *
 *	i just modified his oroginal idea to use lines instead of fills
 *
 *	the code is mine and libraries used have been modified
 *	specifically for use with scriptographer (see notes)
 *	
 */



// ------------------------------------------------------------------------
// Properties
// ------------------------------------------------------------------------

// document properties
var raster;
var rasterValid = false;

// mesh properties
var triangles;
var groupFaces = new Group();
var points = new Array();


// values
var values = {
	// ------------------------------------
	// lines
	// ------------------------------------
	bDRAG:			false,
	
	// ------------------------------------
	// colors
	// ------------------------------------
	limit:			10,
	densityMax:		20,

	// ------------------------------------
	// raster
	// ------------------------------------
	rasterWidth:	0,
	rasterHeight:	0
};

// gui components
var components = {
	// ------------------------------------
	// lines
	// ------------------------------------
	bDRAG: {
		type:	'checkbox',
		label:	'Drag and draw?'
	},

	gRule: { 
		type: 'ruler',
		fullSize: true,
	},

	// ------------------------------------
	// colors
	// ------------------------------------
	limit: {
		type: 'number',
		label: 'Grayscale levels',
		units: 'none',
		minimum: 1,
		steppers: true,
		increment: 1,
		fractionDigits: 0,
		enabled: true
	},
	densityMax: {
		type: 'number',
		label: 'Max line density',
		units: 'none',
		minimum: 1,
		steppers: true,
		increment: 1,
		fractionDigits: 0,
		enabled: true
	},

	cRule: { 
		type: 'ruler',
		fullSize: true,
	},

	// ------------------------------------
	// triangulate
	// ------------------------------------
	triangulate: { 
		type: 'button', 
		value: 'Triangulate',
		enabled: true,
		onClick: function() {
			triangles = Triangulate( points );
		}
	},
	
	cRule: { 
		type: 'ruler',
		fullSize: true,
	},
	
	// ------------------------------------
	// raster
	// ------------------------------------
	rasterWidth: {
		type: 'number',
		label: 'Raster width',
		units: 'point',
		steppers: true,
		increment: 10,
		enabled: true
	},

	rasterHeight: {
		type: 'number',
		label: 'Raster height',
		units: 'point',
		steppers: true,
		increment: 10,
		enabled: true
	},
	rRule: { 
		type: 'ruler',
		fullSize: true,
	},
	
	raster: { 
		type: 'button', 
		//value: 'Apply',
		value: 'Redefine source image',
		enabled: true,
		onClick: function() {
			//rasterValid = false;
			RasterSetup();
		}
	}


};


// ------------------------------------------------------------------------
// Setup
// ------------------------------------------------------------------------
function Setup() {
	RasterSetup();
	var palette = new Palette('Delaunay Lines 0.0', components, values);
}

// ------------------------------------------------------------------------
// Update
// ------------------------------------------------------------------------
function Update(event) {
}

// ------------------------------------------------------------------------
// Draw
// ------------------------------------------------------------------------
function Draw() {
	// clear group contents
	if( groupFaces.isValid() ) groupFaces.removeChildren();
	else groupFaces = new Group();

	// ------------------------------------
	// mesh faces
	// ------------------------------------
	triangles = Triangulate( points );
}



// ------------------------------------------------------------------------
// Methods
// ------------------------------------------------------------------------
function random(minr, maxr) {
	return minr + Math.random() * (maxr - minr);
}

/**
 *	snap function from:
 *	http://stackoverflow.com/questions/4507784/snap-to-grid-functionality-using-javascript
 */
function snap(value, snapAmt, roundFunction) {
	if (roundFunction === undefined) roundFunction = Math.round;
	return snapAmt * roundFunction(value / snapAmt);
}


// ------------------------------------------------------------------------
Array.prototype.max = function() {
	var max = this[0];
	var len = this.length;
	//for(var i=1; i<len; i++) if(this[i] > max) max = this[i];
	for(var i=1; i<len; i++) if(this[i] > max) max = i;
	return max;
}
Array.prototype.min = function() {
	var min = this[0];
	var len = this.length;
	//for (var i=1; i<len; i++) if(this[i] < min) min = this[i];
	for (var i=1; i<len; i++) if(this[i] < min) min = i;
	return min;
}


// ------------------------------------------------------------------------
function add(pt1, pt2) {
	var out = new Point( pt1.x + pt2.x, pt1.y + pt2.y );
	return out;
}

function sub(pt1, pt2) {
	var out = new Point( pt1.x - pt2.x, pt1.y - pt2.y );
	return out;
}

function dist(pt1, pt2) {
	var dx = pt1.x - pt2.x;
	var dy = pt1.y - pt2.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function heading(pt1) {
	return -1 * (Math.atan2(-pt1.y, pt1.x));
}

function angleBetween(pt1, pt2) {
	var dot = pt1.x * pt2.x + pt1.y * pt2.y;
	var pt1mag = Math.sqrt(pt1.x * pt1.x + pt1.y * pt1.y);
	var pt2mag = Math.sqrt(pt2.x * pt2.x + pt2.y * pt2.y);
	var amt = dot / (pt1mag * pt2mag);

	if (amt <= -1) {
	  return Math.PI;
	} else if (amt >= 1) {
	  return 0;
	}
	return Math.acos(amt);
}

function DelaunayPoint( pt ) {
	points.push( pt );
	Draw();
}


// ------------------------------------------------------------------------
function RasterSetup() {
	var rasters = document.getItems( { type: [Raster, PlacedFile], selected: true } );

	if(rasters.length > 0) {
		raster = rasters.first;
		rasterValid = true;
		if (raster instanceof PlacedFile && !raster.eps) {
			raster = raster.embed(false);
		}
	} else {
		RasterSelection();
	}
	
	// no image selected or created
	if(!rasterValid) {
		//Dialog.alert('Bitte ein gueltiges Bild auswaehlen');
	}

}

function RasterSelection() {
	var sel = activeDocument.getItems( { type: Item, selected: true } );
	var groupSel = new Group();
	for( var i=0; i<sel.length; i++ ) {
		var obj = sel[i].clone();
		groupSel.appendTop( obj );
		sel[i].selected = false;
	}

	// set background
	var rect = new Path.Rectangle( groupSel.bounds );
	rect.bounds.width += values.rasterWidth;
	rect.bounds.height += values.rasterHeight;
	rect.position = groupSel.position;
	rect.fillColor = new CMYKColor(0,0,0,0);
	groupSel.appendBottom( rect );

	// rasterize
	raster = groupSel.rasterize('rgb', 72,0); 
	raster.selected = true;
	rasterValid = true;

	groupSel.remove();
}


// ------------------------------------------------------------------------
function createFaces(triangles) {
	var groupHolder = new Group();
	for( i in triangles ) {
		var triangle = triangles[i];

		// ------------------------------------
		// points
		// ------------------------------------
		var pts = new Array(
			new Point(triangle.v0.x, triangle.v0.y),
			new Point(triangle.v1.x, triangle.v1.y),
			new Point(triangle.v2.x, triangle.v2.y)
		);

		// distances
		var dsts = new Array( 
			dist(pts[0],pts[1]),
			dist(pts[1],pts[2]),
			dist(pts[2],pts[0])
		);

		// face
		face = new Path();
		face.moveTo( triangle.v0.x, triangle.v0.y );
		face.lineTo( triangle.v1.x, triangle.v1.y );
		face.lineTo( triangle.v2.x, triangle.v2.y );
		face.closed = true;
		face.strokeWidth = 0.25;
		face.strokeColor = new CMYKColor(0,0,0,1);
		face.fillColor = null;


		// ------------------------------------
		// gather colors
		// ------------------------------------
		var cenPt = face.position;
		var colPt = new Point( cenPt.x - raster.position.x + raster.width*0.5, 
							   cenPt.y - raster.position.y + raster.height*0.5 );


		// ------------------------------------
		// draw lines
		// ------------------------------------
		var density = Math.round(values.densityMax * averageColor(colPt,2).gray );
		for(var j=0; j<density; j++) {
			var ratio = (j/density);
			var linePt1 = new Point();
			var linePt2 = new Point();
			var staPt, endPt;
			
			switch( dsts.max() ) {
				case 0:
					linePt1.x = pts[0].x + (pts[2].x - pts[0].x) * ratio;
					linePt1.y = pts[0].y + (pts[2].y - pts[0].y) * ratio;
					linePt2.x = pts[1].x + (pts[2].x - pts[1].x) * ratio;
					linePt2.y = pts[1].y + (pts[2].y - pts[1].y) * ratio;
					break;
				case 1:
					linePt1.x = pts[1].x + (pts[0].x - pts[1].x) * ratio;
					linePt1.y = pts[1].y + (pts[0].y - pts[1].y) * ratio;
					linePt2.x = pts[2].x + (pts[0].x - pts[2].x) * ratio;
					linePt2.y = pts[2].y + (pts[0].y - pts[2].y) * ratio;
					break;
				case 2:
					linePt1.x = pts[0].x + (pts[1].x - pts[0].x) * ratio;
					linePt1.y = pts[0].y + (pts[1].y - pts[0].y) * ratio;
					linePt2.x = pts[2].x + (pts[1].x - pts[2].x) * ratio;
					linePt2.y = pts[2].y + (pts[1].y - pts[2].y) * ratio;
					break;
			}

			var line = new Path.Line( linePt1, linePt2);
			line.strokeWidth = 0.25;
			line.strokeColor = new CMYKColor(0,0,0,1);
			line.fillColor = null;

			groupHolder.appendTop( face );
			groupHolder.appendTop( line );
		}

		// ------------------------------------
		// add to group
		// ------------------------------------
		groupFaces.appendTop(groupHolder);

	}
}

function averageColor(pt,size) {
	var avg = 0;
	var index = 0;
	for(var i=pt.y-size; i<pt.y+size; i++) {
		for(var j=pt.x-size; j<pt.x+size; j++) {
			avg += raster.getPixel( new Point(j,i) ).gray;
			index++;
		}
	}

	var bright = snap( avg/index, 1/values.limit );
	return new GrayColor( bright );
}

// ------------------------------------------------------------------------
// events
// ------------------------------------------------------------------------
function onMouseDown(event) {
	var pt = new Point( event.point );
	if( !values.bDRAG && rasterValid ) {
		DelaunayPoint( pt );
	}
}

function onMouseDrag(event) {
	var pt = new Point( event.point );
	if( values.bDRAG && rasterValid ) {
		DelaunayPoint( pt );
	}
}

function onMouseUp(event) {
	createFaces(triangles);
}




// ------------------------------------------------------------------------
// Invocation
// ------------------------------------------------------------------------
Setup();
Update(event);
//Draw();




/**
 *	
 *	Delaunay Triangulation
 *	Joshua Bell
 *	inexorabletash@hotmail.com
 *
 *	http://www.travellermap.com/
 *	Inspired by: http://www.codeguru.com/cpp/data/mfc_database/misc/article.php/c8901/
 * 
 *	Modifications for specific use with Scriptographer, Ken Frederick
 *	http://kennethfrederick.de/
 *	http://blog.kennethfrederick.de/
 *
 *	Validated with JSLint, http://www.jslint.com
 *
 *	This work is hereby released into the Public Domain. To view a copy of the public 
 *	domain dedication, visit http://creativecommons.org/licenses/publicdomain/ or send 
 *	a letter to Creative Commons, 171 Second Street, Suite 300, San Francisco, 
 *	California, 94105, USA.
 *	
 */


var EPSILON = 1.0e-6;

// ------------------------------------------------------------------------
// Triangle class
// ------------------------------------------------------------------------
function Triangle( v0, v1, v2 ) {
	this.v0 = v0;
	this.v1 = v1;
	this.v2 = v2;
	this.CalcCircumcircle();
	
} // Triangle

Triangle.prototype.CalcCircumcircle = function() {
	// From: http://www.exaflop.org/docs/cgafaq/cga1.html

	var A = this.v1.x - this.v0.x; 
	var B = this.v1.y - this.v0.y; 
	var C = this.v2.x - this.v0.x; 
	var D = this.v2.y - this.v0.y; 

	var E = A*(this.v0.x + this.v1.x) + B*(this.v0.y + this.v1.y); 
	var F = C*(this.v0.x + this.v2.x) + D*(this.v0.y + this.v2.y); 

	var G = 2.0*(A*(this.v2.y - this.v1.y)-B*(this.v2.x - this.v1.x)); 
	
	var dx, dy;
	
	if( Math.abs(G) < EPSILON ) {
		// Collinear - find extremes and use the midpoint

		function max3( a, b, c ) { return ( a >= b && a >= c ) ? a : ( b >= a && b >= c ) ? b : c; }
		function min3( a, b, c ) { return ( a <= b && a <= c ) ? a : ( b <= a && b <= c ) ? b : c; }

		var minx = min3( this.v0.x, this.v1.x, this.v2.x );
		var miny = min3( this.v0.y, this.v1.y, this.v2.y );
		var maxx = max3( this.v0.x, this.v1.x, this.v2.x );
		var maxy = max3( this.v0.y, this.v1.y, this.v2.y );

		this.center = new Point( ( minx + maxx ) / 2, ( miny + maxy ) / 2 );

		dx = this.center.x - minx;
		dy = this.center.y - miny;
	
	} else {
		var cx = (D*E - B*F) / G; 
		var cy = (A*F - C*E) / G;

		this.center = new Point( cx, cy );

		dx = this.center.x - this.v0.x;
		dy = this.center.y - this.v0.y;
	}

	this.radius_squared = dx * dx + dy * dy;
	this.radius = Math.sqrt( this.radius_squared );
}; // CalcCircumcircle

Triangle.prototype.InCircumcircle = function( v ) {
	var dx = this.center.x - v.x;
	var dy = this.center.y - v.y;
	var dist_squared = dx * dx + dy * dy;
	return ( dist_squared <= this.radius_squared );
}; // InCircumcircle


// ------------------------------------------------------------------------
// Edge class
// ------------------------------------------------------------------------
function Edge( v0, v1 ) {
	this.v0 = v0;
	this.v1 = v1;
} // Edge


/**
 *	Triangulate
 *	Perform the Delaunay Triangulation of a set of vertices.
 *
 *	vertices: Array of Point objects
 *	returns: Array of Triangles
 *
 */
function Triangulate( vertices ) {
	var triangles = [];

	// First, create a "supertriangle" that bounds all vertices
	var st = CreateBoundingTriangle( vertices );

	triangles.push( st );

	// Next, begin the triangulation one vertex at a time
	var i;
	for( i in vertices ) {
		// NOTE: This is O(n^2) - can be optimized by sorting vertices
		// along the x-axis and only considering triangles that have 
		// potentially overlapping circumcircles

		var vertex = vertices[i];
		AddVertex( vertex, triangles );
	}

	// Remove triangles that shared edges with "supertriangle"
	for( i in triangles ) {
		var triangle = triangles[i];

		if( triangle.v0 == st.v0 || triangle.v0 == st.v1 || triangle.v0 == st.v2 ||
			triangle.v1 == st.v0 || triangle.v1 == st.v1 || triangle.v1 == st.v2 ||
			triangle.v2 == st.v0 || triangle.v2 == st.v1 || triangle.v2 == st.v2 ) {
			delete triangles[i];
		}
	}

	return triangles;
	
} // Triangulate


// Internal: create a triangle that bounds the given vertices, with room to spare
function CreateBoundingTriangle( vertices ) {
	// NOTE: There's a bit of a heuristic here. If the bounding triangle 
	// is too large and you see overflow/underflow errors. If it is too small 
	// you end up with a non-convex hull.
	
	var minx, miny, maxx, maxy;
	for( var i in vertices ) {
		var vertex = vertices[i];
		if( minx === undefined || vertex.x < minx ) { minx = vertex.x; }
		if( miny === undefined || vertex.y < miny ) { miny = vertex.y; }
		if( maxx === undefined || vertex.x > maxx ) { maxx = vertex.x; }
		if( maxy === undefined || vertex.y > maxy ) { maxy = vertex.y; }
	}

	var dx = ( maxx - minx ) * 10;
	var dy = ( maxy - miny ) * 10;
	
	var stv0 = new Point( minx - dx,   miny - dy*3 );
	var stv1 = new Point( minx - dx,   maxy + dy   );
	var stv2 = new Point( maxx + dx*3, maxy + dy   );

	return new Triangle( stv0, stv1, stv2 );
	
} // CreateBoundingTriangle


// Internal: update triangulation with a vertex 
function AddVertex( vertex, triangles ) {
	var edges = [];
	
	// Remove triangles with circumcircles containing the vertex
	var i;
	for( i in triangles ) {
		var triangle = triangles[i];

		if( triangle.InCircumcircle( vertex ) ) {
			edges.push( new Edge( triangle.v0, triangle.v1 ) );
			edges.push( new Edge( triangle.v1, triangle.v2 ) );
			edges.push( new Edge( triangle.v2, triangle.v0 ) );
			delete triangles[i];
		}
	}

	edges = UniqueEdges( edges );

	// Create new triangles from the unique edges and new vertex
	for( i in edges ) {
		var edge = edges[i];
		triangles.push( new Triangle( edge.v0, edge.v1, vertex ) );
	}	
} // AddVertex


// Internal: remove duplicate edges from an array
function UniqueEdges( edges ) {
	// TODO: This is O(n^2), make it O(n) with a hash or some such
	var uniqueEdges = [];
	for( var i in edges ) {
		var edge1 = edges[i];
		var unique = true;

		for( var j in edges ) {
			if( i != j ) {
				var edge2 = edges[j];
				if( ( edge1.v0 == edge2.v0 && edge1.v1 == edge2.v1 ) ||
					( edge1.v0 == edge2.v1 && edge1.v1 == edge2.v0 ) ) {
					unique = false;
					break;
				}
			}
		}
		
		if( unique ) {
			uniqueEdges.push( edge1 );
		}
	}

	return uniqueEdges;
} // UniqueEdges



