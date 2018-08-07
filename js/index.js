mui.init();
var home = {
	map:null,
	page:1,
	maxPage:1,
	point:{
		lng:'',
		lat:''
	},
	list:[],
	geolocation:null,
	markers:[],
	activeMarker:null,
	activeParking:-1, //当前显示的Parking
	getUserLocation:function(){
		var _this = this;
		this.map.plugin('AMap.Geolocation', function() {
	        _this.geolocation = new AMap.Geolocation({
	            enableHighAccuracy: true,//是否使用高精度定位，默认:true
	            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
	            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
	            showButton: false,      //是否显示定位按钮,默认：true
	        });
	        _this.map.addControl(_this.geolocation);
	        _this.geolocation.getCurrentPosition();
	        _this.geolocation.watchPosition();//使用浏览器定位接口监控当前位置，移动端有效。
	        AMap.event.addListener(_this.geolocation, 'complete',function(data){
	        	localStorage.setItem('startpoint',data.position.getLng()+','+data.position.getLat());
	        	_this.point={
					lng:data.position.getLng(),
					lat:data.position.getLat()
				};
				_this.getParking({
					longitude:data.position.getLng(),
					latitude:data.position.getLat()
				},'');
	        });//返回定位信息
	        AMap.event.addListener(_this.geolocation, 'error', function(err){
	        	console.log('定位失败信息：'+JSON.stringify(err));
	        	_this.getParking({
					longitude:'',
					latitude:''
				},'');
	        });      //返回定位出错信息
	    });
	},
	addMarker:function(){
		var list = this.list;
		for(var i=0;i<list.length;i++){
			this.createMarker(list[i].longitude,list[i].latitude,list[i].free_number,i);
		};
	},
	createMarker:function(lng,lat,status,k){//创建地图标点Marker对象
		var IconSrc = '/img/unchecked48';
		var Size = '';
		var _this = this;
		var marker= new AMap.Marker({
            map: this.map,
            icon: location.origin+IconSrc+'.png',
            position:[lng,lat]
        });
		marker.uuid = k; //给当前的Marker对象自定义一个属性
		marker.on('click',function(){
			if(_this.activeParking==this.uuid){
				return false;
			};
			//改变当前marker的图标
			this.setIcon(location.origin+'/img/checked55.png');
			var item = _this.list[this.uuid];
			if(_this.activeMarker!=null){//改变上一个marker的图标
				_this.activeMarker.setIcon(location.origin+IconSrc+'.png');
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
					'<div class="parking-img"><span class="goRoute" data-address="'+item.parking_lot_address+'" data-longitude="'+item.longitude+'" data-latitude="'+item.latitude+'"></span></div>'+
					'<p>'+distance+'km</p>'+
				'</div>'+
			'</div>';
			h.innerHTML = _html;
			h.style.display ='block';
		});
		this.markers.push(marker);
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
					_this.addMarker();
				}else{
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		});
	},
	CreateMap:function(){
		this.map = new AMap.Map('map', {
	        resizeEnable: true
	    });
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
			var data = this.dataset;
			app.goRoute(data.longitude,data.latitude,data.address);
			e.stopPropagation();
		});
	},
	init:function(){
		this.CreateMap();
		this.getUserLocation();
		this.blockLatest();
		this.bindEvent();
	}
}
home.init();