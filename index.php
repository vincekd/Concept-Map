<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/Concept-Map/concept_map.css"/>
  </head>
  <body>
    <div class="concept_map_div_class">
      <input type="hidden" class="map_values"/>
      <canvas class="_cm_canvas" id="concept_map_canvas" width="570" height="500"></canvas>
      <div id="text-box">
        <div id="add_text">
	  <input type="text" id="text-input"/><br />
	</div>
	<div id="justify_connect">
	  Why did you connect these ideas?
	  <textarea id="text_area"></textarea>
	</div>
	<div id="delete_connect">
	  Are you sure you want to delete this line?
	</div>
        <a id="quit" href="javascript:;">Cancel</a>
	<a id="submit" href="javascript:;">Submit</a>
      </div>
      <div class="controls"><button type="button" class="play_button">[Re]Start</button></div>
    </div><br/>
    <script type="text/javascript" src="jquery-min.js"></script>
    <script type="text/javascript" src="concept_map.js"></script>
  </body>
</html>
