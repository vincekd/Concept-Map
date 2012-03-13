jQuery.noConflict();
function Circle( id, x, y, canvas ){
    "use strict";
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = canvas.r;
    this.d = (this.r*2);
    this.m_r = (this.r + (this.r/4));
    this.canvas = canvas.canvas;
    this.connections = [];
    this.txt = "";
    this.menu = false;
    this.deleted = false;
    this.created = (new Date()).getTime();
    this.txt_added= false;
    this.adefault = false;

    this.drawCircle = function( ){
	var that = this;
	that.menu = false;
	if(that.canvas.getContext){
	    var ctx = that.canvas.getContext("2d");
	    ctx.beginPath()
	    //var grd = ctx.createRadialGradient( that.x, that.y, 0, that.x, that.y, that.r );
	    //grd.addColorStop( 0,"#F0F0F0" );
	    //grd.addColorStop( 1, "#F0F0F0" );
	    //ctx.fillStyle=grd;
	    ctx.fillStyle = "#F0F0F0";
	    ctx.strokeStyle = "#944";
	    ctx.moveTo( (that.x+that.r), that.y );
	    ctx.arc( that.x, that.y, that.r, 0, (Math.PI*2), false );
	    ctx.lineWidth = 3;
	    ctx.stroke();
	    ctx.fill();
	    ctx.closePath();
	}
    };

    this.writeText = function( ){
	var that = this;
	var LINE_HEIGHT = 15;
	if(that.canvas.getContext){
	    var ctx = that.canvas.getContext("2d");
	    ctx.beginPath()
	    ctx.fillStyle = "#000000";
	    //ctx.font = "13px Monospace";
	    ctx.font = "13px Arial";
	    ctx.textAlign = "center";
	    ctx.textBaseline = "middle";
	    var arr = [];
	    var text = that.txt.split( " " );
	    var str = "";
	    while( text.length > 0 ){
		while( ctx.measureText( str ).width < that.d && text.length > 0 ){
		    str += text.shift() + " ";
		}
		arr.push( str.replace( /\s+$/, "" ) );
		str = "";
	    }

	    //non-general
	    switch( arr.length ){
	    case 1:
		y = that.y;
		break;
	    case 2:
		y = that.y - (LINE_HEIGHT/2);
		break;
	    case 3:
		y = that.y - LINE_HEIGHT;
		break;
	    case 4:
		y = that.y - (LINE_HEIGHT/2)*(arr.length-1);
		break;
	    default:
		y = that.y - (LINE_HEIGHT/2)*4;
	    }

	    for( var i = 0; i < arr.length && i <= 4; i ++ ){
		ctx.fillText( arr[i], that.x, y );
		y += LINE_HEIGHT;
	    }
	    ctx.closePath();
	}
    };

    this.drawMenu = function( ){
	var that = this;
	that.menu = true;
	if(that.canvas.getContext){
	    var ctx = that.canvas.getContext("2d");
	    ctx.beginPath();
	    var grd = ctx.createRadialGradient( that.x, that.y, 0, that.x, that.y, that.m_r );
	    grd.addColorStop( 0,"#CCC" );
	    grd.addColorStop( 1, "#944" );
	    ctx.fillStyle=grd;
	    ctx.strokeStyle = "#000";
	    ctx.moveTo( (that.x + that.m_r), that.y );
	    ctx.arc( that.x, that.y, that.m_r, 0, (Math.PI*2), false );
	    ctx.lineWidth = 3;
	    ctx.stroke();
	    ctx.fill();
	    ctx.closePath();

	    ctx.beginPath();
	    ctx.strokeStyle = "#000";
	    ctx.lineWidth = 3;
	    ctx.moveTo( that.x, that.y );
	    ctx.lineTo( that.x, that.y + that.m_r );
	    ctx.moveTo( that.x, that.y );
	    var xx = that.m_r * (Math.cos( 210 * Math.PI / 180 )) + that.x;
	    var yy = that.m_r * (Math.sin( 210 * Math.PI / 180 )) + that.y;
	    ctx.lineTo( xx, yy ); // upper right
	    ctx.moveTo( that.x, that.y );
	    xx = that.m_r * (Math.cos( 330 * Math.PI / 180 )) + that.x;
	    yy = that.m_r * (Math.sin( 330 * Math.PI / 180 )) + that.y;
	    ctx.lineTo( xx, yy ); // upper left
	    ctx.stroke();
	    ctx.closePath();
	    
	    ctx.beginPath();
	    ctx.fillStyle = "#000000";
	    //ctx.font = "16px Monospace";
	    ctx.font = "14px Arial";
	    ctx.textAlign = "center";
	    ctx.textBaseline = "top";
	    ctx.fillText( "Connect", that.x, that.y - 35 );
	    ctx.closePath();

	    ctx.beginPath();
	    ctx.fillStyle = "#000000";
	    //ctx.font = "16px Monospace";
	    ctx.font = "14px Arial";
	    ctx.textAlign = "center";
	    ctx.textBaseline = "bottom";
	    ctx.fillText( "Text", that.x - 25, that.y + 20 );
	    ctx.closePath();

	    ctx.beginPath();
	    ctx.fillStyle = "#000000";
	    //ctx.font = "16px Monospace";
	    ctx.font = "14px Arial";
	    ctx.textAlign = "center";
	    ctx.textBaseline = "bottom";
	    ctx.fillText( "Delete", that.x + 25, that.y + 20 );
	    ctx.closePath();
	}
    };
}



function Canvas( id ){
    "use strict";
    this.id = 100;
    this.r = 40;
    this.d = (this.r*2);
    this.canvas = document.getElementById( id );
    this.w = jQuery(this.canvas).width();
    this.h = jQuery(this.canvas).height();
    this.nodes = {};
    this.cur = {};
    this.editable = true;

    this.getCirclePoints = function getCirclePoints( x1, y1, x2, y2, r, h ){
	var y1_t = h - y1;
	var y2_t = h - y2;
	var angle = Math.atan2( (y2_t - y1_t), (x2-x1) );
	angle = ((angle < 0) ? Math.abs( angle ) : 2 * Math.PI - angle);
	var angle2 = Math.atan2( (y1_t - y2_t), (x1-x2) );
	angle2 = ((angle2 < 0) ? Math.abs( angle2 ) : 2 * Math.PI - angle2);
	return {
	    "x1" : (x1 + r * Math.cos( angle )),
	    "y1" : (y1 + r * Math.sin( angle )),
	    "x2" : (x2 + r * Math.cos( angle2 )),
	    "y2" : (y2 + r * Math.sin( angle2 ))
	};
    }

    function getDistance( x1, y1, x2, y2 ){
	return Math.sqrt( Math.pow( Math.abs( x1 - x2 ), 2 ) + Math.pow( Math.abs( y1 - y2 ), 2 ) );
    }

    this.draw = function( ){
	var that = this;
	if(that.canvas.getContext){
	    var ctx = that.canvas.getContext("2d");
	    that.canvas.width = that.w;
	    ctx.beginPath();
	    ctx.fillStyle = "#FFF";
	    ctx.fillRect( 0, 0, that.w, that.h );
	    ctx.fill();
	    ctx.closePath();
	    for( var i in that.nodes ){
		if( that.nodes[i].deleted === false ){
		    for( var j = 0; j < that.nodes[i].connections.length; j ++ ){
			var othCir = that.nodes[that.nodes[i].connections[j]];
			if( othCir.deleted === false ){

			    var distance = getDistance( that.nodes[i].x, that.nodes[i].y, othCir.x, othCir.y );

			    if( distance > that.d ){
				that.drawLine( that.getCirclePoints( that.nodes[i].x, that.nodes[i].y,
								othCir.x, othCir.y, canvas.r, canvas.h ) );
			    }
			}
		    }
		}
	    }
	    for( var i in that.nodes ){
		if( that.nodes[i].deleted === false ){
		    that.nodes[i].drawCircle();
		    if( that.nodes[i].txt !== "" && that.nodes[i] !== canvas.cur.c ){
			that.nodes[i].writeText();
		    }
		}
	    }
	}
    };

    this.replay = function( ){
	var that = this, done = false,
	ordered = [], sleep = 1000,
	start, node, i, doneArr = [];
	for( i in that.nodes ){
	    node = that.nodes[i];
// 	    if( node.adefault === true ){
// 		doneArr.push({
// 		    'time' : node.created,
// 		    'cod' : 'created',
// 		    'node' : node
// 		});
// 		if( !!node.txt ){
// 		    doneArr.push({
// 			'time' : node.txt_added,
// 			'cod' : 'text_added',
// 			'node' : node
// 		    });
// 		}
// 	    } else {
		ordered.push({
		    'time' : node.created,
		    'cod' : 'created',
		    'node' : node
		});
		if( node.deleted !== false ){
		    ordered.push({
			'time' : node.deleted,
			'cod' : 'deleted',
			'node' : node
		    });
		}
		if( !!node.txt ){
		    ordered.push({
			'time' : node.txt_added,
			'cod' : 'text_added',
			'node' : node
		    });
		}
//	    }
	}
	
	ordered = ordered.sort(function( n1, n2 ){
	    return n2.time - n1.time;
	});
	that.canvas.width = that.w;
	if( !!window.timedCanvas && !!window.timedCanvas.time ){
	    window.clearTimeout( window.timedCanvas.time );
	}
	window.timedCanvas = {};
	window.timedCanvas.timePlay = function(){
	    var i, next = ordered.pop();
	    //if no more elements in arr
	    if( next === undefined || next === null ){
		window.clearTimeout( window.timedCanvas.time );
		that.draw();
		window.timedCanvas = null;
		return;
	    } else if( next.cod === "created" ){
		doneArr.push( next );
		next.node.drawCircle();
	    } else if( next.cod === "deleted" ){
		that.canvas.width = that.w;
		for( i = 0; i < doneArr.length; i++ ){
		    if( doneArr[i].node !== next.node ){
			if( doneArr[i].cod === "created" ){
			    doneArr[i].node.drawCircle();
			} else if( doneArr[i].cod === "text_added" ){
			    doneArr[i].node.writeText();
			}
		    }
		}
	    } else if( next.cod === "text_added" ){
		doneArr.push( next );
		next.node.writeText();
	    }
	    window.timedCanvas.time = 
		window.setTimeout( "window.timedCanvas.timePlay()", sleep );
	}
	window.timedCanvas.timePlay();
    };

    this.getId = function(){
	return this.id++;
    };

    this.drawLine = function( obj ){
	var that = this;
	if(that.canvas.getContext){
	    var ctx = that.canvas.getContext("2d");
	    ctx.beginPath();
	    ctx.strokeStyle = "#944";
	    //ctx.strokeStyle = "#000000";
	    ctx.lineWidth = 6;
	    ctx.moveTo( obj.x1, obj.y1 );
	    ctx.lineTo( obj.x2, obj.y2 );
	    ctx.stroke();
	    ctx.fill();
	    ctx.closePath();
	    
	    //add arrow head
	    // 	    ctx.beginPath();
	    // 	    ctx.strokeStyle = "#000000";
	    // 	    ctx.lineWidth = 4;
	    // 	    var _x_ = obj.x2 - obj.x1;
	    // 	    var _y_ = obj.y2 - obj.y1;
	    // 	    var slope = (_y_ / _x_);
	    // 	    var line = getCirclePoints( obj.x1, obj.y1, obj.x2, obj.y2, 10, canvas.h );
	    // 	    ctx.moveTo( obj.x2, obj.y2 );
	    // 	    ctx.lineTo( line.x2-(10), line.y2 );
	    // 	    ctx.moveTo( obj.x2, obj.y2 );
	    // 	    ctx.lineTo( line.x2+(10), line.y2 );
	    // 	    ctx.stroke();
	    // 	    ctx.fill();
	    // 	    ctx.closePath();
	}
    };

    this.drawOverlay = function(){
	var that = this;
	if(that.canvas.getContext){
	    var ctx = that.canvas.getContext("2d");
	    ctx.beginPath();
	    ctx.fillStyle = "rgba(0,0,0,.5)";
	    ctx.fillRect( 0, 0, that.w, that.h );
	    ctx.fill();
	    ctx.closePath();
	}
    };

    this.deleteNode = function( n ){
	var that = this;
	if( !that.nodes[n].adefault || that.delete_defaults || !!window.concept_admin ){
	    that.nodes[n].deleted = (new Date()).getTime();
	}
    };
    
    this.checkCircles = function( x, y ){
	var that = this;
	var check;
	var distance;
	for( var i in that.nodes ){
	    if( that.nodes[i].deleted === false ){
		check = that.nodes[i].r;
		if( that.nodes[i].menu ){
		    check = that.nodes[i].m_r;
		}
		distance = Math.sqrt( Math.pow( Math.abs( that.nodes[i].x - x ), 2 ) +
				      Math.pow( Math.abs( that.nodes[i].y - y ), 2 ) );

		if( distance < check ){
		    return that.nodes[i];
		}
	    }
	}
	return false;
    };

    this.jsonify = function(){
	var that = this;
	var arr = [];
	for( var i in that.nodes ){
	    arr.push({
		"id" : that.nodes[i].id,
		"x" : that.nodes[i].x,
		"y" : that.nodes[i].y,
		"txt" : that.nodes[i].txt,
		"connections" : that.nodes[i].connections,
		"deleted" : that.nodes[i].deleted,
		"created" : that.nodes[i].created,
		"txt_added" : that.nodes[i].txt_added,
		"adefault" : that.nodes[i].adefault
	    });

	}
	return JSON.stringify( { "arr" : arr, "editable" : that.editable } );
    };

    this.fromJson = function( json ){
	var that = this;
	var obj = JSON.parse( json );
	var arr = (typeof obj.arr === "string")?JSON.parse(obj.arr):obj.arr;
	that.editable = obj.editable;
	that.delete_defaults = obj.delete_defaults;
	for( var i = 0; i < arr.length; i ++ ){
	    var cir = arr[i];
	    that.nodes[cir.id] = new Circle( cir.id, cir.x, cir.y, that );
	    that.nodes[cir.id].connections = cir.connections;
	    that.nodes[cir.id].txt = cir.txt;
	    that.nodes[cir.id].deleted = cir.deleted;
	    that.nodes[cir.id].created = cir.created;
	    that.nodes[cir.id].txt_added = cir.txt_added;
	    that.nodes[cir.id].adefault = cir.adefault;

	    if( cir.id >= that.id ){
		that.id = cir.id + 1;
	    }

	}
	that.draw();
    };

    this.checkLine = function( x, y ){
	var that = this;
	for( var i in that.nodes ){
	    if( that.nodes[i].deleted === false ){
		for( var j = 0; j < that.nodes[i].connections.length; j ++ ){
		    var othCir = that.nodes[that.nodes[i].connections[j]];
		    if( othCir.deleted === false ){
			var obj = that.getCirclePoints( that.nodes[i].x, that.nodes[i].y,
							othCir.x, othCir.y, canvas.r, canvas.h );
			var ab = getDistance( x, y, obj.x1, obj.y1 );
			var ac = getDistance( x, y, obj.x2, obj.y2 );
			var bc = getDistance( obj.x1, obj.y1, obj.x2, obj.y2 );
			var epsilon = .5;
			if( Math.abs( ( ab + ac ) - bc ) < epsilon ){
			    return { "from" : that.nodes[i].id, "to" : othCir.id };
			}
		    }
		}
	    }
	}
	return false;
    };
}

function readPopClicks( obj ){
    var $ = jQuery;
    $(document).bind( "click", function( event ){
	if( event.button !== 0 ){
	    return;
	}
	event.preventDefault();
	event.stopPropagation();
	if( event.target.id === "canvas" || event.target.id === "quit" ){
	    $(document).unbind( "click" );
	    $("#text-box").fadeOut( "fast", function(){
		$("#add_text").hide();
		$("#justify_connect").hide();
		$("#delete_connect").hide();
	    });
	    return false;
	} else if( event.target.id === "submit" && $("#add_text").is( ":visible" ) ){
	    $(document).unbind( "click" );
	    canvas.cur.con.txt = $("#text-input").val();
	    canvas.cur.con.txt_added = (new Date()).getTime();
	    $("#text-box").fadeOut( "fast", function(){
		$("#text-input").val( "" );
		$("#add_text").hide();
	    });
	    canvas.cur = {};
	    canvas.draw();
	} else if( event.target.id === "submit" && $("#justify_connect").is( ":visible" ) ){
	    $(document).unbind( "click" );
	    $("#text-box").fadeOut( "fast", function(){
		$("#text-input").val( "" );
		$("#justify_connect").hide();
	    });
	    canvas.cur = {};
	    canvas.draw();
	} else if( event.target.id === "submit" && $("#delete_connect").is( ":visible" ) ){
	    $(document).unbind( "click" );
	    var line = obj;
	    var index = canvas.nodes[line.from].connections.indexOf( line.to );
	    canvas.nodes[line.from].connections.splice( index, 1 );
	    $("#text-box").fadeOut( "fast", function(){
		$("#text-input").val( "" );
		$("#delete_connect").hide();
	    });
	    canvas.cur = {};
	    canvas.draw();	    
	}
    });
}

function getMenuBox( x, y, obj ){
    var el = jQuery("#text-box");
    el.css({ "left" : x - (el.outerWidth()/2),
	     "top" : y - (el.outerHeight()/2) });
    el.fadeIn("fast", function( event ){
	jQuery("#text-input").focus();
	readPopClicks( obj );
    });
}

function onReady( ){
    var $ = window.jQuery;
    window.canvas = new Canvas( 'canvas' );
    var canvas_el = '#canvas';
    var el = jQuery( '#concept_map' ) || null;
    if( el.length > 0 && el !== null ){
	var str = JSON.parse( el.val() );
	if( typeof str === "string" ){
	    canvas.fromJson( str );
	} else {
	    canvas.fromJson( el.val() );
	}
    } else {
	var els = $( '.map' );
	var val, canv, tmp;
	window.canvi = {};
	for( var i = 0; i < els.length; i++ ){
	    el = $(els[i]);
	    val = el.find( '.map_values' ).val();
	    canv = el.find( '.canvas' ).attr( 'id' );
	    tmp = new Canvas( canv );
	    tmp.fromJson( val );
	    canvi[canv] = tmp;
	}
	jQuery(".play_button").bind( "click", function( ev ){
	    var el = jQuery( ev.currentTarget );
	    var canv  = el.parent().siblings( 'canvas' ).attr( 'id' );
	    canvi[canv].replay();
	});
	return false;
    }

    $("#text-input").bind( "keypress", function( event ){
	if( event.keyCode === 13 ){
	    event.preventDefault();
	    event.stopPropagation();
	    canvas.cur.con.txt = $("#text-input").val();
	    canvas.cur.con.txt_added = (new Date()).getTime();
	    $("#text-box").fadeOut( "fast", function(){
		$("#text-input").val( "" );
		$("#add_text").hide();
	    });
	    canvas.cur = {};
	    canvas.draw();
	    return false;
	}
    });

    $(canvas_el).bind( "dblclick", function( event ){
	if( canvas.editable || !! window.concept_admin ){
	    event.stopPropagation();
	    event.preventDefault();
	    var x = event.layerX;
	    var y = event.layerY;
	    if( canvas.checkCircles( x, y ) === false ){
		var circle = new Circle( canvas.getId(), x, y, canvas);
		canvas.nodes[circle.id] = circle;
		canvas.draw();
	    }
	}
	return false;
    });
    $(canvas_el).bind( "mousedown", function( event ){
	if( event.button !== 0 || !! canvas.cur.c ){
	    return;
	}
	var x = event.layerX;
	var y = event.layerY;
	var circ = canvas.checkCircles( x, y );
	if( circ !== false && ! circ.menu ) {
	    canvas.cur.c = circ;
	    canvas.cur.change = false;
	    $(canvas_el).bind( "mousemove", function( event  ){
		canvas.cur.c.x = event.layerX;
		canvas.cur.c.y = event.layerY;
		canvas.draw();
		canvas.cur.change = true;
	    });
	    $(document).bind( "mouseup", function( event ){
		$(canvas_el).unbind( "mousemove" );
		$(document).unbind( "mouseup" );
	    });
	}
    });
    $(canvas_el).bind( "click", function( event ){
	if( event.button !== 0 ){
	    return;
	}
	var x = event.layerX;
	var y = event.layerY;
	var circ = canvas.checkCircles( x, y );
	if( canvas.cur.change ){
	    canvas.cur.change = false;
	    delete canvas.cur.c;
	    canvas.cur = {};
	    canvas.draw();
	    return false;
	} else if( circ !== false ){
	    canvas.cur.c = circ;
	    if( canvas.cur.c.menu ){
		canvas.cur.con = canvas.cur.c;
		var y2_t = canvas.h - y;
		var y1_t = canvas.h - canvas.cur.con.y;
		var angle = Math.atan2( (y2_t - y1_t), (x - canvas.cur.con.x) );
		angle = ((angle < 0) ? Math.abs( angle ) : 2 * Math.PI - angle) * 180 / Math.PI;
		if( angle >= 210 && angle <= 330 ){
		    canvas.cur.con.menu = false;
		    $(canvas_el).bind( "mousemove", function( event ){
			var _x = event.layerX;
			var _y = event.layerY;
			var o = canvas.getCirclePoints( canvas.cur.con.x, canvas.cur.con.y, _x, _y, canvas.r, canvas.h );
			o.x2 = _x;
			o.y2 = _y;
			canvas.draw();
			canvas.drawLine( o );
		    });
		} else if( angle < 210 && angle >= 90 ){
		    $("#add_text").show();
		    $("#text-input").val( canvas.cur.con.txt );
		    getMenuBox( x, y );
		    
		} else {
		    canvas.deleteNode( canvas.cur.con.id );
		    canvas.cur = {};
		    canvas.draw();
		}
	    } else {
		if( !! canvas.cur.con ){
		    $(canvas_el).unbind( "mousemove" );
		    if( canvas.cur.con !== canvas.cur.c ){
			if( canvas.cur.con.connections.indexOf( canvas.cur.c.id ) === -1 ){
			    canvas.cur.con.connections.push( canvas.cur.c.id );
			    //to add justifications
			    //$("#justify_connect").show();
			    //getMenuBox( x, y );
			}
		    }
		    canvas.cur = {};
		    canvas.draw();
		} else {
		    canvas.draw();
		    canvas.drawOverlay();
		    canvas.cur.c.drawMenu();
		}
	    }
	} else {
	    if( !! canvas.cur.con ){
		$(canvas_el).unbind( "mousemove" );
	    }
	    canvas.cur = {};
	    canvas.draw();
	    var line = canvas.checkLine( x, y );
	    if( line !== false ){
		$("#delete_connect").show();
		getMenuBox( x, y, line );
	    }
	}
    });
}

jQuery( onReady );

function checker(id) {
    //huh?
    var emptyField = 0;
    if(emptyField === 0) {	
	// manually trigger saving image data to form field
	jQuery( '#concept_map' ).val( canvas.jsonify() );
	document.forms[0].submit();
    }
}

window.onload = function() {
    $$('.navBtn').each( function(elem) {
	$(elem).observe('click', function(event){
	    $('direction').value = Event.element(event).id;
	    checker(elem.id);
	});
    });
}