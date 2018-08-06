mui.init();
//添加自定义控件，案例地址：http://lbsyun.baidu.com/jsdemo.htm#b0_6
// 定义一个工具栏控件
function toolbar(){
	// 默认停靠位置和偏移量
	this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
	this.defaultOffset = new BMap.Size(10, 116); //x,y
};
toolbar.prototype = new BMap.Control();
toolbar.prototype.initialize = function(map){
	var dom = mui('#toolbar')[0];
	// 添加DOM元素到地图中
	map.getContainer().appendChild(dom);
	// 将DOM元素返回
	return dom;
};
//定义一个账本控件
function account(){
	// 默认停靠位置和偏移量
	this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
	this.defaultOffset = new BMap.Size(10,10); //x,y
};
account.prototype = new BMap.Control();
account.prototype.initialize = function(map){
	// 创建一个DOM元素
	var dom = document.createElement("div");
	dom.id = 'account';
	dom.style.display = 'none';
	// 添加DOM元素到地图中
	map.getContainer().appendChild(dom);
	// 将DOM元素返回
	return dom;
};
//定义一个车场控件
function parking(){
	// 默认停靠位置和偏移量
	this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
	this.defaultOffset = new BMap.Size(10,10); //x,y
};
parking.prototype = new BMap.Control();
parking.prototype.initialize = function(map){
	// 创建一个DOM元素
	var dom = document.createElement("div");
	dom.id = 'parking-box';
	dom.style.display = 'none';
	// 添加DOM元素到地图中
	map.getContainer().appendChild(dom);
	// 将DOM元素返回
	return dom;
};
var home = {
	map:null,
	page:1,
	maxPage:1,
	point:{
		lng:'',
		lat:''
	},
	list:[],
	activeMarker:null,
	activeParking:-1, //当前显示的Parking
	account:null,
	toolBar:null,
	parking:null,
	getUserLocation:function(){ 
		var _this=this;
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				_this.point={
					lng:r.point.lng,
					lat:r.point.lat
				};
				_this.getParking({
					longitude:r.point.lng,
					latitude:r.point.lat
				},'');
			}else {
				_this.getParking({
					longitude:'',
					latitude:''
				},'');
				console.log('failed'+this.getStatus()); //获取失败
			};
		},{enableHighAccuracy: true})
	},
	createAccount:function(){//创建覆盖在地图上的账本
		// 创建控件
		this.account = new account();
		// 添加到地图当中
		this.map.addControl(this.account);
	},
	createToolbar:function(){//创建覆盖在地图上的工具栏
		// 创建控件
		this.toolBar = new toolbar();
		// 添加到地图当中
		this.map.addControl(this.toolBar);
	},
	createParking:function(){
		var list = this.list;
		// 创建控件
		this.parking = new parking();
		// 添加到地图当中
		this.map.addControl(this.parking);
		for(var i=0;i<list.length;i++){
			this.createMarker(list[i].longitude,list[i].latitude,list[i].free_number,i);
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
	createMarker:function(lng,lat,status,k){//创建地图标点Marker对象
		var IconSrc = '/img/unchecked';
		var Size = '';
		var _this = this;
		var pt = new BMap.Point(lng,lat);
		var Icon = new BMap.Icon(location.origin+IconSrc+'.png', new BMap.Size(48,52));
		Icon.setImageSize(new BMap.Size(48,52));
		var marker= new BMap.Marker(pt,{icon:Icon});
		marker.uuid = k; //给当前的Marker对象自定义一个属性
		marker.onclick = function(){
			if(_this.activeParking==this.uuid){
				return false;
			};
			//改变当前marker的图标
			var _Icon = new BMap.Icon(location.origin+'/img/checked.png', new BMap.Size(55,68));
			_Icon.setImageSize(new BMap.Size(55,68));
			this.setIcon(_Icon);
			var item = _this.list[this.uuid];
			if(_this.activeMarker!=null){//改变上一个marker的图标
				var _Icon2 = new BMap.Icon(location.origin+'/img/unchecked.png', new BMap.Size(48,52));
				_Icon2.setImageSize(new BMap.Size(48,52));
				_this.activeMarker.setIcon(_Icon2);
			};
			_this.activeMarker = this;
			_this.activeParking = this.uuid;
			var distance = (item.distance/1000).toFixed(3),h=mui('#parking-box')[0];
			var _html = '<div class="parking" id="'+item.parking_lot_number+'">'+
				'<div class="parking-l">'+
					'<div class="top">'+
						'<span class="name">'+item.parking_lot_name+'</span>'+
					'</div>'+
					'<p class="address">'+item.parking_lot_address+'</p>'+
					'<div class="parking-b">'+
						'<span class="price"><span>'+(item.price)/100+'元</span>/小时</span>'+
						'<span class="num">车位:'+item.free_number+'/'+item.number+'</span>'+
					'</div>'+
				'</div>'+
				'<div class="parking-r">'+
					'<div class="parking-img"><span class="goRoute" data-longitude="'+item.longitude+'" data-latitude="'+item.latitude+'"></span></div>'+
					'<p>'+distance+'km</p>'+
				'</div>'+
			'</div>';
			h.innerHTML = _html;
			h.style.display ='block';
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
				console.log( "Failed!" );//未获取到用户的地里位置
			};
		})
	},
	setCenter:function(point){ //设置地图中心点
		this.map.setCenter(point);
	},
	getUpData:function(){ //获取最新数据
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
	blockLatest:function(){
		var _this= this;
		mui.ajax(AJAX_PATH+'/block/latest',{
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					var latest = res.data,h = mui('#account')[0];
					var _html = '<div class="current account-info">'+
						'<span class="account-name">当前账本HASH</span>'+
						'<span class="account-address">'+latest.ledgerHash+'</span>'+
						'<span class="account-time">'+latest.closeTime.substring(0,16)+'</span>'+
					'</div>'+
					'<div class="parent account-info">'+
						'<span class="account-name">父账本HASH</span>'+
						'<span class="account-address">'+latest.parentLedgerHash+'</span>'+
						'<span class="account-time">'+latest.parentCloseTime.substring(0,16)+'</span>'+
					'</div>';
					h.innerHTML = _html;
					h.style.display ='block';
					setTimeout(function(){
						_this.blockLatest();
					},10000);
				}else{
					mui.alert(res.msg,app.name+'提示','确定',null);
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
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		});
	},
	CreateMap:function(){
		this.map = new BMap.Map("map");
		var point = new BMap.Point(116.404, 39.915);  // 创建点坐标  
        this.map.centerAndZoom(point, 15);
        this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
	},
	bindEvent:function(){
		var _this = this;
		mui('.g-content').on('tap','#news',function(){
			app.addRoute('message.html');
		});
		mui('.g-content').on('tap','#search',function(){
			app.addRoute('search.html');
		});
		mui('.g-content').on('tap','#list',function(){
			app.addRoute('parking.html');
		});
		mui('.g-content').on('tap','#location',function(){
			_this.showUserLocation();
		});
		mui('.g-content').on('tap','.parking',function(){
			var id = this.id;
			app.addRoute('order.html?parking_lot_num='+id);
		});
		mui('.g-content').on('tap','.goRoute',function(e){ //导航
//			app.addRoute('order.html');
			e.stopPropagation();
		});
	},
	init:function(){
		this.CreateMap();
		this.createAccount();
		this.createToolbar();
		this.getUserLocation();
		this.blockLatest();
		this.bindEvent();
	}
}
home.init();