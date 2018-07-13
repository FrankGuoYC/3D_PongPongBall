// Using strict mode
"use strict";

// --- GLOBAL VAR BEGIN ---

// Settings of game stage
let gameStage
let GameStage = {
	welcome: 'welcome',
	setting: 'setting',
	play: 'play',
	pause: 'pause',
	resume: 'resume',
	end: 'end',
}

// Often used colors
let Color = {
	// Rainbos color
	red: 0xff0000,
	orange: 0xffae00,
	yellow: 0xFFF300,
	green: 0x1DD800,
	blue: 0x0030E0,
	purple: 0x7E00C6,
	// Special
	white: 0xffffff,
	black: 0x000000,
	gray: 0xA9A9A9,
	lightBlue: 0x00EFEF,
	darkBlue: 0x1D009E,
	pink: 0xFF4141,
}

// Declare animation handler
// let loadingHandler;
let animationFrameHandler;
let blinkHandler;

// Declare sound handler
let bgMusic = new Audio("snd/mario.mp3") // buffers automatically when created
bgMusic.loop = true;
let hitSound = new Audio("snd/hit.wav")
let scoreSound = new Audio("snd/score.wav")
let winSound = new Audio("snd/win.wav")
let pauseSound = new Audio("snd/pause.wav")
let countdownSound = new Audio("snd/countdown.wav")
let goSound = new Audio("snd/go.wav")
let isMute = false;

// Stopwatch settings
let stopwatchSec = 0;
let toutTimer, intvTimer;
let startTime, remainingTime;
let period = 1000;	// 1000ms = 1sec

// identity
let Identity = {
	Player1: 'player1',
	Player2: 'player2',
	Computer: 'computer',
}

// settings of the players
let player1Name = 'Player1', player2Name = 'Player2';
let score1 = 0, score2 = 0;
let winScore = 7;

// objects
let scene;
let renderer;
let camera;
let pointLight;
let spotLight;

// settings of the ball
let ball;
let ballRadius = 7, ballSegments = 6;
let ballDirX, ballDirY;
let ballSpeed = 2;
let ballStatus;	// 2 status: moving, stop

// settings of the paddles
let paddle1, paddle2;
let paddle1InfoObj = {arrow: {}, text: {} }, paddle2InfoObj = {arrow: {}, text: {}};
let paddle1DirX, paddle1DirY;
let paddle2DirX, paddle2DirY;
let paddleWidth = 10, paddleHeight = 50, paddleDepth = 10, paddleFloatHeight = 5, paddleSegments = 1;
let paddleSpeed = 10;
let paddleRebounceSlice = 9;
let arrowFloatingHeight = 25, arrowRotSpeed = degToRad(3.5);	//deg per frame
let textFloatingHeight = 35;

// settings of the camera
let cameraDir = new THREE.Vector3( 0, 1, 0 );

// var for global settings
let fieldWidth = 350, fieldHeight = 400;
let border = ballRadius * 1.5;
let opacityOfUnfocusedCanvas = .3;

// --- GLOBAL VAR END ---

// function loading() {
// }

function setup() {
	// This function would be called when the game is execute at the first time
	// First, add event listener to every button
	$('#gameStartBtn').on('click', function(event){ switchGameStage( GameStage.play ) });
	$('#homeBtn').on('click',function(event){ switchGameStage( GameStage.welcome ) });
	$('#replayBtn').on('click', function(event){ switchGameStage( GameStage.play ) });
	$('#muteBtn').on('click', function(event){ toggleMute() });
	$('#pauseBtn_s').on('click', function(event){ switchGameStage( GameStage.pause ) });
	$('#resumeBtn_b').on('click', function(event){ switchGameStage( GameStage.resume ) });
	$('#homeBtn_b').on('click', function(event){ switchGameStage( GameStage.welcome ) });
	// Clear the title (Since its original text is 'loading...')
	$('#gameStatus').html("");
	// Initialize the stopwatch
	setStopWatch('reset');

	// Show the elements that would always visible
	$('#muteBtn').css('visibility','visible');

	// Set up all the 3D objects which would be used in the game canvas.
	createCanvasScene();
	// Initialize the game, including the ball's x and y position, direction, and status.
	// resetGame('init');

	// Then start to update the variation
  	// update();
	updateAnimation();	// Call the canvas animation
	switchGameStage(GameStage.welcome);
}

function switchGameStage(game_stage) {
	if ( game_stage == GameStage.welcome ) {
		// Disable the keyboard event listener
		setKeyboardEvent(false);
		// reset stopwatch
		setStopWatch('stop');
		// reset the game (canvas)
		resetGame();
		// Stop the blink effect of the scoreboard text
		clearInterval(blinkHandler);
		// Delete the text meshes of the paddles
		setPaddleText('','');
		// Some elements' settings of the game start 
		$('#welcomeScreen').find('*').css('visibility','visible');
		$('#gameTitle').show().html("3D Pong Pong Ball");
		$('#gameCanvas').css('opacity', opacityOfUnfocusedCanvas );
		// At last, set the other elements belong to the other stages to be invisible
		$('#scoreboard').find('*').css('visibility','hidden');
		$('#stopwatch').css('visibility','hidden');
		$('#gameStatus').find('*').css('visibility','hidden');
		$('#endScreen').find('*').css('visibility','hidden');
		$('#pauseScreen').find('*').css('visibility','hidden');
		// Hide the small pause button
		$('#pauseBtn_s').css('visibility','hidden');
		// If the previous stage is pause
		if( gameStage == GameStage.pause ) {
			// Resume the animation frame
			animationFrameHandler =  requestAnimationFrame( updateAnimation );
			// Reset the scores
			score1 = score2 = 0;
		}
	} 
	else if ( game_stage == GameStage.setting ) {
		
	} 
	else if ( game_stage == GameStage.play ) {			
		// Enable the key events
		setKeyboardEvent(true);
		// Set the opacity of the game canvas to 1 (100%)
		$('#gameCanvas').css('opacity','1');
		// Show the small pause button
		$('#pauseBtn_s').css('visibility','visible');
		setStopWatch('start');

		// If the previous stage is pause
		if( gameStage == GameStage.resume ) {
			// 進行與暫停時相反的設置
			// Enable the keyboard event listener
			setKeyboardEvent(true);
			// Resume the animation frame
			animationFrameHandler =  requestAnimationFrame( updateAnimation );
			// Set the opacity of the game canvas to 100%
			$('#gameCanvas').css('opacity', '1');
			// Hide the content of the pause screen
			$('#pauseScreen').find('*').css('visibility','hidden');
		}
		else {
			// Reset game
			resetGame();
			// Stop the blink effect of the scoreboard text
			clearInterval(blinkHandler);
			// Set the text mesh of the two paddles
			setPaddleText( getPlayerName('player1'), getPlayerName('player2') );
			// Clear the text of the input field
			$('.inputName').val('');
			
			// Set elements to visible
			$('#scoreboard').find('*').css('visibility','visible');
			$('#stopwatch').css('visibility','visible');
			$('#gameStatus').css('visibility','visible').html('');
			// At last, set the other elements belong to the other stages to be invisible
			$('#welcomeScreen').find('*').css('visibility','hidden');
			$('#endScreen').find('*').css('visibility', 'hidden');
		}

	} 
	else if ( game_stage == GameStage.pause ) {
		// Disable the keyboard event listener
		setKeyboardEvent(false);
		// Pause stopwatch
		setStopWatch('pause');
		// Stop the animation frame
		cancelAnimationFrame( animationFrameHandler );
		// Hide the small pause button
		$('#pauseBtn_s').css('visibility','hidden');
		// Set the opacity of the game canvas to 40%
		$('#gameCanvas').css('opacity', opacityOfUnfocusedCanvas);
		// Show the content of the pause screen
		$('#pauseScreen').find('*').css('visibility','visible');
		// Set the title to 'Pause'
		$('#pauseTitle').text('Pause');
	}
	else if( game_stage == GameStage.resume ) {
		// Resume from stage 'pause' to stage 'play'
		$('#pauseScreen').find('*').css('visibility','hidden');
		$('#pauseTitle').css('visibility','visible');
		setResumeCountdownInterval(3);	// unit: second
	}
	else if ( game_stage == GameStage.end ) {
		// debug
		// ball.material.color.setHex( Color.red );
		// Disable the keyboard event listener
		setKeyboardEvent(false);
		// Pause stopwatch
		setStopWatch('pause');
		$('#endScreen').find('*').css('visibility','visible');
		$('#gameCanvas').css('opacity', opacityOfUnfocusedCanvas);
		// Hide the small pause button
		$('#pauseBtn_s').css('visibility','hidden');

		if( score1 >= winScore ) {
			// Player1 wins
			$('#gameStatus').html('<span style="color: blue;">' + player1Name + '</span> Wins!');
		}
		else if( score2 >= winScore ) {
			// Player2 wins
			$('#gameStatus').html('<span style="color: red;">' + player2Name + '</span> Wins!');
		}
		// Reset the scores
		score1 = score2 = 0;		
	}
	// At last, assign the new stage to the old stage
	gameStage = game_stage;
	// Play corresponding sound
	playSound(game_stage);
}

function playSound(option) {
	if( option == 'stop' ){
		// Stop all music
		winSound.pause();
		winSound.currentTime = 0;
		bgMusic.pause();
		bgMusic.currentTime = 0;
		hitSound.pause();
		hitSound.currentTime = 0;
		scoreSound.pause();
		scoreSound.currentTime = 0;
	}
	if ( !isMute ){
		if ( option == GameStage.welcome ) {
			// Stop the other sounds
			winSound.pause();
			winSound.currentTime = 0;
			bgMusic.pause();
			bgMusic.currentTime = 0;
		}
		else if ( option == GameStage.play ) {
			// Play bgm
			bgMusic.play();
			// Stop the other sounds
			winSound.pause();
			winSound.currentTime = 0;
		}
		else if( option == GameStage.pause ) {
			// Stop all the other sound
			playSound('stop');
			// And play the pause sound
			pauseSound.play();
		}
		else if( option == GameStage.end ) {
			// Play win sound
			winSound.play();
			// Stop the other sounds
			bgMusic.pause();
			bgMusic.currentTime = 0;

		}
		else if( option == 'hit') {
			// Just play it
			hitSound.play();
		}		
		else if( option == 'score') {
			// Just play it
			scoreSound.play();
		}
		else if( option == 'countdown') {
			// Just play it
			countdownSound.play();
		}	
		else if( option == 'go') {
			// Just play it
			goSound.play();
		}
	}

}

function toggleMute(){
	if( !isMute ){
		// enable
		isMute = true;
		// Stop all music
		playSound('stop');
		// Change the icon of the mute button 
		$('#muteBtn img').attr('src','img/musicoff.png');
	}
	else{
		// disable
		isMute = false;
		// Play music according to current stage
		playSound(gameStage);
		// Change the icon of the mute button
		$('#muteBtn img').attr('src','img/musicon.png');
	}
	// Unfocus the button( prevent it being clicked by keyboard )
	$('#muteBtn').blur();
}

function setKeyboardEvent(enable) {
	if( enable ) {
		$(window).on('keyup', function(event){ Key.onKeyup(event) });
		$(window).on('keydown', function(event){ Key.onKeydown(event) });
	}
	else {
		$(window).off('keyup');
		$(window).off('keydown');
		Key.clear();	// Clear the pressed keys buffer
	}
}

function createCanvasScene(){

	// set the scene size
	let SCREEN_WIDTH = 900, SCREEN_HEIGHT = 500;

	// create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer();
	scene = new THREE.Scene();

	//setup camera
	//usage: camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	// set some camera attributes
	let VIEW_ANGLE = 70, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 10000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	// set a default position for the camera
	// not doing this somehow messes up shadow rendering
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 300;
	// add the camera to the scene
	scene.add(camera);


	// start the renderer
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	// attach the render-supplied DOM element (the gameCanvas)
	let gameCanvas = document.getElementById("gameCanvas");
	gameCanvas.appendChild(renderer.domElement);

	// create camera
	createCamera();
	// create pointLight
	createPointLight();
	// create the playing surface plane
	createPlayingSurfacePlane();
	// Create ground to cast shadow
	createGround();
	// Create a ball with sphere geometry
	createBall();
	// create paddle1 and paddle2
	createPaddles();

	//***Functions for setting up***

	function createCamera(){
		//setup camera
		//usage: camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// set some camera attributes
		let VIEW_ANGLE = 70, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 10000;
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// set a default position for the camera
		// not doing this somehow messes up shadow rendering
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 170;
		// add the camera to the scene
		scene.add(camera);
	}

	function createPointLight(){
		// create a point light
		pointLight = new THREE.PointLight( Color.white );

		// set its position
		pointLight.position.x = -1000;
		pointLight.position.y = 0;
		pointLight.position.z = 1000;
		pointLight.intensity = 2.9;
		pointLight.distance = 10000;

		// add to the scene
		scene.add(pointLight);

		return pointLight;
	}

	function createPlayingSurfacePlane(){

		//Some parameter
		let planeWidth = fieldWidth;
		let planeHeight = fieldHeight;
		let planeQuality = 10;

		// create the plane's material	
		let planeMaterial =
		new THREE.MeshLambertMaterial( {color: 0xff0000 });

		// create the playing surface plane
		let plane = new THREE.Mesh(

		  new THREE.PlaneGeometry(
			planeWidth * 0.95,	// 95% of table width, since we want to show where the ball goes out-of-bounds
			planeHeight,
			planeQuality,
			planeQuality),

		  planeMaterial);
		  
		scene.add(plane);
		plane.receiveShadow = true;

		return plane;
	}

	function createGround(){
		let groundMaterial = new THREE.MeshLambertMaterial(
		{
		  color: Color.gray,
		});

		let _ground = new THREE.Mesh(
		//THREE.CubeGeometry has been renamed to THREE.BoxGeometry
		//Usage: BoxGeometry(width, height, depth, [widthSegments], [heightSegments], [depthSegments])
		//[] means optional param
		  new THREE.BoxGeometry( 1000, 1000, 3, 1, 1, 1),  
		  groundMaterial);
	    
	    // set ground to arbitrary z position to best show off shadowing
		_ground.position.z = -132;
		_ground.receiveShadow = true;
		scene.add(_ground);
		return _ground;
	}

	function createPaddles(){
		//paddle1's material
		let paddle1Material = new THREE.MeshLambertMaterial(
		{
			color: Color.blue,
		});
		//paddle2's material
		let paddle2Material = new THREE.MeshLambertMaterial(
		{
			color: Color.pink,
		});

			
		paddle1 = new THREE.Mesh(

		// Usage: BoxGeometry(width, height, depth, [widthSegments], [heightSegments], [depthSegments])
		  new THREE.BoxGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleSegments,
			paddleSegments,
			paddleSegments),

		  paddle1Material);

		// add the sphere to the scene
		scene.add(paddle1);
		paddle1.receiveShadow = true;
	    paddle1.castShadow = true;
		
		paddle2 = new THREE.Mesh(

		  new THREE.BoxGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleSegments,
			paddleSegments,
			paddleSegments),

		  paddle2Material);
		  
		// add the sphere to the scene
		scene.add(paddle2);
		paddle2.receiveShadow = true;
	    paddle2.castShadow = true;	
		
		// set paddles on each side of the table
		paddle1.position.x = -fieldWidth/2 + paddleWidth + border;
		paddle2.position.x = fieldWidth/2 - paddleWidth - border;
		
		// lift paddles over playing surface
		paddle1.position.z = paddleFloatHeight;
		paddle2.position.z = paddleFloatHeight;

		createPaddle1InfoObj();
		createPaddle2InfoObj();

		function createPaddle1InfoObj(){

			//create arrow pointing to paddle1
			let arrow = new THREE.Geometry();
			let v1 = new THREE.Vector3(0, 0, 0);
			let v2 = new THREE.Vector3(0, -5, 15);
			let v3 = new THREE.Vector3(0, 5, 15);

			arrow.vertices.push(v1);
			arrow.vertices.push(v2);
			arrow.vertices.push(v3);

			arrow.faces.push( new THREE.Face3( 0, 1, 2 ) );
			arrow.computeFaceNormals();

			let arrowMaterial = new THREE.MeshLambertMaterial( { color: Color.darkBlue } );
			arrowMaterial.side = THREE.DoubleSide;	//With this setting the arrowMesh both sides are visible
			let arrowMesh = new THREE.Mesh( arrow, arrowMaterial );
			scene.add(arrowMesh);			
			paddle1InfoObj.arrow = arrowMesh;
			paddle1InfoObj.arrow.position.set( paddle1.position.x, 
				paddle1.position.y, 
				paddle1.position.z + arrowFloatingHeight );
		}

		function createPaddle2InfoObj(){
			//create arrow pointing to paddle2
			let arrow = new THREE.Geometry();
			let v1 = new THREE.Vector3(0, 0, 0);
			let v2 = new THREE.Vector3(0, -5, 15);
			let v3 = new THREE.Vector3(0, 5, 15);

			arrow.vertices.push(v1);
			arrow.vertices.push(v2);
			arrow.vertices.push(v3);

			arrow.faces.push( new THREE.Face3( 0, 1, 2 ) );
			arrow.computeFaceNormals();

			let arrowMaterial = new THREE.MeshLambertMaterial( { color: Color.red } );
			arrowMaterial.side = THREE.DoubleSide;	//With this setting the arrowMesh both sides are visible
			let arrowMesh = new THREE.Mesh( arrow, arrowMaterial );
			scene.add(arrowMesh);			
			paddle2InfoObj.arrow = arrowMesh;
			paddle2InfoObj.arrow.position.set( paddle2.position.x, 
				paddle2.position.y, 
				paddle2.position.z + arrowFloatingHeight );
		}

	}
}

function getPlayerName(whichPlayer) {
	// Player1
	if( whichPlayer == 'player1' ){
		let text = $('#name1').val();
		if( text == '' || text == null ){
			return 'Player1';
		}
		return text;
	}
	// Player2
	if( whichPlayer == 'player2' ){
		let text = $('#name2').val();
		if( text == '' || text == null ){
			return 'Player2';
		}
		return text;
	}


}

function setPaddleText(name1, name2) {

	// Delete the text mesh object first
	deletePaddleText();

	// Paddle1's text
	{
		let size = 12,
		height = .3,
	    hover = 5,
	    curveSegments = 10,
	    bevelThickness = 1,
	    bevelSize = .5,
	    bevelSegments = 10,
	    bevelEnabled = true,

	    font = "segoe ui";
	    // Deprecated font: This font causes the text mesh break
	    // font = "source sans pro"; // helvetiker, optimer, gentilis, droid sans, droid serif
	    // weight = "normal", // normal, bold
	    // style = "normal"; // normal, italic

	    let textGeo = new THREE.TextGeometry( name1, {
	    size: size,
	    height: height,
	    curveSegments: curveSegments,

	    font: font,
	    // weight: weight,
	    // style: style,

	    bevelThickness: bevelThickness,
	    bevelSize: bevelSize,
	    bevelEnabled: bevelEnabled,
	    });

	    let material = new THREE.MeshBasicMaterial({color: Color.orange });
		let textMesh = new THREE.Mesh(textGeo, material); 
		// 轉至camera可以看的到字的角度
		// textMesh.rotation.set( 90, 90, 90 );
		textMesh.rotation.x = degToRad(180);
		textMesh.rotation.y = degToRad(-90);
		textMesh.rotation.z = degToRad(90);

		paddle1InfoObj.text = textMesh;
		paddle1InfoObj.text.position.set( paddle1.position.x + 30, 
			paddle1.position.y + 70, 
			paddle1.position.z + textFloatingHeight );
		scene.add(textMesh);
	}

	// Paddle2's text
	{
		let size = 20,
		height = .3,
	    hover = 5,
	    curveSegments = 10,
	    bevelThickness = 1,
	    bevelSize = .5,
	    bevelSegments = 10,
	    bevelEnabled = true,

	    font = "segoe ui"; 
	    // weight = "normal", // normal, bold
	    // style = "normal"; // normal, italic

	    let textGeo = new THREE.TextGeometry( name2, {
	    size: size,
	    height: height,
	    curveSegments: curveSegments,

	    font: font,
	    // weight: weight,
	    // style: style,

	    bevelThickness: bevelThickness,
	    bevelSize: bevelSize,
	    bevelEnabled: bevelEnabled,
	    });

	    let material = new THREE.MeshBasicMaterial({color: Color.orange });
		let textMesh = new THREE.Mesh(textGeo, material); 
		// 轉至camera可以看的到字的角度
		// textMesh.rotation.set( 90, 90, 90 );
		textMesh.rotation.x = degToRad(180);
		textMesh.rotation.y = degToRad(-90);
		textMesh.rotation.z = degToRad(90);

		paddle2InfoObj.text = textMesh;
		paddle2InfoObj.text.position.set( paddle1.position.x + 30, 
			paddle2.position.y + 70, 
			paddle2.position.z + textFloatingHeight );
		scene.add(textMesh);

	}
	// At last, set the name1 and name2 to player1Name, player2Name
	player1Name = name1;
	player2Name = name2;
}

function deletePaddleText(){
	scene.remove( paddle1InfoObj.text );
	paddle1InfoObj.text = null;			
	scene.remove( paddle2InfoObj.text );
	paddle2InfoObj.text = null;
}

//...

function updateAnimation()
{  
    // draw THREE.JS scene
    renderer.render(scene, camera);

    // loop the updateAnimation() function
    animationFrameHandler = requestAnimationFrame( updateAnimation );

    // --- process game logic ---
	paddlePhysics();
	cameraPhysics();
	ballPhysics();
	// cameraLookAt();
	player1PaddleMovement();
	player2PaddleMovement();

	checkEvent();	
}


function createBall(){

	// create the sphere's material
	let sphereMaterial = new THREE.MeshLambertMaterial({ color: Color.lightBlue });

	//usage: let ball = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
	ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, ballSegments, ballSegments), sphereMaterial);

	// add the sphere to the scene
	scene.add(ball);

	//Adjust the ball position
	ball.position.z += ballRadius;

	return ball;
}


// function cameraPhysics()
// {
// 	// we can easily notice shadows if we dynamically move lights during the game
// 	// spotLight.position.x = ball.position.x * 2;
// 	// spotLight.position.y = ball.position.y * 2;
	
// 	// move to behind the player's paddle
// 	camera.position.x = paddle1.position.x - 100;
// 	camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
// 	camera.position.z = paddle1.position.z + 100 + 0.04 * (-ball.position.x + paddle1.position.x);
	
// 	// rotate to face towards the opponent
// 	camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
// 	camera.rotation.y = -60 * Math.PI/180;
// 	camera.rotation.z = -90 * Math.PI/180;
// }
function resetGame(init) {
	// Reset the y positions of the paddles
	paddle1.position.y = 0;
	paddle2.position.y = 0;
	// And reset other settings
	resetRound('resetGame');
}

function resetRound(loser = Identity.Player1) {
	// update the status text, e.g. scores, etc
	updateStatusText(loser);	

	// Set the ball status to stop
	ballStatus = 'stop';

	if( score1 >= winScore || score2 >= winScore ) {
		// Someone wins
		// cancelAnimationFrame( animationFrameHandler );
		switchGameStage(GameStage.end);
	}

	// position the ball in the center of the table
	ball.position.x = 0;
	ball.position.y = 0;
	
	// set the ball to move +ve in y plane (towards left from the camera)
	ballDirY = (Math.random() * 1.75 - 1.75/2 ) * ballSpeed;

	// if a player lost the last point, we send the ball to player2
	// and set the corresponding ballDirX
	if (loser == Identity.Player1) {
		ballDirX = calAbsCorrespondingBallDirX();
	}
	// else if player2 lost, or it is an initialization of the game, we send the ball to player1
	// and set the corresponding ballDirX
	else {
		ballDirX = -calAbsCorrespondingBallDirX();
	}
}

function ballPhysics() {

	// update ball position over time
	if( ballStatus == 'moving' ) {
		ball.position.x += ballDirX * ballSpeed;
		ball.position.y += ballDirY * ballSpeed;

		// if ball goes off the 'left' side (Player1's side)
		if (ball.position.x <= -fieldWidth/2 + border) {	
			// Player2 scores
			score2++;
			// Play score sound
			playSound('score');
			// update scoreboard HTML
			// document.getElementById("scores").innerHTML = score1 + "-" + score2;
			// reset ball to center
			resetRound(Identity.Player1);
			// matchScoreCheck();	
		}
		
		// if ball goes off the 'right' side (Player2's side)
		if (ball.position.x >= fieldWidth/2 - border) {	
			// Player1 scores
			score1++;
			// Play score sound
			playSound('score');
			// update scoreboard HTML
			// document.getElementById("scores").innerHTML = score1 + "-" + score2;
			// reset ball to center
			resetRound(Identity.Player2);
			// matchScoreCheck();	
		}
		
		// Since when the ball touch the bottom or the top side means someone lose, 
		// so the code following isn't need
		// // if ball goes off the bottom or top side (side of table)
		// if (ball.position.x <= -fieldWidth/2 + border || ball.position.x >= fieldWidth/2 - border) {
		// 	ballDirX *= -1;
		// }


		// if ball goes off the left or right side (side of table)
		if (ball.position.y <= -fieldHeight/2 + border || ball.position.y >= fieldHeight/2 - border) {
			ballDirY *= -1;
		}

		
		// limit ball's y-speed to 2x the x-speed
		// this is so the ball doesn't speed from left to right super fast
		// keeps game playable for humans
		// if (ballDirY > ballSpeed * 2)
		// {
		// 	ballDirY = ballSpeed * 2;
		// }
		// else if (ballDirY < -ballSpeed * 2)
		// {
		// 	ballDirY = -ballSpeed * 2;
		// }
	}

}

function player1PaddleMovement()
{
	// move left
	if (Key.isDown(Key.A))		
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle1.position.y < fieldHeight * 0.45)
		{
			paddle1DirY = paddleSpeed * 0.5;
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle1DirY = 0;
			// paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
		}
	}	
	// move right
	else if (Key.isDown(Key.D))
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle1.position.y > -fieldHeight * 0.45)
		{
			paddle1DirY = -paddleSpeed * 0.5;
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle1DirY = 0;
			// paddle1.scale.z += (10 - paddle1.scale.z) * 0.2;
		}
	}
	// else don't move paddle
	else
	{
		// stop the paddle
		paddle1DirY = 0;
	}

	paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;	
	paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;	
	paddle1.position.y += paddle1DirY;

	// update paddle1 info obj
	// update the arrow of paddle1
	paddle1InfoObj.arrow.position.set( paddle1.position.x, 
		paddle1.position.y, 
		paddle1.position.z + arrowFloatingHeight );
	paddle1InfoObj.arrow.rotation.z += arrowRotSpeed;
	// update the text of paddle1
	if( gameStage == GameStage.play ){
		paddle1InfoObj.text.position.set( paddle1.position.x + 30, 
		paddle1.position.y + 20, 
		paddle1.position.z + textFloatingHeight );
	}

}

function player2PaddleMovement()
{
	// move left
	if (Key.isDown(Key.Left))		
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle2.position.y < fieldHeight * 0.45)
		{
			paddle2DirY = paddleSpeed * 0.5;
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle2DirY = 0;
			// paddle2.scale.z += (10 - paddle2.scale.z) * 0.2;
		}
	}	
	// move right
	else if (Key.isDown(Key.Right))
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle2.position.y > -fieldHeight * 0.45)
		{
			paddle2DirY = -paddleSpeed * 0.5;
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle2DirY = 0;
			// paddle2.scale.z += (10 - paddle2.scale.z) * 0.2;
		}
	}
	// else don't move paddle
	else
	{
		// stop the paddle
		paddle2DirY = 0;
	}
	
	paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;	
	paddle2.scale.z += (1 - paddle2.scale.z) * 0.2;	
	paddle2.position.y += paddle2DirY;

	// update paddle2 info obj
	// update the arrow of paddle2
	paddle2InfoObj.arrow.position.set( paddle2.position.x, 
		paddle2.position.y, 
		paddle2.position.z + arrowFloatingHeight );
	paddle2InfoObj.arrow.rotation.z += arrowRotSpeed;
	// update the text of paddle2
	if ( gameStage == GameStage.play ){
		paddle2InfoObj.text.position.set( paddle2.position.x + 30, 
		paddle2.position.y + 20, 
		paddle2.position.z + textFloatingHeight );
	}

}

function paddlePhysics()
{
	// PLAYER1 PADDLE LOGIC
	
	// if ball is aligned with paddle1 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.x <= paddle1.position.x + paddleWidth
	&&  ball.position.x >= paddle1.position.x)
	{
		if ( ballDirX < 0 ){
			// When ball is toward player1
			if ( ball.position.y <= paddle1.position.y + paddleHeight/2 ) {
				// and if ball is aligned with paddle1 on y plane
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				for(let i=1; i<=paddleRebounceSlice; i++) {
					if ( ball.position.y 
						>= paddle1.position.y + paddleHeight/2 - paddleHeight/paddleRebounceSlice*i ) {
 						ballDirY = ballSpeed * Math.cos(Math.PI/(paddleRebounceSlice+1)*i);
 						ballDirX = calAbsCorrespondingBallDirX();
 						// play the hit sound
						playSound('hit');
 						break;
 					}
				}

			}
		}

	}
	
	// PLAYER2 PADDLE LOGIC	
	
	// if ball is aligned with paddle2 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.x <= paddle2.position.x + paddleWidth
	&&  ball.position.x >= paddle2.position.x)
	{
		if ( ballDirX > 0 ){
			// When ball is toward player2
			if ( ball.position.y <= paddle2.position.y + paddleHeight/2 ) {
				// and if ball is aligned with paddle2 on y plane
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				for(let i=1; i<=paddleRebounceSlice; i++) {
					if ( ball.position.y 
						>= paddle2.position.y + paddleHeight/2 - paddleHeight/paddleRebounceSlice*i ) {
 						ballDirY = ballSpeed * Math.cos(Math.PI/(paddleRebounceSlice+1)*i);
 						ballDirX = -calAbsCorrespondingBallDirX();
 						// play the hit sound
						playSound('hit');
 						break;
 					}
				}
			}
		}


		// // and if ball is aligned with paddle2 on y plane
		// if (ball.position.y <= paddle2.position.y + paddleHeight/2
		// &&  ball.position.y >= paddle2.position.y - paddleHeight/2)
		// {
		// 	// and if ball is travelling towards opponent (+ve direction)
		// 	if (ballDirX > 0)
		// 	{
		// 		// stretch the paddle to indicate a hit
		// 		// paddle2.scale.y = 15;	
		// 		// we impact ball angle when hitting it
		// 		// this is not realistic physics, just spices up the gameplay
		// 		// allows you to 'slice' the ball to beat the opponent
		// 		// if( paddle2 ) {
					
		// 		// }

		// 		// ballDirY = paddle2DirY * 0.7;

		// 		// switch direction of ball travel to create bounce
		// 		ballDirX = -calAbsCorrespondingBallDirX();
		// 	}
		// }
	}
}

function cameraPhysics(){
	// we can easily notice shadows if we dynamically move lights during the game
	// spotLight.position.x = ball.position.x * 2;
	// spotLight.position.y = ball.position.y * 2;
	
	// move to behind the player's paddle
	camera.position.x = paddle1.position.x - 100;
	camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
	// camera.position.z = paddle1.position.z + 100 + 0.04 * (-ball.position.x + paddle1.position.x);
	
	// rotate to face towards the opponent
	// camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	camera.rotation.y = degToRad(-60);
	// camera.rotation.y += degToRad(1);
	camera.rotation.z = degToRad(-90);
	// camera.rotation.z += degToRad(-.2);

}

function checkEvent() {
	// when 'space' is clicked
	if ( Key.isDown( Key.Space ) ) {
		// Shoooooooooot the ball !!!
		if( ballStatus == 'stop' ) {
			ballStatus = 'moving';
		}
	}
	// when 'p' is clicked
	else if ( Key.isDown( Key.P ) ) {
		// Pause the game
		if( gameStage == GameStage.play ){
			switchGameStage( GameStage.pause );
		} 
		else if ( gameStage == GameStage.pause ) {
			switchGameStage( GameStage.play );
		}
	}
	// when 'm' is clicked
	else if ( Key.isDown( Key.M ) ) {
		// Mute
		toggleMute();
	}
}

function updateStatusText(loser) {
	$('#score1').text(score1).css('visibility', 'visible');
	$('#score2').text(score2).css('visibility', 'visible');
	$('#slash').css('visibility', 'visible');
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	if( loser == Identity.Player2 ) {
		$('#score1').blink();	
	} else if ( loser == Identity.Player1 ) {
		$('#score2').blink();	
	} else if ( loser == 'resetGame' ) {
		// resetGame: clear all the text
		$('#score1').css('visibility', 'hidden');
		$('#score2').css('visibility', 'hidden');
		$('#slash').css('visibility', 'hidden');
	}
}

// function cameraLookAt(){
// 	let axis = new THREE.Vector3( 0, 0, 1 );
// 	let angle = degToRad(-.1);
// 	cameraDir.applyAxisAngle( axis, angle );
// 	// camera.position.x += cameraDir.x;
// 	camera.position.y += cameraDir.y;
// 	camera.position.z += cameraDir.z;

// 	let focus = new THREE.Vector3(ball.position);
// 	camera.lookAt(ball.position);
// }

function calAbsCorrespondingBallDirX() {
	return Math.sqrt( ballSpeed*ballSpeed - ballDirY*ballDirY );
}

function calAbsCorrespondingBallDirY() {
	return Math.sqrt( ballSpeed*ballSpeed - ballDirX*ballDirX );
}

function degToRad(deg){
	return deg * Math.PI / 180;
}

// Blink funciton

function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = setInterval(function () {
	   callback();

	   x++;
	   if ( x == repetitions * 2) {
	       clearInterval(intervalID);
	   }
    }, delay);
    return intervalID;
}

$.fn.blink = function (options) {
	let defaults = { delay: 100 };
	options = $.extend(defaults, options);
	return $(this).each(function (idx, itm) {
		blinkHandler = setIntervalX( function() {
				if ($(itm).css("visibility") === "visible") {
					$(itm).css('visibility', 'hidden');
				}
				else {
					$(itm).css('visibility', 'visible');
				}
			}, options.delay, 5);
	});

		// 	function () {
		// 	if ($(itm).css("visibility") === "visible") {
		// 		$(itm).css('visibility', 'hidden');
		// 	}
		// 	else {
		// 		$(itm).css('visibility', 'visible');
		// 	}
		// }, options.delay, 3);
	// });
}

function callFunctionWithBufferTime( funcToCall, bufferTime){

}

function setResumeCountdownInterval(sec) {
	$('#pauseTitle').text(sec--);
	playSound('countdown');
	var intervalID = setInterval(function () {
		if(sec == 0){
			$('#pauseTitle').text("Go!");
			playSound('go');
		}
		else if(sec <= -1){
			clearInterval( intervalID );
			switchGameStage( GameStage.play );
		}
		else {
			$('#pauseTitle').text(sec);
			playSound('countdown');
		}
		sec--;
    }, 1000);
}

function setStopWatch(option){

	if( option == 'start' ){
		toutTimer = setTimeout( function(){ execAfterRemainingTime() }, remainingTime );
	}
	else if( option == 'reset' ){
		stopwatchSec = 0;
		remainingTime = 0;
	}
	else if( option == 'pause' ){
		clearTimeout(toutTimer);
		clearInterval(intvTimer);
		remainingTime = period - (new Date() - startTime);
	}
	else if( option == 'stop' ){
		setStopWatch('pause');
		setStopWatch('reset');
		$('#stopwatch').text('00:00');
	}

	function execAfterRemainingTime(){
		updateStopWatchText();
		intvTimer = setInterval( function(){ updateStopWatchText() }, period);
	}

	function updateStopWatchText(){
		$('#stopwatch').text( valToStr(Math.floor(stopwatchSec/60))+':'+valToStr(Math.floor(stopwatchSec%60)) );
		startTime = new Date();
		stopwatchSec++;
	}	

	function valToStr(val){
		if( val < 10 ){
			return '0' + val;
		}
		return val.toString();
	}
}
	// if( gameStage == GameStage.pause || gameStage == GAmeStage.resume ){

	// }
	// else if( gameStage == GameStage.play ){
	// 	if( time() - currentMs >= 1000 ){
	// 	currentMs = time();
	// 	currentSec
	// }
	// }

