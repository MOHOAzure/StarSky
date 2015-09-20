$(document).ready(function(){
	
	/**		Create the Sky		**/	
	//initial
	var width=document.body.clientWidth;
	var height=document.documentElement.clientHeight-20;
	
	StarSky.init("canvas1",width,height);
	
	/**		Create Stars 	**/
	for(var x=0;x<=800;++x){
		StarSky.addStar(1000*Math.random()-500, 1000*Math.random()-500, 1000*Math.random()-500);
	}
});