<!DOCTYPE HTML>
<html>
	<head>
		<title>The Ultimate Raycast</title>
		
		<?php $ver = "?version=0.1"; ?>
		<script type="text/javascript" src="js/Vec2.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Utils.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Engine.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/TitleScreen.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/MapManager.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Player.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Colors.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Console.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Game.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Enemy.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/EnemyFactory.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Billboard.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Door.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Texture.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Item.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/ItemFactory.js<?php echo $ver; ?>"></script>
		<script type="text/javascript" src="js/Renderer.js<?php echo $ver; ?>"></script>
		
		<style>
			body{ 
				margin: 0px;
				background-color: black; 
			}
			canvas{
				margin: auto;
				height: 100%;
				
				image-rendering: optimizeSpeed;
			    image-rendering: -moz-crisp-edges;
			    image-rendering: -webkit-optimize-contrast;
			    image-rendering: -o-crisp-edges;
			    image-rendering: optimize-contrast;
			    -ms-interpolation-mode: nearest-neighbor;
			}
		</style>
	</head>
	
	<body>
		<div id="divGame" style="text-align: center; height: 100%; width: 100%; position: absolute;">
		</div>
	</body>
</html>
