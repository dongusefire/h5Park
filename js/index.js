mui.init();
var home = {
	ws:null,
	map:null,
	wo:null,
	page:1,
	maxPage:1,
	point:{
		lng:'',
		lat:''
	},
	list:[],
	latest:null,
	parking_list:[], //用来储存home_parking窗口
	activeParking:-1, //当前显示的Parking
	homeAccount:null,
	getUserLocation:function(){ 
		var _this=this;
		this.map.getUserLocation(function(state, point){ //获取用户的当前位置信息
			if( 0 == state ){
				console.log(JSON.stringify(point),'用户当前位置信息')
				_this.point={
					lng:point.longitude,
					lat:point.latitude
				};
				_this.setCenter(point);
			}else{
				console.log( "暂未授权!" );//用户拒绝授权地里位置
				var point = {
					longitude:'',
					latitude:'',
				};
			};
			_this.getParking(point,'');
		});
	},
	createAccount:function(){//创建覆盖在地图上的账本
		var _url ='home_account.html';
		var top = window.immersed+10;
		var bottom = window.innerHeight-70-top;
		this.homeAccount = plus.webview.create(_url,_url,{
			height:'70px',
			bottom:bottom,
			top:top+'px',
			left:'3%',
			width:'94%',
			position:'absolute',
			scrollIndicator:'none',
			background:'transparent'
		});
		this.homeAccount.hide();
		this.ws.append(this.homeAccount);
	},
	createToolbar:function(){//创建覆盖在地图上的工具栏
		var _url ='home_toolbar.html';
		var top = window.innerHeight- window.immersed-350;
		var bottom = window.innerHeight-244-top;
		this.ws.append(plus.webview.create(_url,_url,{
			height:'244px',
			bottom:bottom,
			top:top+'px',
			right:'3%',
			width:'61px',
			position:'absolute',
			scrollIndicator:'none',
			background:'transparent'
		}));
	},
	createParking:function(){
		var _url = 'home_parking.html';
		var list = this.list;
		var top = window.innerHeight- window.immersed-106;
		this.parking_list = [];
		for(var i=0;i<list.length;i++){
			var sub = plus.webview.create(_url,'home_parking'+list[i].parking_lot_number,{
				top:top,
				left:'3%',
				height:'106px',
				width:'94%',
				position:'absolute',
				scrollIndicator:'none',
				background:'transparent'
			},list[i]);
			sub.hide();
			this.parking_list.push(sub);
			this.createMarker(list[i].longitude,list[i].latitude,list[i].free_number,i);
			this.ws.append(sub);
		};
	},
	checkedMarker:function(lng,lat,k){ //设置地图标点选中的样式
		var Icon = '/img/checked';
		var Size = '';
		if(plus.os.name=='Android'){
			Size = '80';
		}else{
			Size = '55';
		};
		var _this = this;
		var marker=new plus.maps.Marker(new plus.maps.Point(lng,lat));
		marker.setIcon(Icon+Size+'.png');
		marker.uuid = k; //给当前的Marker对象自定义一个属性
		this.map.addOverlay(marker);
	},
	resetMarker:function(k){ //清除所有标点，并重新绘制标点
		this.map.clearOverlays(); //清除所有的覆盖物(此处为了清除所有的标点)
		var list = this.list;
		for(var i=0;i<list.length;i++){
			if(i==k){
				this.checkedMarker(list[i].longitude,list[i].latitude,i);
			}else{
				this.createMarker(list[i].longitude,list[i].latitude,list[i].free_number,i);
			};
		};
	},
	createMarker:function(lng,lat,status,k){//创建地图标点Marker对象
		var Icon = '/img/unchecked';
		var Size = '';
		var _this = this;
		if(plus.os.name=='Android'){
			Size = '';
		}else{
			Size = '48';
		};
		var _this = this;
		var marker=new plus.maps.Marker(new plus.maps.Point(lng,lat));
		marker.setIcon(Icon+Size+'.png');
		marker.uuid = k; //给当前的Marker对象自定义一个属性
		marker.onclick = function(marker){
			if(_this.activeParking==marker.uuid){
				return false;
			};
			_this.resetMarker(marker.uuid);
			var item = _this.list[marker.uuid];
			if(mui.os.ios){
				plus.webview.show('home_parking'+item.parking_lot_number);
			}else{
				plus.webview.show('home_parking'+item.parking_lot_number,"fade-in",300);
			};
			if(_this.activeParking!=-1){
				var old = _this.list[_this.activeParking];
				plus.webview.hide('home_parking'+old.parking_lot_number);
			};
			_this.activeParking = marker.uuid;
		};
		this.map.addOverlay(marker);
	},
	openSearch:function(){
		var options = {
			styles:{
				popGesture: "close", //popGesture窗口的侧滑返回功能。可取值"none"：无侧滑返回功能；"close"：侧滑返回关闭Webview窗口；"hide"：侧滑返回隐藏webview窗口
				statusbar:{  //statusbar窗口状态栏样式。仅在应用设置为沉浸式状态栏样式下有效，设置此属性后将自动保留系统状态栏区域不被Webview窗口占用。http://www.dcloud.io/docs/api/zh_cn/webview.html#plus.webview.WebviewStatusbarStyles
					background:"#fff" 
				}
			},
			extras:{
				point:this.point
			}
		};
		mui.openWindow('search.html','search.html',options);
	},
	bespeak:function(num){  //打开预定页面
		var options = {
			styles:{
				popGesture: "close", //popGesture窗口的侧滑返回功能。可取值"none"：无侧滑返回功能；"close"：侧滑返回关闭Webview窗口；"hide"：侧滑返回隐藏webview窗口
				statusbar:{  //statusbar窗口状态栏样式。仅在应用设置为沉浸式状态栏样式下有效，设置此属性后将自动保留系统状态栏区域不被Webview窗口占用。http://www.dcloud.io/docs/api/zh_cn/webview.html#plus.webview.WebviewStatusbarStyles
					background:"#fff" 
				}
			},
			extras:{
				parking_lot_num:num
			}
		};
		mui.openWindow('order.html','order.html',options);
	},
	openMapNav:function(opt){
		var point = this.point;
		var _url = '';
		var mapName = opt.name;
		var appName = 'park';
		var osName = plus.os.name;
		var _id = '';
		if(opt.name=='高德地图'){
			if(osName=='Android'){
				//配置参考：https://lbs.amap.com/api/amap-mobile/guide/android/navigation
				_id = "com.autonavi.minimap";
				_url = "androidamap://navi?sourceApplication="+appName+"&poiname="+opt.poiname+"&lat="+point.lat+"&lon="+point.lng+"&dev=1&style=2";
			}else{
				//配置参考：https://lbs.amap.com/api/amap-mobile/guide/ios/navi
				_id = "itunes.apple.com/cn/app/gao-tu-zhuan-ye-dao-hang-ban/id461703208?mt=8";
				_url = "iosamap://navi?sourceApplication="+appName+"&poiname="+opt.poiname+"&lat="+point.lat+"&lon="+point.lng+"&dev=1&style=2";
			};
			plus.runtime.openURL( _url, function(e) {
				plus.nativeUI.confirm( "检查到您未安装\"高德地图\"，是否到商城搜索下载？", function(status){
					if ( status.index == 0 ) {
						opt.err(osName,_id);
					}
				});
			},_id);
		}else{
			if(osName=='Android'){
				//配置参考：http://lbsyun.baidu.com/index.php?title=uri/api/android
				_id = "com.baidu.BaiduMap";
				_url = "baidumap://map/navi?location="+point.lat+","+point.lng+"&coord_type=wgs84&src="+appName;
			}else{
				//配置参考：http://lbsyun.baidu.com/index.php?title=uri/api/ios
				_id = "itunes.apple.com/cn/app/bai-du-de-tu-yu-yin-dao-hang/id452186370?mt=8";
				_url = "baidumap://map/navi?location="+point.lat+","+point.lng+"&coord_type=wgs84&type=type";
			};
			plus.runtime.openURL(_url, function(e) {
				plus.nativeUI.confirm( "检查到您未安装\"百度地图\"，是否到商城搜索下载？", function(status){
					if ( status.index == 0 ) {
						if(osName=='Android'){
							plus.runtime.openURL( "market://details?id="+_id);
						}else{
							plus.runtime.openURL( "itms-apps://"+_id);
						};
					}
				});
			});
		};
	},
	createRoute:function(lng,lat){ //调用地图导航
		var address = localStorage.getItem('parking_lot_address');
		var point = this.point;
		var _this = this;
		if(point.lng!='' &&point.lng!=null){
			// 设置目标位置坐标点和其实位置坐标点
			plus.nativeUI.actionSheet( {
				title:"选择要使用的第三方导航",
				cancel:"取消",
				buttons:[{'title':'高德地图'},{'title':'百度地图'}]
			}, function(e){
				var index = e.index;
				switch (index){
					case 0:
						console.log("选择要使用的第三方导航:取消");
						break;
					case 1:
						console.log("选择要使用的第三方导航:高德地图");
						_this.openMapNav({
							name:'高德地图',
							poiname:address,
							err:function(name,id){
								if(name=='Android'){
									plus.runtime.openURL( "market://details?id="+id);
								}else{
									plus.runtime.openURL( "itms-apps://"+id);
								};
							}
						});
						break;
					case 2:
						console.log("选择要使用的第三方导航:百度地图");
						_this.openMapNav({
							name:'百度地图'
						});
						break;
				}
			});
//			var dst = new plus.maps.Point(lng,lat); // 终点坐标
//			var src = new plus.maps.Point(point.lng,point.lat); // 起点坐标
//			plus.maps.openSysMap(dst,address,src);
		}else{
			mui.alert('未获取到您的位置，无法进行导航');
		}
	},
	openNews:function(){
		mui.openWindow({
			url:'message.html',
			id:'message.html',
			styles:{
			    statusbar:{
				    background:"#fff" 
			    },
			    top:0,
			    left:0,
			    position:"absolute"
		 	}
		});
	},
	showUserLocation:function(){ //打开用户位置
		if(this.point.lng!=''){
			var ptObj = new plus.maps.Point(this.point.lng,this.point.lat);
			this.setCenter(ptObj);
		};
		this.map.showUserLocation( true );
	},
	hideUserLocation:function(){//关闭用户位置
		this.map.showUserLocation( false );
	},
	getCurrentCenter:function(){ //获取地图中心点
		this.map.getCurrentCenter(function(state, point){
			if( 0 == state ){
				console.log(JSON.stringify(point))
			}else{
				console.log( "Failed!" );//未获取到
			};
		})
	},
	setCenter:function(point){ //设置地图中心点
		this.map.setCenter(point);
	},
	getUpData:function(){ //获取最新数据
		var items = this.parking_list; //创建的home_parking窗口
		this.list = [];
		for(var i=0;i<list.length;i++){
			items[i].close(); //关闭窗口
		};
		this.map.clearOverlays(); //清除所有的覆盖物(此处为了清除所有的标记)
		this.getParking(); //获取最新的列表数据
	},
	openMenu:function(){
		var _this = this;
		mui.openWindow({
			url:'parking.html',
			id:'parking.html',
			styles:{
			    statusbar:{
				    background:"#fff" 
			    },
			    top:0,
			    left:0,
			    position:"absolute"
		  	},
		  extras:{
		  	point:{
				longitude:_this.point.lng,
				latitude:_this.point.lat
			},
		  	data:_this.list
		  }
		});
	},
	showAccount:function(){
		this.homeAccount.show();
	},
	bindEvent:function(){
		var _this = this;
//		this.map.onclick = function(point){  //获取当前用户点击的地里位置
////			console.log(JSON.stringify(point),'点击地图')
//		};
		window.addEventListener('updata',function(){
			_this.getUpData();
		});
		window.addEventListener('showAccount',function(){
			_this.showAccount();
		});
	},
	blockLatest:function(){
		var _this= this;
		mui.ajax(AJAX_PATH+'/block/latest',{
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					console.log(JSON.stringify(res));
					_this.latest = res.data;
					console.log(_this.homeAccount.id)
					mui.fire(_this.homeAccount,'updata',{
						latest:_this.latest
					});
					setTimeout(function(){
						_this.blockLatest();
					},10000);
				}else{
					mui.alert(res.msg,'系统提示','确定',null);
				};
			}
		});
	},
	getParking:function(point,sort){
		var _this= this;
		mui.ajax(AJAX_PATH+'/parkinglot/search',{
			data:{
				"longitude":point.longitude,
				"latitude":point.latitude,
				"sort":sort  //distance-距离，price-价格，number-车位数量
			},
			dataType:'json',
			type:'POST',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					_this.list = res.data.list;
					_this.createParking();
				}else{
					mui.alert(res.msg,'系统提示','确定',null);
				};
			}
		});
	},
	init:function(){
		// 获取窗口对象
		this.ws=plus.webview.currentWebview();
		this.wo=this.ws.opener(); //opener获取当前Webview窗口的创建者
		//创建map对象http://www.html5plus.org/doc/zh_cn/maps.html#plus.maps.Map.Map(id,options)
		this.map = new plus.maps.Map('map');
		this.createAccount();
		this.createToolbar();
		this.getUserLocation();
		this.blockLatest();
		this.bindEvent();
	}
}
mui.plusReady(function(){
	if(!home.ws){
		home.init();
	};
})