<?php 
if( ! $has_params ){
	//pr( $maps );
	print '<table><thead><tr><th>Name</th><th>Id</th><th>Interview</th><th>Created</th>';
	print '<th>View</th></tr></thead>';
	print '<tbody>';
	foreach( $maps as $arr ){
		print '<tr>';
		print '<td>' . $arr['name'] . '</td>';
		print '<td>' . $arr['user_id'] . '</td>';
		print '<td>' . $arr['interview']['name'] . '</td>';
		print '<td>' . $arr['created'] . '</td>';
		print '<td><input type="checkbox"/></td>';
		print '</tr>';
	}
	print '</tbody></table>';
	print '<button type="button" id="view_selected">View</button>';
	return;
}
print $html->css( array( 'concept_map' ), false );
//foreach response, create canvas
$id = 0;
foreach( $maps as $map ){
	print '<div class="map">';
	print '<input type="hidden" class="map_values" value=\'' . $map . '\'/>';
	print '<canvas class="canvas" id="canvas' . $id++ . '" width="570" height="500"></canvas>';
	print '<div><button type="button" class="play_button">Play</button></div>';
	print '</div><br/>';
}
print $javascript->link( 'concept_map' );
?>
