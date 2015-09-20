$(document).ready(function(){
	
	//initial
	var width=document.body.clientWidth;
	var height=document.documentElement.clientHeight-20;
	
	//StarSky.init(elementId, width, height);		//set width, height of canvas
	//StarSky.init(elementId);						//use width, height of css
	StarSky.init("canvas1", width, height);
	
	//add stars function
	var star_01=StarSky.addStar(100, 300, 800);								//use Cartesian coordinate
	var star_02=StarSky.addStarSphCoord(1000, 0.1*Math.PI, Math.PI);		//use spherical coordinate (R, theta, phi)
	var star_03=StarSky.addStar(-100, 400, 800);							//use Cartesian coordinate

	/**set color (default color is chosen randomly from author picked color)
	 *   setColor(int):
	 *     Use author picked color, Input range from 0~100
	 *     The mapping between input number and color is 0: red, 50: yellow, 75: white, 100: blue
	 *     Linear interpolation is applied if the input number is between these values.
	 *
	 *   setColor(int, int, int):
	 *     Input values of R, G, B
	 *     Input range = 0~255
	 */
	star_01.setColor(100);			
	star_02.setColor(0, 255, 0);		//set color of star, input range = 0~255
	
	//set brightness (default = 255)
	star_02.setBrightness(192);		//set brightness of the star, input range = 0~255
	
	//set size (default = random from 3 to 6)
	star_01.setSize(9);		//set size of the star, input a positive number
	
	//set period (default = random, range from 40~54)
	star_01.setPeriod(108);		//set the period of sparkling, 108 = frame count (frame rate = 24)
	
	//set mouse over displayed data (default = no displayed)
	star_01.setData("hello world\nthis is the biggest star in the sky!!");
	star_02.setData("hello world from StarSky.js!");
	star_03.setData("");					//no displayed
	
	//get star information
	console.log("star_01 3D position: "+star_01.get3DPosition());		//get 3d position (array of 3 elemets)
	console.log("star_01 2D position: "+star_01.get2DPosition());		//get 2d position that displayed on the screen (array of 2 elements)
	console.log("star_01 color: "+star_01.getColor());					//get color (R, G, B)(array of 3 elements)
	console.log("star_01 color: "+star_01.getProcessingColor());		//get processing format color
	console.log("star_01 brightness: "+star_01.getBrightness());		//get brightness
	console.log("star_01 size: "+star_01.getSize());					//get size
	console.log("star_01 period: "+star_01.getPeriod());				//get period
	console.log("star_01 data: "+star_01.getData());					//get desplayed data
});