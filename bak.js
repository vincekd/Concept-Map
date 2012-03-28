jQuery.noConflict();
function Concept_Map_Canvas( id ){
    "use strict";
    this.canvas = document.getElementById( id );
    (function(canvas, that, window, $){
	that.id = 100;
	that.r = 40;
	that.d = (that.r*2);
	that.w = canvas.width;
	that.h = canvas.height;
	that.nodes = {};
	that.cur = {};
	that.editable = true;

	//TODO: read in old items
	//TODO: separate from jQuery?

	// var el = jQuery( '#concept_map' ) || null;
	// if( el.length > 0 && el !== null ){
	// 	var str = JSON.parse( el.val() );
	// 	if( typeof str === "string" ){
	// 	    canvas.fromJson( str );
	// 	} else {
	// 	    canvas.fromJson( el.val() );
	// 	}
	// } else {
	// 	var els = $( '.map' );
	// 	var val, canv, tmp;
	// 	window.canvi = {};
	// 	for( var i = 0; i < els.length; i++ ){
	// 	    el = $(els[i]);
	// 	    val = el.find( '.map_values' ).val();
	// 	    canv = el.find( '.canvas' ).attr( 'id' );
	// 	    tmp = new Concept_Map_Canvas( canv );
	// 	    tmp.fromJson( val );
	// 	    canvi[canv] = tmp;
	// 	}

	// 	return false;
	// }

	//TODO: rename .play_button class
	$(".play_button").bind( "click", function( ev ){
	    var controls, canv, el = $( ev.currentTarget );
	    controls = el.parent();
	    canv = controls.siblings( 'canvas' ).attr( 'id' );
	    window[canv].replay();
	    controls.html( buildControls( window.timedCanvas.ordered_list.length, canv ) );
	});

	//TODO: rename text-input
	$("#text-input").bind( "keypress", function( event ){
	    if( event.keyCode === 13 ){
		event.preventDefault();
		event.stopPropagation();
		that.cur.con.txt = $("#text-input").val();
		that.cur.con.txt_added = (new Date()).getTime();
		$("#text-box").fadeOut( "fast", function(){
		    $("#text-input").val( "" );
		    $("#add_text").hide();
		});
		that.cur = {};
		that.draw();
		return false;
	    }
	});

	$(that.canvas).bind( "dblclick", function( event ){
	    if( that.editable ){
		event.stopPropagation();
		event.preventDefault();
		var x = event.offsetX;
		var y = event.offsetY;
		if( that.checkCircles( x, y ) === false ){
		    var circle = new Circle( that.getId(), x, y, that );
		    that.nodes[circle.id] = circle;
		    that.draw();
		}
	    }
	    return false;
	});
	$(that.canvas).bind( "mousedown", function( event ){
	    if( event.button !== 0 || !! that.cur.c ){
		return;
	    }
	    var x = event.offsetX;
	    var y = event.offsetY;
	    var circ = that.checkCircles( x, y );
	    if( circ !== false && ! circ.menu ) {
		that.cur.c = circ;
		that.cur.change = false;
		$(that.canvas).bind( "mousemove", function( event  ){
		    that.cur.c.x = event.offsetX;
		    that.cur.c.y = event.offsetY;
		    that.draw();
		    that.cur.change = true;
		});
		$(document).bind( "mouseup", function( event ){
		    $(that.canvas).unbind( "mousemove" );
		    $(document).unbind( "mouseup" );
		});
	    }
	});

	$(that.canvas).bind( "click", function( event ){

	    if( event.button !== 0 ){
		return;
	    }
	    var x = event.offsetX;
	    var y = event.offsetY;
	    var circ = that.checkCircles( x, y );
	    if( that.cur.change ){
		that.cur.change = false;
		delete that.cur.c;
		that.cur = {};
		that.draw();
		return false;
	    } else if( circ !== false ){
		that.cur.c = circ;
		if( that.cur.c.menu ){
		    that.cur.con = that.cur.c;
		    var y2_t = that.h - y;
		    var y1_t = that.h - that.cur.con.y;
		    var angle = Math.atan2( (y2_t - y1_t), (x - that.cur.con.x) );
		    angle = ((angle < 0) ? Math.abs( angle ) : 2 * Math.PI - angle) * 180 / Math.PI;
		    if( angle >= 210 && angle <= 330 ){ //connect
			that.cur.con.menu = false;
			$(that.canvas).bind( "mousemove", function( event ){
			    var _x = event.offsetX;
			    var _y = event.offsetY;
			    var o = that.getCirclePoints( that.cur.con.x, that.cur.con.y,
							    _x, _y, that.r, that.h );
			    o.x2 = _x;
			    o.y2 = _y;
			    that.draw();
			    that.drawLine( o );
			});
		    } else if( angle < 210 && angle >= 90 ){ //text
			$("#add_text").show();
			$("#text-input").val( that.cur.con.txt );
			that.getMenuBox( x, y );
			
		    } else { //delete
			that.deleteNode( that.cur.con.id );
			that.cur = {};
			that.draw();
		    }
		} else {
		    if( !! that.cur.con ){
			$(that.canvas).unbind( "mousemove" );
			if( that.cur.con !== that.cur.c ){
			    if( that.cur.con.connections[that.cur.c.id] === undefined ){
				that.cur.con.connections[that.cur.c.id] = (new Date()).getTime();
			    }
			}
			that.cur = {};
			that.draw();
		    } else {
			that.draw();
			that.drawOverlay();
			that.cur.c.drawMenu();
		    }
		}
	    } else {
		if( !! that.cur.con ){
		    $(that.canvas).unbind( "mousemove" );
		}
		that.cur = {};
		that.draw();
		var line = that.checkLine( x, y );
		if( line !== false ){
		    $("#delete_connect").show();
		    that.getMenuBox( x, y, line );
		}
	    }
	});

	function buildControls( num, cm_id ){
	    var i, div = $('<table />').addClass("_cm_controls"),
	    ul = $('<tr />').addClass("list"),
	    butt = $('<td />').attr( 'id', "_cm_canvas_" + cm_id + "pause" ).
		text( "Pause" ).addClass( "_cm_canvas_pause" ).
		bind( "click", function( ev ){
		    var el = jQuery(ev.currentTarget);
		    if( el.text() === "Pause" ){
			window.timedCanvas.pause();
			el.text( "Play" );
		    } else {
			window.timedCanvas.start();
			el.text( "Pause" );
		    }
		});
	    ul.append( butt );
	    for( i = 1; i <= num; i++ ){
		var el = $('<td/>').attr( 'id', ("_cm_canvas_" + cm_id + "seg" + i) ).
		    html( "&bull;" );
		el.bind( "click", function( ev ){
		    var el = jQuery(ev.currentTarget);
		    var num = parseInt( el.attr( 'id' ).replace( /.*seg/, "" ), 10 );
		    window.timedCanvas.controller( num );
		});
		ul.append( el );
	    }
	    div.append( ul );
	    return div;
	}
    }(this.canvas, this, window, window.jQuery));

    this.getCirclePoints = function( x1, y1, x2, y2, r, h ){
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
    
    this.connectCircles = function( from, to ){
	var that = this,
	distance = getDistance( from.x, from.y, to.x, to.y );
	if( distance > that.d ){
	    that.drawLine( that.getCirclePoints( from.x, from.y, to.x, to.y, that.r, that.h ) );
	}
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
		    for( var j in that.nodes[i].connections ){
			var othCir = that.nodes[j];
			if( othCir.deleted === false ){

			    this.connectCircles( that.nodes[i], othCir );

			}
		    }
		}
	    }
	    for( var i in that.nodes ){
		if( that.nodes[i].deleted === false ){
		    that.nodes[i].drawCircle();
		    if( that.nodes[i].txt !== "" && that.nodes[i] !== that.cur.c ){
			that.nodes[i].writeText();
		    }
		}
	    }
	}
    };
    
    this.replay = function( ){
	var that = this, done = false,
	ordered = [], sleep,
	start, tmp, node, j, i, doneArr = [],
	defaults = [];
	for( i in that.nodes ){
	    node = that.nodes[i];
	    if( node.adefault === true ){
		defaults.push({
		    'time' : node.created,
		    'cod' : 'created',
		    'node' : node
		});
		if( !!node.txt ){
		    defaults.push({
			'time' : node.txt_added,
			'cod' : 'text_added',
			'node' : node
		    });
		}
	    } else {
		//to be replayed
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
	    }
	    for( j in node.connections ){
		ordered.push({
		    'time' : node.connections[j],
		    'cod' : 'connection',
		    'to' : j,
		    'node' : node.id
		});
	    }
	}
	
	ordered = ordered.sort(function( n1, n2 ){
	    return n1.time - n2.time;
	});

	//if already going, restart
	if( !!window.timedCanvas && !!window.timedCanvas.time ){
	    window.clearTimeout( window.timedCanvas.time );
	}

	//TODO: rename to within canvas
	//TODO: after replaying, set canvas.editable to false
	window.timedCanvas = {
	    'canv' : that,
	    'sleep' : 1000,
	    'ordered_list' : ordered,
	    'controller' : (function(){
		return function( point ){
		    //window.timedCanvas.pause();
		    window.timedCanvas.canv.canvas.width = window.timedCanvas.canv.w;
		    drawArr( defaults, window.timedCanvas.canv );
		    drawArr( ordered.slice( 0, point ), window.timedCanvas.canv );
		    window.timedCanvas.tracker( point, ordered.length );
		    window.timedCanvas.tracker_back( point );
		    window.timedCanvas.current_step = point;
		    //window.timedCanvas.start();
		};
	    }()),
	    'pause' : function(){
		var that = this;
		window.clearTimeout( that.time );
	    },
	    'stop' : function(){
		window.timedCanvas.pause();
		window.jQuery( "#_cm_canvas_" + window.timedCanvas.canv.canvas.id + "pause" ).click();
		window.timedCanvas.current_step = 0;
	    },
	    'current_step' : 0,
	    'start' : function(){
		var i, canv = that;
		//create vars instead of window.[yadda]
		if( window.timedCanvas.current_step === 0 ){
		    canv.canvas.width = that.w;
		    window.timedCanvas.tracker( 0, ordered.length );
		    drawArr( defaults ); //before start
		}
		drawArr( ordered.slice( 0, window.timedCanvas.current_step ), canv );
		window.timedCanvas.tracker_back( window.timedCanvas.current_step );
		window.timedCanvas.current_step++;
		if( window.timedCanvas.current_step <= ordered.length ){
		    window.timedCanvas.time = 
			window.setTimeout( "window.timedCanvas.start()", window.timedCanvas.sleep );
		} else {
		    window.timedCanvas.stop();
		}
	    },
	    'tracker' : function( point, num ){
		for( var i = point; i <= num; i++ ){
		    window.jQuery( "#_cm_canvas_" + window.timedCanvas.canv.canvas.id + 
				   "seg" + i ).css( "background", "#FFF" );
		}
	    },
	    'tracker_back' : function( point ){
		for( var i = 0; i <= point; i++ ){
		    window.jQuery( "#_cm_canvas_" + window.timedCanvas.canv.canvas.id + 
				   "seg" + i ).css( "background", "#944" );		    
		}
	    }
	}
	window.timedCanvas.start();

	function drawArr( arr ){
	    for( i = 0; i < arr.length; i++ ){	    
		if( arr[i].cod === "created" ){
		    arr[i].node.drawCircle();
		} else if( arr[i].cod === "text_added" ){
		    arr[i].node.writeText();
		} else if( arr[i].cod === "connection" ){
		    arguments[1].connectCircles( that.nodes[arr[i].node], that.nodes[arr[i].to] );
		} else if( arr[i].cod === "deleted" ){
		    doneArr = ordered.filter(function( element, index, array ){
			var id = arr[i].node.id;
			if( element.cod !== "connection" ){
			    return (element.node.id !== id );
			}
			return (element.node !== id && element.to !== id );
		    });
		    drawArr( defaults, arguments[1] );
		    drawArr( doneArr.slice( 0, i ), arguments[1] );
		}
	    }
	}

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
	    //ctx.strokeStyle = "#000";
	    ctx.lineWidth = 6;
	    ctx.moveTo( obj.x1, obj.y1 );
	    ctx.lineTo( obj.x2, obj.y2 );
	    ctx.stroke();
	    ctx.fill();
	    ctx.closePath();
	    
	    //add arrow head
	    // 	    ctx.beginPath();
	    // 	    ctx.strokeStyle = "#000";
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
	var i, check, distance, that = this;
	for( i in that.nodes ){
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
		for( var j in that.nodes[i].connections ){
		    var othCir = that.nodes[j];
		    if( othCir.deleted === false ){
			var obj = that.getCirclePoints( that.nodes[i].x, that.nodes[i].y,
							othCir.x, othCir.y, that.r, that.h );
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
    
    //TODO: if text-box doesn't exist, create it
    this.getMenuBox = function( x, y, obj ){
	var that = this,el = jQuery("#text-box");
	el.css({ "left" : x - (el.outerWidth()/2),
		 "top" : y - (el.outerHeight()/2) });
	el.fadeIn("fast", function( event ){
	    jQuery("#text-input").focus();
	    that.readPopClicks( obj );
	});
    };

    this.readPopClicks = function( obj ){
	var that = this,$ = jQuery;
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
		that.cur.con.txt = $("#text-input").val();
		that.cur.con.txt_added = (new Date()).getTime();
		$("#text-box").fadeOut( "fast", function(){
		    $("#text-input").val( "" );
		    $("#add_text").hide();
		});
		that.cur = {};
		that.draw();
	    } else if( event.target.id === "submit" && $("#justify_connect").is( ":visible" ) ){
		$(document).unbind( "click" );
		$("#text-box").fadeOut( "fast", function(){
		    $("#text-input").val( "" );
		    $("#justify_connect").hide();
		});
		that.cur = {};
		that.draw();
	    } else if( event.target.id === "submit" && $("#delete_connect").is( ":visible" ) ){
		$(document).unbind( "click" );
		var line = obj;
		delete that.nodes[line.from].connections[line.to];
		$("#text-box").fadeOut( "fast", function(){
		    $("#text-input").val( "" );
		    $("#delete_connect").hide();
		});
		that.cur = {};
		that.draw();	    
	    }
	});
    }

    function Circle( id, x, y, canvas ){
	"use strict";
	this.id = id;
	this.x = x;
	this.y = y;
	this.r = canvas.r;
	this.d = (this.r*2);
	this.m_r = (this.r + (this.r/4));
	this.canvas = canvas.canvas;
	this.connections = {};
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
		ctx.fillStyle = "#D0D0D0";
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
	    var xx, yy, grd, ctx, that = this;
	    that.menu = true;
	    if(that.canvas.getContext){
		ctx = that.canvas.getContext("2d");
		ctx.beginPath();
		grd = ctx.createRadialGradient( that.x, that.y, 0, that.x, that.y, that.m_r );
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
		xx = that.m_r * (Math.cos( 210 * Math.PI / 180 )) + that.x;
		yy = that.m_r * (Math.sin( 210 * Math.PI / 180 )) + that.y;
		ctx.lineTo( xx, yy ); // upper right
		ctx.moveTo( that.x, that.y );
		xx = that.m_r * (Math.cos( 330 * Math.PI / 180 )) + that.x;
		yy = that.m_r * (Math.sin( 330 * Math.PI / 180 )) + that.y;
		ctx.lineTo( xx, yy ); // upper left
		ctx.stroke();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.fillStyle = "#000";
		//ctx.font = "16px Monospace";
		ctx.font = "14px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText( "Connect", that.x, that.y - 35 );
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle = "#000";
		//ctx.font = "16px Monospace";
		ctx.font = "14px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.fillText( "Text", that.x - 25, that.y + 20 );
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle = "#000";
		//ctx.font = "16px Monospace";
		ctx.font = "14px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.fillText( "Delete", that.x + 25, that.y + 20 );
		ctx.closePath();
	    }
	};
    }  
}



jQuery(function(){
    var id = 'concept_map_canvas';
    window[id] = new Concept_Map_Canvas( id );
});