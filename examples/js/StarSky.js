/* 
  Star Sky
*/  

//API object
var StarSky={};			//new empty object


//new PrivateInside() 這個 instance 製造出來之後，會把 API functions 加入到 StarSky 這個 object 裡面
new PrivateInside();	//create instance

//private variables and private functions
function PrivateInside(){
	
	// Global variables to this javascript file
	var windowWidth;
	var windowHeight;
	var allStar;		//儲存全部星星的 Array
	var parallel;		//緯線數量
	var meridian;		//經線數量
	var allInterPoint;		//經緯線交叉點 二維array

	var firstDrag=0;		//拖曳判斷
	var dragTarget=-1;		//拖曳到什麼東西

	var zoomScroll=0;		//放大縮小(範圍0~8)
	var inStar=-1;
	var pivotPoint;			//2D畫面中間 對應到3D空間的哪一點
	var iVector;		//2D畫面中的X方向 是3D空間中的哪一個方向
	var jVector;		//2D畫面中的Y方向 是3D空間中的哪一個方向

	var absPivotPoint;	//參考座標 數值不變動
	var absIVector;
	var absJVector;
	var absRotationMatrix;		//目前轉的角度

	var viewArr;		//視角移動時每一個影格的位置 二維array
	var viewCount=-1;	//上面那一個array走到哪一格
	var oriPosiX;		//紀錄拖曳一開始的位置
	var oriPosiY;		//紀錄拖曳一開始的位置
	
	//計算星星位置 2D 座標使用
	var mapMartrix,equals,nVector;
	
	var globeVisible=true;
	var referenceLineVisible=true;
	var zoomScrollVisible=true;
	var twinkleEnable=true;

	var processingClass;	//儲存processing這個object，目的是要使用裡面的function

	function star(x,y,z){
		var absPosiX=x;	//3D空間中的絕對座標
		var absPosiY=y;
		var absPosiZ=z;
		var posiX=0;	//在畫面上顯示的座標
		var posiY=0;
		var inFrontOf=1;		//星星是不是視線前面 視線背面的星星需要隱藏
		var color;		//顏色
		var colorInt=parseInt(Math.random()*100);
		var size=parseInt(Math.random()*4+3);	//大小
		var brightness=255;
		var period=Math.random()*15+40;	//週期
		var data="";
		
		//輸入0~255的數字 設定亮度
		this.setBrightness=function (br){
			//確認輸入的值正確
			br=(br>255)?255:br;
			br=(br<0)?0:br;
			
			brightness=br;
		};
		
		//設定顏色
		this.setColor=function(intR,intG,intB){
			
			//使用作者挑出來的顏色 input 範圍 0~100
			if(typeof intG == "undefined" && typeof intB == "undefined"){
				setColorInt(this,intR);
				return;
			}
			
			color=processingClass.color(intR,intG,intB);
			//this.setBrightness(this.brightness);
		};
		
		//輸入processing規定格式的顏色
		this.setProcessingColor=function(c){
			color=c;
		};
		
		//設定星星大小
		this.setSize=function(si){
			//確認輸入的值正確
			si=(si<1)?1:si;
			
			size=si;
		};
		
		//設定閃爍頻率
		this.setPeriod=function(peri){
			//確認輸入的值正確
			peri=(peri<1)?1:peri;
			
			period=peri;		//frame rate * period
		};
		
		//設定滑鼠經過顯示的文字
		this.setData=function(da){
			data=da;
		};
		
		//回傳3D空間中的座標
		this.get3DPosition=function(){
			return new Array(absPosiX,absPosiY,absPosiZ);
		};
		
		//回傳2D畫面上的座標
		this.get2DPosition=function(){
			return new Array(posiX,posiY);
		};
		
		//回傳RGB顏色
		this.getColor=function(){
			return new Array(processingClass.red(color),processingClass.green(color),processingClass.blue(color));
		};
		
		//回傳processing規定格式的顏色
		this.getProcessingColor=function(){
			return color;
		};
		
		//回傳明亮度
		this.getBrightness=function(){
			return brightness;
		};
		
		//回傳星星大小
		this.getSize=function(){
			return size;
		};
		
		//回傳周期
		this.getPeriod=function(){
			return period;
		};
		
		//回傳顯示的文字
		this.getData=function(){
			return data;
		};
		
		//是不是在視線前方
		this.isInFrontOf=function(){
			return inFrontOf;
		};
		
		setColorInt(this,colorInt);
		
		//輸入0~100的數字 設定顏色
		function setColorInt(starInstance,colorInt){
			//確認輸入的值正確
			colorInt=(colorInt>100)?100:colorInt;
			colorInt=(colorInt<0)?0:colorInt;
			
			var color=new Array(3);		//RGB三原色
			var colorArr=new Array(4);
			var colorRatial=new Array(50,25,25);
			colorArr[0]=new Array(255,80,80);
			colorArr[1]=new Array(255,255,30);
			colorArr[2]=new Array(255,255,255);
			colorArr[3]=new Array(80,255,250);
			var x,y,cur=0,last=0;
			for(x=0;x<=colorArr.length-2;++x)
			{
				cur+=colorRatial[x];
				if(cur>=colorInt)
				{
					for(y=0;y<=2;++y)
					{
						color[y]=colorArr[x][y]*(cur-colorInt)/colorRatial[x]+colorArr[x+1][y]*(colorInt-last)/colorRatial[x];
					}
					break;
				}
				last+=colorRatial[x];
			}
			starInstance.setColor(color[0],color[1],color[2]);
		}
		
		//計算2D位置
		this.mapPosition=function(){
			var absX=absPosiX;		//取得位置
			var absY=absPosiY;
			var absZ=absPosiZ;
			var posiZ=mapMartrix[0][2]*absX+mapMartrix[1][2]*absY+mapMartrix[2][2]*absZ;
			if(posiZ<=0)			//在目前面對方向的背面
			{
				inFrontOf=0;
			}
			else	//如果在前面 進行X,Y位置計算
			{
				inFrontOf=1;
				var t=equals/(absX*nVector[0]+absY*nVector[1]+absZ*nVector[2]);				//求直線平面的交點
				var solX=absX*t-pivotPoint[0]+0.5*iVector[0]+0.5*jVector[0];		//平移到左上角
				var solY=absY*t-pivotPoint[1]+0.5*iVector[1]+0.5*jVector[1];
				var solZ=absZ*t-pivotPoint[2]+0.5*iVector[2]+0.5*jVector[2];
				var solPosiX=parseInt((mapMartrix[0][0]*solX+mapMartrix[1][0]*solY+mapMartrix[2][0]*solZ)*windowWidth);
				var solPosiY=parseInt((mapMartrix[0][1]*solX+mapMartrix[1][1]*solY+mapMartrix[2][1]*solZ)*windowHeight);
				posiX=solPosiX;
				posiY=solPosiY;
			}
		};
	}

	//經緯線交叉點
	function interPoint(x,y,z){
		this.absPosiX=x;	//3D空間中的絕對座標
		this.absPosiY=y;
		this.absPosiZ=z;
		this.posiX=0;	//在畫面上顯示的座標
		this.posiY=0;
		this.inFrontOf=1;		//視線背面的交叉點需要隱藏
	}

	//判斷這裡有沒有在長方形範圍內
	function isInRect(posi,posiX,posiY,width,height){
		if(posi[0]>=posiX&&posi[0]<=posiX+width&&posi[1]>=posiY&&posi[1]<=posiY+height)
		{
			return 1;
		}
		return 0;
	}

	//3乘3矩陣進行乘法 回傳結果
	function mul_3by3_Matrix(matrixA,matrixB){
		var newMatrix=new Array(3);
		newMatrix[0]=new Array(3);
		newMatrix[1]=new Array(3);
		newMatrix[2]=new Array(3);
		var x,y,z;
		for(x=0;x<=2;++x)
		{
			for(y=0;y<=2;++y)
			{
				newMatrix[x][y]=0;
				for(z=0;z<=2;++z)
				{
					newMatrix[x][y]+=matrixA[z][y]*matrixB[x][z];
				}
			}
		}
		return newMatrix;
	}

	//矩陣乘以向量
	//回傳新的向量
	function mul_matrix_vector(martrixA,vectorA){
		var x,y;
		var newVector=new Array(3);
		for(x=0;x<=2;++x)
		{
			newVector[x]=0;
			for(y=0;y<=2;++y)
			{
				newVector[x]+=martrixA[y][x]*vectorA[y];
			}
		}
		return newVector;
	}

	//計算反矩陣 回傳結果
	function reverse_3by3_Matrix(A){
		var newMatrix=new Array(3);
		newMatrix[0]=new Array(3);
		newMatrix[1]=new Array(3);
		newMatrix[2]=new Array(3);
		//代公式
		//資料來源
		//http://ccjou.wordpress.com/2012/10/04/%E4%B8%89%E9%9A%8E%E9%80%86%E7%9F%A9%E9%99%A3%E5%85%AC%E5%BC%8F/
		var det=A[0][0]*A[1][1]*A[2][2]+
				A[1][0]*A[2][1]*A[0][2]+
				A[2][0]*A[0][1]*A[1][2]-
				A[2][0]*A[1][1]*A[0][2]-
				A[2][1]*A[1][2]*A[0][0]-
				A[1][0]*A[0][1]*A[2][2];
		newMatrix[0][0]=(A[1][1]*A[2][2]-A[2][1]*A[1][2])/det;
		newMatrix[1][0]=(A[2][0]*A[1][2]-A[1][0]*A[2][2])/det;
		newMatrix[2][0]=(A[1][0]*A[2][1]-A[2][0]*A[1][1])/det;
		newMatrix[0][1]=(A[0][2]*A[2][1]-A[0][1]*A[2][2])/det;
		newMatrix[1][1]=(A[0][0]*A[2][2]-A[0][2]*A[2][0])/det;
		newMatrix[2][1]=(A[0][1]*A[2][0]-A[0][0]*A[2][1])/det;
		newMatrix[0][2]=(A[0][1]*A[1][2]-A[0][2]*A[1][1])/det;
		newMatrix[1][2]=(A[0][2]*A[1][0]-A[0][0]*A[1][2])/det;
		newMatrix[2][2]=(A[0][0]*A[1][1]-A[0][1]*A[1][0])/det;
		return newMatrix;
	}

	//外積 回傳結果
	function cross(vectorA,vectorB){
		var newVector=new Array(3);
		newVector[0]=vectorA[1]*vectorB[2]-vectorA[2]*vectorB[1];
		newVector[1]=vectorA[2]*vectorB[0]-vectorA[0]*vectorB[2];
		newVector[2]=vectorA[0]*vectorB[1]-vectorA[1]*vectorB[0];
		return newVector;
	}

	//內積 回傳結果
	function dot(vectorA,vectorB){
		var result=0;
		var x;
		for(x=0;x<=2;++x)
		{
			result+=vectorA[x]*vectorB[x];
		}
		return result;
	}
	
	//回傳標準化向量
	function normalized(vectorA){
		var vecLength=absVector(vectorA);
		
		if(vecLength===0){
			return new Array(0,0,0);
		}
		
		var newVector=new Array(3);
		newVector[0]=vectorA[0]/vecLength;
		newVector[1]=vectorA[1]/vecLength;
		newVector[2]=vectorA[2]/vecLength;
		
		return newVector;
	}
	
	//回傳向量長度
	function absVector(vectorA){
		return Math.sqrt(vectorA[0]*vectorA[0] + vectorA[1]*vectorA[1] + vectorA[2]*vectorA[2]);
	}
	
	//設定視線方向 輸入x,y,z座標 function會設定旋轉矩陣的值
	//這是舊的方法，因為新方法有特殊情況會無法計算，所以就使用舊方法
	function setViewPointOldMethod(newX,newY,newZ){
		//舊方法 先轉phi角 再轉theta角
		var newSphCoord=toSphCoord(newX,newY,newZ);		//轉換成球面座標
		var oldSphCoord=toSphCoord(pivotPoint[0],pivotPoint[1],pivotPoint[2]);
		
		var dPhi=newSphCoord[2]-oldSphCoord[2];			//phi角旋轉的角度
		var dTheta=newSphCoord[1]-oldSphCoord[1];	//theta角旋轉的角度
		//先轉phi角 再轉theta角
		//xy平面選轉(phi角)
		rotate_xy(-dPhi);

		//yz平面 (newPhi取sin決定轉的方向)
		rotate_yz(dTheta*Math.sin(newSphCoord[2]));
		
		//xz平面 (newPhi取cos決定轉的方向)
		rotate_xz(dTheta*Math.cos(newSphCoord[2]));
		
		mapPosition();		//計算2D座標位置
	}
	
	//設定視線方向 輸入x,y,z座標 function會設定旋轉矩陣的值
	function setViewPoint(newX,newY,newZ){
		var norOldPivot=normalized(pivotPoint);						//將 pivot point 的座標標準化，長度變成1
		var norNewPivot=normalized(new Array(newX,newY,newZ));		//將新的座標標準化
		var dotResult=dot(norOldPivot,norNewPivot);				//取內積 判斷夾角有沒有大於90度
		
		//旋轉軸 = 兩方向向量外積
		var delta=cross(norOldPivot,norNewPivot);
		
		//以下是特殊情況
		//旋轉角度超過90度
		if(dotResult<0){
			setViewPointOldMethod(newX,newY,newZ);
			return;
		}
		
		//進行旋轉
		rotate_yz(-Math.asin(delta[0]));
		rotate_xz(-Math.asin(delta[1]));
		rotate_xy(-Math.asin(delta[2]));
		
		mapPosition();		//計算2D座標位置
	}

	//設定視角移動的動畫
	function setViewPointAnime(posiX,posiY,posiZ,time){
		if(time<=0)		//偵測錯誤
		{
			return;
		}
		
		var x,y;
		var posiArr=normalized(new Array(posiX,posiY,posiZ));
		var norPivot=normalized(pivotPoint);
		
		var easeArr=new Array(time);			//累積位置的array
		easeArr[0]=0;
		for(x=1;x<=time-1;++x)			//等加速度移動
		{
			easeArr[x]=easeArr[x-1]+time-x;
		}
		
		//計算座標位置
		viewArr=new Array(time);
		for(x=0;x<=time-1;++x){
			viewArr[x]=new Array(3);
			for(y=0;y<=2;++y){
				viewArr[x][y]=norPivot[y]*(easeArr[time-1]-easeArr[x])/easeArr[time-1]+posiArr[y]*easeArr[x]/easeArr[time-1];
			}
		}
		
		viewCount=0;	//開始動畫
	}

	//輸入直角坐標(x,y,z) 回傳球面座標(r, theta, phi)
	function toSphCoord(posiX,posiY,posiZ){
		var sphR=Math.sqrt(posiX*posiX+posiY*posiY+posiZ*posiZ);
		var sphTheta=0;
		var sphPhi=0;
		var returnArr;
		
		//計算phi值
		if(posiX!==0)
		{
			sphPhi=Math.atan(posiY/posiX);
			if(posiX<=0)			//在第二或是第三象限
			{
				sphPhi+=Math.PI;
			}
		}
		else		//在y軸上
		{
			sphPhi=(posiY>0)?Math.PI/2:Math.PI*3/2;
		}
		
		//計算theta值
		if(sphR!==0)
		{
			sphTheta=Math.acos(posiZ/sphR);
		}
		else		//在原點
		{
			sphTheta=0;
		}
		returnArr=new Array(sphR,sphTheta,sphPhi);
		return returnArr;
	}

	//輸入球面座標(r, theta, phi) 回傳直角坐標(x,y,z)
	function toCartesianCoord(sphR,sphTheta,sphPhi){
		var posiX,posiY,posiZ;
		var returnArr;
		
		posiX=sphR*Math.sin(sphTheta)*Math.cos(sphPhi);
		posiY=sphR*Math.sin(sphTheta)*Math.sin(sphPhi);
		posiZ=sphR*Math.cos(sphTheta);
		returnArr=new Array(posiX,posiY,posiZ);
		return returnArr;
	}

	//3D座標 轉成2D座標
	function mapPosition(){
		var x,y;
		var absX,absY,absZ,posiX,posiY,posiZ;
		var solX,solY,solZ;		//直線與平面的交點
		//var equals;			//平面方程式(標準式)等號右邊的數字
		var t;			//直線參數式設定的變數t
		
		//刷新pivotPoint iVector jVector
		pivotPoint=mul_matrix_vector(absRotationMatrix,absPivotPoint);
		iVector=mul_matrix_vector(absRotationMatrix,absIVector);
		jVector=mul_matrix_vector(absRotationMatrix,absJVector);
		
		//放大縮小
		for(x=0;x<=2;++x)
		{
			iVector[x]/=(1+zoomScroll);
			jVector[x]/=(1+zoomScroll);
		}
		
		mapMartrix=new Array(3);
		mapMartrix[0]=new Array(3);
		mapMartrix[1]=new Array(3);
		mapMartrix[2]=new Array(3);
		
		nVector=cross(jVector,iVector);
		equals=0;
		for(x=0;x<=2;++x)
		{
			mapMartrix[0][x]=iVector[x];
			mapMartrix[1][x]=jVector[x];
			mapMartrix[2][x]=nVector[x];
			equals+=nVector[x]*pivotPoint[x];
		}
		mapMartrix=reverse_3by3_Matrix(mapMartrix);		//反矩陣
		
		//計算2D星星在平面上的位置
		for(x=0;x<=allStar.length-1;++x)
		{
			//因為需要使用到 private variables 所以移到 star function 裡面進行運算
			allStar[x].mapPosition();
		}
		
		//計算輔助線位置
		for(x=0;x<=parallel-1;++x)
		{
			for(y=0;y<=meridian-1;++y)
			{
				absX=allInterPoint[x][y].absPosiX;		//取得位置
				absY=allInterPoint[x][y].absPosiY;
				absZ=allInterPoint[x][y].absPosiZ;
				posiZ=mapMartrix[0][2]*absX+mapMartrix[1][2]*absY+mapMartrix[2][2]*absZ;
				if(posiZ<=0)			//在目前面對方向的背面
				{
					allInterPoint[x][y].inFrontOf=0;
				}
				else	//如果在前面 進行X,Y位置計算
				{
					allInterPoint[x][y].inFrontOf=1;
					t=equals/(absX*nVector[0]+absY*nVector[1]+absZ*nVector[2]);				//求直線平面的交點
					solX=absX*t-pivotPoint[0]+0.5*iVector[0]+0.5*jVector[0];		//平移到左上角
					solY=absY*t-pivotPoint[1]+0.5*iVector[1]+0.5*jVector[1];
					solZ=absZ*t-pivotPoint[2]+0.5*iVector[2]+0.5*jVector[2];
					posiX=parseInt((mapMartrix[0][0]*solX+mapMartrix[1][0]*solY+mapMartrix[2][0]*solZ)*windowWidth);
					posiY=parseInt((mapMartrix[0][1]*solX+mapMartrix[1][1]*solY+mapMartrix[2][1]*solZ)*windowHeight);
					allInterPoint[x][y].posiX=posiX;
					allInterPoint[x][y].posiY=posiY;
				}
			}
		}
	}
	
	//yz 平面旋轉 x軸右手螺旋方向
	function rotate_yz(angle){
		var dragMar=new Array(3);		//旋轉矩陣
		dragMar[0]=new Array(1,0,0);
		dragMar[1]=new Array(0,Math.cos(angle),Math.sin(angle));
		dragMar[2]=new Array(0,-Math.sin(angle),Math.cos(angle));
		dragMar=reverse_3by3_Matrix(dragMar);		//取反矩陣
		absRotationMatrix=mul_3by3_Matrix(dragMar,absRotationMatrix);
	}
	
	//xz 平面旋轉 y軸右手螺旋方向
	function rotate_xz(angle){
		var dragMar=new Array(3);		//旋轉矩陣
		dragMar[0]=new Array(Math.cos(angle),0,-Math.sin(angle));
		dragMar[1]=new Array(0,1,0);
		dragMar[2]=new Array(Math.sin(angle),0,Math.cos(angle));
		dragMar=reverse_3by3_Matrix(dragMar);		//取反矩陣
		absRotationMatrix=mul_3by3_Matrix(dragMar,absRotationMatrix);
	}
	
	//xy 平面旋轉 z軸右手螺旋方向
	function rotate_xy(angle){
		var dragMar=new Array(3);		//旋轉矩陣
		dragMar[0]=new Array(Math.cos(angle),Math.sin(angle),0);
		dragMar[1]=new Array(-Math.sin(angle),Math.cos(angle),0);
		dragMar[2]=new Array(0,0,1);
		dragMar=reverse_3by3_Matrix(dragMar);		//取反矩陣
		absRotationMatrix=mul_3by3_Matrix(dragMar,absRotationMatrix);
	}
	
	//從外面呼叫的
	StarSky.rotate_yz=function(angle){
		rotate_yz(angle);
		mapPosition();
	};
	
	//從外面呼叫的
	StarSky.rotate_xz=function(angle){
		rotate_xz(angle);
		mapPosition();
	};
	
	//從外面呼叫的
	StarSky.rotate_xy=function(angle){
		rotate_xy(angle);
		mapPosition();
	};

	//初始化 StarSky
	//StarSky.init(elementId,windowWidth,windowHeight);		//設定 canvas 的 width, height
	//StarSky.init(elementId);								//使用 css 中的 width, height
	StarSky.init=function(elementId,wWidth,wHeight){
		
		var canvas=document.getElementById(elementId);
		
		//取得 CSS width, height
		if(typeof wWidth == "undefined" || typeof wHeight == "undefined"){
			wWidth=$("#"+elementId).css("width");
			wHeight=$("#"+elementId).css("height");
		}
		
		windowWidth=parseInt(wWidth,10);
		windowHeight=parseInt(wHeight,10);
			
		var sketch=new Processing.Sketch();
		sketch.attachFunction=function(processing){
		
			//按下滑鼠
			processing.mousePressed=function(){
				var posiX=processing.mouseX;
				var posiY=processing.mouseY;
				var posi=new Array(2);
				posi[0]=posiX;
				posi[1]=posiY;
				
				viewCount=-1;		//取消視角移動動畫
				
				//滑鼠按到星星 進行視角移動
				if(inStar!=-1)
				{
					var absPosiX=allStar[inStar].get3DPosition()[0];
					var absPosiY=allStar[inStar].get3DPosition()[1];
					var absPosiZ=allStar[inStar].get3DPosition()[2];
					setViewPointAnime(absPosiX,absPosiY,absPosiZ,24);
					return;
				}
				
				//以下搭配mouseDragged
				if(firstDrag===0)		//之前沒有拖曳東西
				{
					firstDrag=1;
					if(isInRect(posi,windowWidth-60,340-zoomScroll*30,20,10)==1 && zoomScrollVisible===true)	//放大縮小按鈕
					{
						dragTarget=1;
					}
					else
					{
						dragTarget=0;
						oriPosiX=posiX;
						oriPosiY=posiY;
					}
				}
			};
			
			processing.mouseDragged=function(){
				var x;
				var posiX=processing.mouseX;
				var posiY=processing.mouseY;
				var posi=new Array(2);
				posi[0]=posiX;
				posi[1]=posiY;
				if(firstDrag==1)		//目前拖曳中
				{
					if(dragTarget!=-1)
					{
						if(dragTarget===0)		//拖曳畫面
						{
							var displaceX=posiX-oriPosiX;
							var displaceY=posiY-oriPosiY;
							oriPosiX=posiX;
							oriPosiY=posiY;
							if(processing.mouseButton==processing.LEFT)	//滑鼠左鍵 視角移動
							{
								var jLength=Math.sqrt(jVector[0]*jVector[0]+jVector[1]*jVector[1]+jVector[2]*jVector[2]);
								var Jyz=jVector[0]/jLength;			//取得cos值(jVector與x軸取內積除以長度)
								var Jxz=jVector[1]/jLength;			//取得cos值(jVector與y軸取內積除以長度)
								var Jxy=jVector[2]/jLength;			//取得cos值(jVector與z軸取內積除以長度)
								var iLength=Math.sqrt(iVector[0]*iVector[0]+iVector[1]*iVector[1]+iVector[2]*iVector[2]);
								var Iyz=iVector[0]/iLength;			//取得cos值(iVector與x軸取內積除以長度)
								var Ixz=iVector[1]/iLength;			//取得cos值(iVector與y軸取內積除以長度)
								var Ixy=iVector[2]/iLength;			//取得cos值(iVector與z軸取內積除以長度)
								//yz平面旋轉
								rotate_yz(Math.PI*(-displaceX*Jyz+displaceY*Iyz)/(1+zoomScroll)/1800);
								
								//xz平面選轉
								rotate_xz(Math.PI*(-displaceX*Jxz+displaceY*Ixz)/(1+zoomScroll)/1800);
								
								//xy平面選轉
								rotate_xy(Math.PI*(-displaceX*Jxy+displaceY*Ixy)/(1+zoomScroll)/1800);
								
								mapPosition();		//計算2D座標位置
							}
							else if(processing.mouseButton==processing.RIGHT)		//滑鼠右鍵 自轉
							{
								var vLength=Math.sqrt(pivotPoint[0]*pivotPoint[0]+pivotPoint[1]*pivotPoint[1]+pivotPoint[2]*pivotPoint[2]);
								var Vyz=pivotPoint[0]/vLength;			//取得cos值(pivotPoint與x軸取內積除以長度)
								var Vxz=pivotPoint[1]/vLength;			//取得cos值(pivotPoint與y軸取內積除以長度)
								var Vxy=pivotPoint[2]/vLength;			//取得cos值(pivotPoint與z軸取內積除以長度)
								
								//yz平面旋轉
								rotate_yz(Math.PI*(-displaceY*Vyz)/1800);
								
								//xz平面選轉
								rotate_xz(Math.PI*(-displaceY*Vxz)/1800);
								
								//xy平面選轉
								rotate_xy(Math.PI*(-displaceY*Vxy)/1800);
								
								mapPosition();		//計算2D座標位置
							}
						}
						else if(dragTarget==1)		//放大縮小
						{
							var before=zoomScroll;
							zoomScroll=(340-posiY)/30;
							if(zoomScroll>8)
							{
								zoomScroll=8;
							}
							if(zoomScroll<0)
							{
								zoomScroll=0;
							}
							for(x=0;x<=2;++x)
							{
								iVector[x]=iVector[x]/(1+zoomScroll)*(1+before);
								jVector[x]=jVector[x]/(1+zoomScroll)*(1+before);
							}
							mapPosition();		//3D座標map到2D
						}
					}
				}
			};
			
			//mouseReleased
			processing.mouseReleased=function(){
				firstDrag=0;
				dragTarget=-1;
			};
			
			//mouseMoved
			processing.mouseMoved=function(){
				var posi=[processing.mouseX,processing.mouseY];
				var x;
				var posiX;
				var posiY;
				var size;
				inStar=-1;
				//偵測滑鼠位置 在哪一個星星裡面
				for(x=0;x<=allStar.length-1;++x)
				{
					posiX=allStar[x].get2DPosition()[0];		//星星在畫面上的位置
					posiY=allStar[x].get2DPosition()[1];
					size=allStar[x].getSize()*(1+zoomScroll);
					if(isInRect(posi,posiX-size/2-2,posiY-size/2-2,size+4,size+4)==1)
					{
						inStar=x;
						break;
					}
				}
			};
			
			//參考資料
			//https://groups.google.com/forum/#!topic/processingjs/rK5slLKSzk0
			processing.mouseScrolled=function(){
				var x;
				var amount=processing.mouseScroll;
				var before=zoomScroll;		//先儲存之前的大小
				zoomScroll+=amount*0.2;
				if(zoomScroll<0)		//範圍在0~8
				{
					zoomScroll=0;
				}
				if(zoomScroll>8)
				{
					zoomScroll=8;
				}
				var factor=(1+zoomScroll)/(1+before);	//放大倍率
				for(x=0;x<=2;++x)
				{
					iVector[x]=iVector[x]/factor;
					jVector[x]=jVector[x]/factor;
				}
				mapPosition();		//3D座標map到2D
			};
			
			//setup
			processing.setup=function(){
				processingClass=processing;
				//參考資料
				//http://www.dotblogs.com.tw/puma/archive/2009/04/02/javascript-width-height-clientwidth-availwidth-screen.aspx
				//windowWidth=document.body.clientWidth;
				//windowHeight=document.documentElement.clientHeight-20;
				processing.size( windowWidth, windowHeight );
				processing.frameRate( 24 );
				
				//初始化看的方向
				//z方向
				var greaterEdge=(windowWidth>windowHeight)?windowWidth:windowHeight;	//畫面長寬 哪一邊比較大
				pivotPoint=new Array(0,0,greaterEdge/200);			//2D畫面中間 對應到3D空間的哪一點
				iVector=new Array(0,windowWidth/100,0);		//2D畫面中的X方向 是3D空間中的哪一個方向
				jVector=new Array(windowHeight/100,0,0);	//2D畫面中的Y方向 是3D空間中的哪一個方向
				//以下3個是絕對座標 數值永不變動
				absPivotPoint=new Array(0,0,greaterEdge/200);
				absIVector=new Array(0,windowWidth/100,0);
				absJVector=new Array(windowHeight/100,0,0);
				absRotationMatrix=new Array(3);
				absRotationMatrix[0]=new Array(1,0,0);
				absRotationMatrix[1]=new Array(0,1,0);
				absRotationMatrix[2]=new Array(0,0,1);
								
				//製造星星
				var x,y;
				//儲存星星資料的 array
				allStar=new Array(0);
				
				var posiX;
				var posiY;
				var posiZ;
				
				//初始化輔助線
				meridian=36;		//經線
				parallel=17;		//緯線
				allInterPoint=new Array(parallel);		//二維array
				for(x=1;x<=parallel;++x)	//緯線
				{
					allInterPoint[x-1]=new Array(meridian);
					posiZ=parseInt(2000*Math.cos(Math.PI*x/(parallel+1)));
					for(y=0;y<=meridian-1;++y)		//經線
					{
						posiX=parseInt(2000*Math.sin(Math.PI*x/(parallel+1))*Math.cos(Math.PI*y*2/meridian));
						posiY=parseInt(2000*Math.sin(Math.PI*x/(parallel+1))*Math.sin(Math.PI*y*2/meridian));
						allInterPoint[x-1][y]=new interPoint(posiX,posiY,posiZ);
					}
				}
				mapPosition();		//3D座標 map到 2D座標
			};
			
			//draw
			processing.draw=function(){
				
				var x,y;
				//背景
				processing.background(73,1,93);
				processing.colorMode(processing.HSB,360);			//使用HSB系統畫背景 色相是360度
				//由上暗藍 到下深紫
				for(y=0;y<=windowHeight-1;++y)
				{
					var lineHue=(257*(windowHeight-y)+287*y)/windowHeight;
					var lineBright=(12*(windowHeight-y)+88*y)/windowHeight;
					processing.stroke(lineHue,332,lineBright);
					processing.line(0,y,windowWidth-1,y);
				}
				processing.colorMode(processing.RGB,256);			//回復成rgb模式
				
				//處理視角
				if(viewCount!=-1)	//視角移動中
				{
					setViewPoint(viewArr[viewCount][0],viewArr[viewCount][1],viewArr[viewCount][2]);
					viewCount++;
					if(viewCount>=viewArr.length)		//移動結束
					{
						viewCount=-1;
					}
				}
				
				//經緯線(輔助線)
				//parallel=緯線數量
				//meridian=經線數量
				if(referenceLineVisible===true){
					processing.strokeWeight(3);
					processing.stroke(255,255,255,48);
					var startX,startY,endX,endY;
					for(x=0;x<=parallel-1;++x)		//連接緯線
					{
						for(y=0;y<=meridian-1;++y)
						{
							if(allInterPoint[x][y].inFrontOf==1&&allInterPoint[x][(y+1)%meridian].inFrontOf==1)	//要顯示的
							{
								startX=allInterPoint[x][y].posiX;
								startY=allInterPoint[x][y].posiY;
								endX=allInterPoint[x][(y+1)%meridian].posiX;
								endY=allInterPoint[x][(y+1)%meridian].posiY;
								processing.line(startX,startY,endX,endY);
							}
						}
					}
					for(y=0;y<=meridian-1;++y)		//連接經線
					{
						for(x=0;x<=parallel-2;++x)
						{
							if(allInterPoint[x][y].inFrontOf==1&&allInterPoint[x+1][y].inFrontOf==1)	//要顯示的
							{
								startX=allInterPoint[x][y].posiX;
								startY=allInterPoint[x][y].posiY;
								endX=allInterPoint[x+1][y].posiX;
								endY=allInterPoint[x+1][y].posiY;
								processing.line(startX,startY,endX,endY);
							}
						}
					}
				}
				
				//繪製星星
				var posiX,posiY,size;
				var side;
				var center;
				var period,alpha,bright;
				processing.noStroke();
				processing.colorMode(processing.HSB,256);
				for(x=0;x<=allStar.length-1;++x)
				{
					if(allStar[x].isInFrontOf()===0)		//視線背面 不顯示
					{
						continue;
					}
					posiX=(allStar[x].get2DPosition()[0]);
					posiY=(allStar[x].get2DPosition()[1]);
					size=allStar[x].getSize()*(1+zoomScroll);
					side=allStar[x].getProcessingColor();
					bright=allStar[x].getBrightness();
					center=processing.color(processing.hue(side),processing.saturation(side)/15,bright);
					period=allStar[x].getPeriod();
					alpha=bright-50;
					if(period!=-1 && twinkleEnable===true)		//製作閃爍效果
					{
						//大小改變
						size+=(0.025*size+0.3)*Math.sin(processing.frameCount*(2*Math.PI)/period)+0.6;
						//透明度改變
						alpha=(bright-50+50*Math.sin(processing.frameCount*(2*Math.PI)/period));
						//bright=bright+20*bright/235*Math.sin(processing.frameCount*(2*Math.PI)/period);
					}
					processing.fill(side,alpha/2-31);
					processing.ellipse(posiX,posiY,size*1.75+3,size*1.75+3);		//最外圈漸層部分
					processing.fill(side,alpha);
					processing.ellipse(posiX,posiY,size*1.4+1,size*1.4+1);		//第二層漸層部分
					processing.fill(center,255);
					processing.ellipse(posiX,posiY,size,size);			//最內層0彩度顏色
				}
				processing.colorMode(processing.RGB,256);
				
				//滑鼠經過顯示狀態視窗
				if(inStar!=-1&&allStar[inStar].isInFrontOf()==1&&typeof allStar[inStar].getData() != "undefined"&&allStar[inStar].getData() != "")
				{
					posiX=(allStar[inStar].get2DPosition()[0]);
					posiY=(allStar[inStar].get2DPosition()[1]);
					var StringArr=allStar[inStar].getData().split("\n");
					var maxTextWidth=0;
					var font=processing.loadFont("Arial");
					processing.textFont(font,18);	//字體大小
					//取得最長的字串寬度是多少 px
					for(x=0;x<=StringArr.length-1;++x){
						if(processing.textWidth(StringArr[x]) > maxTextWidth){
							maxTextWidth=processing.textWidth(StringArr[x]);
						}
					}
					
					//移動 infoCards' position
					var statusWidth=maxTextWidth+20;
					var statusHeight=6+24*StringArr.length;
					if(posiX>windowWidth-(statusWidth+20))		//換panel位置到星星的右邊
					{
						posiX=posiX-(statusWidth+20);
					}
					if(posiY>windowHeight-(statusHeight+10))		//換panel位置到星星的上面
					{
						posiY=posiY-(statusHeight+10);
					}
					
					//顯示文字的背景
					processing.fill(0,19,128,192);		//blue
					processing.noStroke();
					processing.rect(posiX,posiY,statusWidth,statusHeight,10);
					
					//顯示的文字
					processing.textFont(font,18);	//字體 大小 //test
					processing.fill(255,255,0);		//顯示的文字//yellow
					processing.text(allStar[inStar].getData(),posiX+10,posiY+21);
				}
				
				//放大縮小卷軸
				if(zoomScrollVisible===true){
					processing.strokeWeight(6);
					processing.stroke(74,0,0);
					processing.line(windowWidth-50,100,windowWidth-50,340);
					processing.strokeWeight(2);
					processing.stroke(255,255,255);
					processing.fill(255,102,7);
					processing.rect(windowWidth-60,340-zoomScroll*30,20,10);
				}
				
				//標示方向的地球儀
				//畫坐標軸
				if(globeVisible===true){
					var centerCoord=new Array(205,windowHeight-185);
					var axisLength=150;
					var arrowLength=8;
					processing.strokeWeight(2);
					processing.noFill();
					processing.stroke(255,255,255,153);
					//y軸
					processing.line(centerCoord[0],centerCoord[1],centerCoord[0]+axisLength,centerCoord[1]);
					processing.line(centerCoord[0]+axisLength,centerCoord[1],centerCoord[0]+axisLength-arrowLength/1.414,centerCoord[1]-arrowLength/1.414);
					processing.line(centerCoord[0]+axisLength,centerCoord[1],centerCoord[0]+axisLength-arrowLength/1.414,centerCoord[1]+arrowLength/1.414);
					//x軸
					processing.line(centerCoord[0],centerCoord[1],centerCoord[0]-axisLength/1.414,centerCoord[1]+axisLength/1.414);
					processing.line(centerCoord[0]-axisLength/1.414,centerCoord[1]+axisLength/1.414,centerCoord[0]-axisLength/1.414,centerCoord[1]+axisLength/1.414-arrowLength);
					processing.line(centerCoord[0]-axisLength/1.414,centerCoord[1]+axisLength/1.414,centerCoord[0]-axisLength/1.414+arrowLength,centerCoord[1]+axisLength/1.414);
					//z軸
					processing.line(centerCoord[0],centerCoord[1]+axisLength,centerCoord[0],centerCoord[1]-axisLength);
					processing.line(centerCoord[0],centerCoord[1]-axisLength,centerCoord[0]-arrowLength/1.414,centerCoord[1]-axisLength+arrowLength/1.414);
					processing.line(centerCoord[0],centerCoord[1]-axisLength,centerCoord[0]+arrowLength/1.414,centerCoord[1]-axisLength+arrowLength/1.414);
					
					//繪製xy平面的圓
					var radius=120;
					//var root2=Math.sqrt(2);		//根號2 因為常用到所以設成變數
					//3D座標轉到地球儀 對應的矩陣
					var factor=radius*0.3;		//x軸縮小的幅度
					var globeMap=new Array(3);
					globeMap[0]=new Array(-factor,factor,0);
					globeMap[1]=new Array(radius,0,0);
					globeMap[2]=new Array(0,-radius,0);
					processing.strokeWeight(2);
					processing.noFill();
					//正x軸到 正y軸 的貝茲曲線
					var bezVector_1,bezVector_2;
					bezVector_1=mul_matrix_vector(globeMap,new Array(1,0.5774,0));		// 1/squt(3)
					bezVector_2=mul_matrix_vector(globeMap,new Array(0.5774,1,0));
					processing.bezier(centerCoord[0]-factor,centerCoord[1]+factor,
								centerCoord[0]+bezVector_1[0],centerCoord[1]+bezVector_1[1],
								centerCoord[0]+bezVector_2[0],centerCoord[1]+bezVector_2[1],
								centerCoord[0]+radius,centerCoord[1]);
					//正y軸到 負x軸 的貝茲曲線
					bezVector_1=mul_matrix_vector(globeMap,new Array(-0.5774,1,0));		// 1/squt(3)
					bezVector_2=mul_matrix_vector(globeMap,new Array(-1,0.5774,0));
					processing.bezier(centerCoord[0]+radius,centerCoord[1],
								centerCoord[0]+bezVector_1[0],centerCoord[1]+bezVector_1[1],
								centerCoord[0]+bezVector_2[0],centerCoord[1]+bezVector_2[1],
								centerCoord[0]+factor,centerCoord[1]-factor);
					//負x軸到 負y軸 的貝茲曲線
					bezVector_1=mul_matrix_vector(globeMap,new Array(-1,-0.5774,0));		// 1/squt(3)
					bezVector_2=mul_matrix_vector(globeMap,new Array(-0.5774,-1,0));
					processing.bezier(centerCoord[0]+factor,centerCoord[1]-factor,
								centerCoord[0]+bezVector_1[0],centerCoord[1]+bezVector_1[1],
								centerCoord[0]+bezVector_2[0],centerCoord[1]+bezVector_2[1],
								centerCoord[0]-radius,centerCoord[1]);
					//負y軸到 正x軸 的貝茲曲線
					bezVector_1=mul_matrix_vector(globeMap,new Array(0.5774,-1,0));		// 1/squt(3)
					bezVector_2=mul_matrix_vector(globeMap,new Array(1,-0.5774,0));
					processing.bezier(centerCoord[0]-radius,centerCoord[1],
								centerCoord[0]+bezVector_1[0],centerCoord[1]+bezVector_1[1],
								centerCoord[0]+bezVector_2[0],centerCoord[1]+bezVector_2[1],
								centerCoord[0]-factor,centerCoord[1]+factor);
					
					var nPivot=normalized(pivotPoint);		//標準化的pivotPoint座標
					var globeVector=mul_matrix_vector(globeMap,nPivot);
					
					//垂直的弧線
					var phi=0;			//球面座標phi角
					if(nPivot[0]!==0)
					{
						phi=Math.atan(nPivot[1]/nPivot[0]);
						if(nPivot[0]<0)		//在第二或第三象限
						{
							phi+=Math.PI;
						}
					}
					else
					{
						phi=(nPivot[1]>0)?Math.PI/2:Math.PI*3/2;
					}
					var phiVector=new Array(Math.cos(phi),Math.sin(phi),0);
					phiVector=mul_matrix_vector(globeMap,phiVector);
					processing.line(centerCoord[0],centerCoord[1],centerCoord[0]+phiVector[0],centerCoord[1]+phiVector[1]);
					//正z軸到 x y 平面
					bezVector_1=mul_matrix_vector(globeMap,new Array(0.5774*Math.cos(phi),0.5774*Math.sin(phi),0));		// 1/squt(3)
					bezVector_2=mul_matrix_vector(globeMap,new Array(0,0,0.5774));		// 1/squt(3)
					processing.bezier(centerCoord[0],centerCoord[1]-radius,
								centerCoord[0]+bezVector_1[0],centerCoord[1]-radius+bezVector_1[1],
								centerCoord[0]+phiVector[0]+bezVector_2[0],centerCoord[1]+phiVector[1]+bezVector_2[1],
								centerCoord[0]+phiVector[0],centerCoord[1]+phiVector[1]);
					//x y 平面到負z軸
					bezVector_1=mul_matrix_vector(globeMap,new Array(0,0,-0.5774));		// 1/squt(3)
					bezVector_2=mul_matrix_vector(globeMap,new Array(0.5774*Math.cos(phi),0.5774*Math.sin(phi),0));		// 1/squt(3)
					processing.bezier(centerCoord[0]+phiVector[0],centerCoord[1]+phiVector[1],
								centerCoord[0]+phiVector[0]+bezVector_1[0],centerCoord[1]+phiVector[1]+bezVector_1[1],
								centerCoord[0]+bezVector_2[0],centerCoord[1]+radius+bezVector_2[1],
								centerCoord[0],centerCoord[1]+radius);
					
					//繪製視線
					processing.strokeWeight(2);
					processing.noFill();
					processing.stroke(255,0,0,198);
					processing.line(centerCoord[0],centerCoord[1],centerCoord[0]+globeVector[0],centerCoord[1]+globeVector[1]);
				}
			};
		};
		
		var p = new Processing(canvas,sketch);
	};

	//增加星星到畫面
	//使用直角坐標
	StarSky.addStar=function(posiX,posiY,posiZ){
		var newStar=new star(posiX,posiY,posiZ);
		
		allStar.push(newStar);
		allStar[allStar.length-1].inFrontOf=0;
		mapPosition();		//計算2D座標位置
		
		return newStar;
	};

	//增加星星到畫面
	//使用球面座標
	StarSky.addStarSphCoord=function(sphR,sphTheta,sphPhi){
		
		var coord = toCartesianCoord(sphR, sphTheta, sphPhi);
		
		return StarSky.addStar(coord[0], coord[1], coord[2]);
	};
	
	//回傳目前在往哪裡看
	StarSky.lookAt=function(){
		return normalized(pivotPoint);
	};
	
	//設定要往哪裡看
	StarSky.setLookAt=function(posiX,posiY,posiZ,time){
		
		//不設定動畫
		if(typeof time == "undefined"){
			setViewPoint(posiX,posiY,posiZ);
			return;
		}
		
		//設定動畫
		setViewPointAnime(posiX,posiY,posiZ,time);
	};
	
	//設定左下角的地球儀要不要顯示
	StarSky.setGlobeVisible=function(enable){
		globeVisible=(enable===true)?true:false;
	};
	
	//回傳地球儀目前的顯示狀態
	StarSky.isGlobeVisible=function(){
		return globeVisible;
	};
	
	//設定輔助線要不要顯示
	StarSky.setReferenceLineVisible=function(enable){
		referenceLineVisible=(enable===true)?true:false;
	};
	
	//回傳輔助線顯示的狀態
	StarSky.isReferenceLineVisible=function(){
		return referenceLineVisible;
	};
	
	//設定放大縮小捲軸要不要顯示
	StarSky.setZoomScrollVisible=function(enable){
		zoomScrollVisible=(enable===true)?true:false;
	};
	
	//回傳放大縮小捲軸顯示的狀態
	StarSky.isZoomScrollVisible=function(){
		return zoomScrollVisible;
	};
	
	//設定星星要不要閃爍
	StarSky.setTwinkleEnable=function(enable){
		twinkleEnable=(enable===true)?true:false;
	};
	
	//回傳星星有沒有閃爍
	StarSky.isTwinkleEnable=function(){
		return twinkleEnable;
	};
}