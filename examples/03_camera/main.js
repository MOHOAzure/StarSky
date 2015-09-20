$(document).ready(function(){
	
	//initial
	var width=document.body.clientWidth;
	var height=document.documentElement.clientHeight-20;
	
	//StarSky.init(elementId, width, height);		//set width, height of canvas
	//StarSky.init(elementId);						//use width, height of css
	StarSky.init("canvas1", width, height);
	
	//get the direction that user look at
	//return an array of 3 elements (posiX, posiY, posiZ)
	console.log("look at: "+StarSky.lookAt());
	
	//set the direction that user look at
	var noMovement=function (){StarSky.setLookAt(0, 100, 800);};	//StarSky.setLookAt(posiX, posiY, posiZ)
	var movement=function (){StarSky.setLookAt(-300, 0, 800, 36);};	//StarSky.setLookAt(posiX, posiY, posiZ, time(frameCount) )
	var rotate_01=function (){StarSky.rotate_xz(Math.PI/2);};		//rotate xz plane (input radian)
	var rotate_02=function (){StarSky.rotate_xy(Math.PI/2);};		//rotate xy plane
	var rotate_03=function (){StarSky.rotate_yz(Math.PI/2);};		//rotate yz plane
	setTimeout(noMovement, 1000);
	setTimeout(movement, 3000);
	setTimeout(rotate_01, 5000);
	setTimeout(rotate_02, 7000);
	setTimeout(rotate_03, 9000);
});