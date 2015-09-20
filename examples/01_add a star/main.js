$(document).ready(function(){
	
	//get window width and height
	var width=document.body.clientWidth;
	var height=document.documentElement.clientHeight-20;
	
	/**initial the StarSky
	 *
	 * alternative:
	 *	 StarSky.init("canvas1");
	 *     it will load the canvas width and height from the css setting of canvas 
	 */
	StarSky.init("canvas1", width, height);

	
	/**add a star function
	 *
	 * alternative:
	 *	 var star=StarSky.addStarSphCoord(1000, 0.1*Math.PI, Math.PI);
	 *     it will add a star to canvas.
	 *     the position is expressed in spherical coordinate (R, theta, phi)
	 */
	var star=StarSky.addStar(100, 300, 800);		//use Cartesian coordinate
});