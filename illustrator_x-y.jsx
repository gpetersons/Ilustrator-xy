/*
* Description: An Adobe Illustrator script that automates measurements of objects. This is an early version that has not been sufficiently tested. Use at your own risks.
* Usage: Select 1 to 2 page items in Adobe Illustrator, then run this script by selecting File > Script > Other Scripts > (choose file)
* License: GNU General Public License Version 3. (http://www.gnu.org/licenses/gpl-3.0-standalone.html)
*
* Copyright (c) 2009. William Ngan.
* http://www.metaphorical.net
*/

// Create an empty dialog window near the upper left of the screen 
var dlg = new Window('dialog', 'Spec');
dlg.frameLocation = [100,100];
dlg.size = [250,250];

dlg.intro = dlg.add('statictext', [20,20,150,40] );
dlg.intro.text = 'First select 1 or 2 items';

dlg.where = dlg.add('dropdownlist', [20,40,150,60]);
dlg.where.selection = dlg.where.add('item', 'top');
dlg.where.add('item', 'bottom');
dlg.where.add('item', 'left');
dlg.where.add('item', 'right');

dlg.btn = dlg.add('button', [20,70,150,90], 'Specify', 'spec');


// document
var doc = activeDocument;

// spec layer
try {
	var speclayer =doc.layers['Izmers'];
} catch(err) {
	var speclayer = doc.layers.add();
	speclayer.name = 'Izmers';
}

// measurement line color
var color = new RGBColor;
color.green = 255;
color.blue = 0;

// gap between measurement lines and object
var gap = 5;

// size of measurement lines.
var size = 10;


// ----------------------------------------------------------------------------------------------------------------------------------------

	if (doc.selection.length==1) {
		specSingle( doc.selection[0].geometricBounds, "top" );
		specSingle( doc.selection[0].geometricBounds, "left" );
//		specSingle( doc.selection[0].geometricBounds, "bottom" );
//		specSingle( doc.selection[0].geometricBounds, "right" );
	} else if (doc.selection.length==2) {
		dlg.btn.addEventListener ('click', startSpec );
		dlg.show();
	} else {
			alert('please select 1 or 2 items');
	}

// ----------------------------------------------------------------------------------------------------------------------------------------


/**
	Start the spec
*/
function startSpec() {
	specDouble( doc.selection[0], doc.selection[1], dlg.where.selection.text );
	dlg.close ();
}


/**
	Spec the gap between 2 elements
*/
function specDouble( item1, item2, where ) {
	
	var bound = new Array(0,0,0,0);

	var a =  item1.geometricBounds;
	var b =  item2.geometricBounds;
	
	if (where=='top' || where=='bottom') {
		
		if (b[0]>a[0]) { // item 2 on right,
			
			if (b[0]>a[2]) { // no overlap
				bound[0] =a[2];
				bound[2] = b[0];
			} else { // overlap
				bound[0] =b[0];
				bound[2] = a[2];
			}
		} else if (a[0]>=b[0]){ // item 1 on right
			
			if (a[0]>b[2]) { // no overlap
				bound[0] =b[2];
				bound[2] = a[0];
			} else { // overlap
				bound[0] =a[0];
				bound[2] = b[2];
			}
		}

		bound[1] = Math.max (a[1], b[1]);
		bound[3] = Math.min (a[3], b[3]);
		
	} else {
		
		if (b[3]>a[3]) { // item 2 on top
			if (b[3]>a[1]) { // no overlap
				bound[3] =a[1];
				bound[1] = b[3];
			} else { // overlap
				bound[3] =b[3];
				bound[1] = a[1];
			}
		} else if (a[3]>=b[3]){ // item 1 on top
			
			if (a[3]>b[1]) { // no overlap
				bound[3] =b[1];
				bound[1] = a[3];
			} else { // overlap
				bound[3] =a[3];
				bound[1] = b[1];
			}
		}
		
		bound[0] = Math.min(a[0], b[0]);
		bound[2] = Math.max (a[2], b[2]);
	}
	specSingle(bound, where );
}


/**
	spec a single object
	@param bound item.geometricBound
	@param where 'top', 'bottom', 'left,' 'right'
*/
function specSingle( bound, where ) {

	var ptWidth = bound[2] - bound[0];
	var ptHeight = bound[1] - bound[3];
	var tmpWidth = Math.round(ptWidth / 0.02834645);
	var tmpHeight = Math.round(ptHeight / 0.02834645);
	var w = tmpWidth / 100;
	var h = tmpHeight / 100;
	var xCentre = bound[0] + (ptWidth / 2);
	var yCentre = bound[1] - (ptHeight / 2);

	// a & b are the horizontal or vertical positions that change
	// c is the horizontal or vertical position that doesn't change
	var a = bound[0];
	var b = bound[2];
	var c = bound[1];
	
	// xy='x' (horizontal measurement), xy='y' (vertical measurement)
	var xy = 'x';
	
	// a direction flag for placing the measurement lines.
	var dir = 1;
	
	switch( where ) {
		case 'top':
			a = bound[0];
			b = bound[2];
			c = bound[1];
			xy = 'x';
			dir = 1;
			break;
		case 'bottom':
			a = bound[0];
			b = bound[2];
			c = bound[3];
			xy = 'x';
			dir = -1;
			break;
		case 'left':
			a = bound[1];
			b = bound[3];
			c = bound[0];
			xy = 'y';
			dir = -1;
			break;
		case 'right':
			a = bound[1];
			b = bound[3];
			c = bound[2];
			xy = 'y';
			dir = 1;
			break;
	}

	// create the measurement lines
	var lines = new Array(); 
	
	// horizontal measurement
	if (xy=='x') {
		
		// 2 vertical lines    |                      |
		
		lines[0]= new Array( new Array(a, c+(gap)*dir) );
		lines[0].push ( new Array(a, c+(gap+size)*dir) );
		lines[1]= new Array( new Array(b, c+(gap)*dir) );
		lines[1].push( new Array(b, c+(gap+size)*dir) );
		
		// 1 horizontal line   ________        _________
		
		lines[2]= new Array( new Array(xCentre + 30, c+(gap+size/2)*dir ) );
		lines[2].push( new Array(b, c+(gap+size/2)*dir ) );
		
		lines[3]= new Array( new Array(a, c+(gap+size/2)*dir ) );
		lines[3].push( new Array(xCentre - 30, c+(gap+size/2)*dir ) );	
		
		
		// create text label
		if (where=='top') {
			var t = specLabel( w, (a+b)/2, lines[0][1][1] );
		} else {
			var t = specLabel( w, (a+b)/2, lines[0][0][1] );
		}
		
		
	// vertical measurement
	} else {
		
		// 2 horizontal lines   |                      |
		//
		lines[0]= new Array( new Array( c+(gap)*dir, a) );
		lines[0].push ( new Array( c+(gap+size)*dir, a) );
		lines[1]= new Array( new Array( c+(gap)*dir, b) );
		lines[1].push( new Array( c+(gap+size)*dir, b) );


		//vertical line  ________        _________
		//
		lines[2]= new Array( new Array(c+(gap+size/2)*dir, yCentre - 30) );
		lines[2].push( new Array(c+(gap+size/2)*dir, b) );
		
		lines[3]= new Array( new Array(c+(gap+size/2)*dir, a) );
		lines[3].push( new Array(c+(gap+size/2)*dir, yCentre + 30) );
		
		// create text label
		if (where=='left') {
			var t = specLabel( h, c-(gap+size), yCentre, true );
			t.left += t.width/2;
		} else {
			var t = specLabel( h, c+(gap+size), yCentre, true );
			t.left -= t.width/2;
		}
		t.top += t.width/2;
	}
	
	var specgroup = new Array(t);
	
	// draw the lines
	for (var i=0; i<lines.length; i++) {
		var p = doc.pathItems.add();
		p.setEntirePath ( lines[i] );
		setLineStyle( p, color );
		specgroup.push( p );
	}

	group(speclayer, specgroup );

}


/**
	Create a text label that specify the dimension
*/
function specLabel( val, x, y, rotate) {
		
		var t = doc.textFrames.add();
		t.textRange.characterAttributes.size = 8;
		t.textRange.characterAttributes.alignment = StyleRunAlignmentType.center;
		var v = val + " mm";
		t.contents = v;
		t.top = y;
		t.left = x;
		t.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;
		if (rotate==true) {
			t.rotate (90);
		}
		return t;
}


function setLineStyle(path, color) {
		path.filled = false;
		path.stroked = true;
		path.strokeColor = color;
		path.strokeWidth = 0.5;
		return path;
}


/**
* Group items in a layer
*/
function group( layer, items, isDuplicate) {
	
	// create new group
	var gg = layer.groupItems.add();

	// add to group
	// reverse count, because items length is reduced as items are moved to new group
	for(var i=items.length-1; i>=0; i--) {
	
		if (items[i]!=gg) { // don't group the group itself
			if (isDuplicate) {
				newItem = items[i].duplicate (gg, ElementPlacement.PLACEATBEGINNING);
			} else {
				items[i].move( gg, ElementPlacement.PLACEATBEGINNING );
			}
		}
	}
	return gg;
}
