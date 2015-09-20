$(document).ready(function(){
	
	//initial
	var width=document.body.clientWidth;
	var height=document.documentElement.clientHeight-20;
	
	//StarSky.init(elementId, width, height);		//set width, height of canvas
	//StarSky.init(elementId);						//use width, height of css
	StarSky.init("canvas1", width, height);
	
	//create a lot of stars
	for(var x=0;x<=800;++x){
		StarSky.addStar(1000*Math.random()-500, 1000*Math.random()-500, 1000*Math.random()-500);
	}
	
	//enable/disable function
	StarSky.setGlobeVisible(false);					//hide/show globe in the lower left corner
	StarSky.setReferenceLineVisible(false);			//hide/show reference line
	StarSky.setZoomScrollVisible(false);			//hide/show zoom scroll
	StarSky.setTwinkleEnable(false);				//stop/start star twinkling
	
	//get enable/disable status
	console.log("globe visible: "+StarSky.isGlobeVisible());
	console.log("reference line visible:  "+StarSky.isReferenceLineVisible());
	console.log("zoom scroll visible: "+StarSky.isZoomScrollVisible());
	console.log("twinkle enable: "+StarSky.isTwinkleEnable());
});