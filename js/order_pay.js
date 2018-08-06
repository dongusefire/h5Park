mui.init();
var orderPay = {
	ws:null,
	wo:null,
	pays:[],
	order_sn:'',
	park_id:'',
	pay_channel:'',
	payBtn:false,
	payId:'',
	paylink:null,
	resultOff:false,
	getChannels:function(){//获取支付通道
		var _this = this;
		// 获取支付通道
//	    plus.payment.getChannels(function(channels){
//	    	for(var i in channels){
//	    		var channel=channels[i];
//				if(channel.id=='qhpay'||channel.id=='qihoo'){	// 过滤掉不支持的支付通道：暂不支持360相关支付
//					continue;
//				}
//				_this.pays[channel.id] = channel;
//				console.log(channel.id+':'+JSON.stringify(channel))
//	    	};
//	    },function(e){
//	    	console.log("获取支付通道失败："+e.message);
//	    });
	},
	promptInstall:function(channel){//提示安装客户端支付工具
		var txt=null;
		switch(channel.id){
			case 'alipay':
			txt='检测到系统未安装“支付宝”，无法完成支付操作，是否立即安装？';
			break;
			default:
			txt='系统未安装“'+channel.description+'”服务，无法完成支付，是否立即安装？';
			break;
		}
		plus.nativeUI.confirm(txt, function(status){
			if(status.index==0){
				channel.installService();
			}
		}, {
			title:app.name+'提示',
			buttons:['是','否']
		});
	},
	payResult:function(){//查询支付状态
		var loding = plus.nativeUI.showWaiting('正在查询支付状态',{
			modal:true,
			padlock:true
		});
		var token = localStorage.getItem('token');
		var _this = this;
		mui.ajax(AJAX_PATH+'/pay/result?token='+token,{
			data:{
				"order_sn":_this.order_sn,
			},
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				loding.close();
				_this.resultOff = false;
				if(res.code==200){
					//支付成功之后的回调
					mui.openWindow({
						url:'paySuccess.html',
						id:'paySuccess.html',
						styles:{
							popGesture: "close",
							statusbar:{
								background:"#fff" 
							}
						},
						extras:{
							order_sn:_this.order_sn,
							park_id:_this.park_id
						}
					});
				}else if(res.code==509){
					_this.payResult();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,'系统提示','确定',null);
				}
			}
		});
	},
	getPayInfo:function(){//获取支付签名
		var _this = this;
		var token = localStorage.getItem('token');
		mui.ajax(AJAX_PATH+'/pay?token='+token,{
			data:{
				"order_sn":_this.order_sn,
				"pay_channel":_this.pay_channel,
			},
			dataType:'json',
			type:'POST',
			success:function(res,textStatus,xhr){
				_this.payBtn = false;
				if(res.code==200){
					var order = JSON.stringify(res.data);
					var _text = '微信支付'
					if(_this.pay_channel==1){
						_text = '支付宝支付'
					};
//					plus.runtime.openURL(res.data['mweb_url']);
					_this.paylink = mui.openWindow(res.data['mweb_url'],'paylink',{
						styles:{
							titleNView:{
								buttons:[
									{
										color:'#292929',
										colorPressed:'#292929',
										float:'left',
										text:'关闭',
										fontSize:'16px',
										onclick:function(){
											_this.paylink.close();
										}
									}
								],
								backgroundColor:'#f7f7f7',
								titleText:_text,
								splitLine: {
									color: '#cccccc'
								}
							},
							popGesture:'none',
							backButtonAutoControl:'none',
							additionalHttpHeaders:{
								"Referer":"http://www.ecosysnet.com/"
							}
						},
						show:{
							event:'loaded'
						},
						waiting:{
							autoShow:false
						},
						extras:{}
					});
					_this.paylink.onclose = function(){
						_this.payResult();
					}
//					plus.payment.request(_this.pays[_this.payId],order,function(result){
//						mui.alert('支付成功',"20180711114835598",'确定',null);
//					},function(e){
//						mui.alert('['+e.code+']：'+e.message,"20180711114835598",'确定',null);
//					});
				}else if(res.code==509){
					_this.getPayInfo();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,'系统提示','确定',null);
				};
			}
		});
	},
	bindEvent:function(){
		var _this = this;
		mui('.mui-content').on('tap','#payBtn',function(){
			if(_this.pay_channel!=''){
				if(!_this.payBtn){
					_this.payBtn = true;
					_this.getPayInfo();
				};
			}else{
				mui.alert('请选择支付类型','系统提示');
			};
		});
		mui('.mui-content').on('tap','.radio_inline',function(){
			//如果支付通道不需要依赖系统安装服务，则永远返回true。例如支付宝，如果设备上未安装支付宝客户端则调用Wap页面进行支付，因此值固定返回true；
			//而微信支付则依赖微信客户端，如果设备上未安装微信客户端则serviceReady值为false，此时应该提示用户安装微信客户端才能进行支付操作
			var val = $(this).find('.pay-type').val();
			var id = 'alipay';
			if(val==2){
				id = 'wxpay';
			};
			_this.payId = id;
			_this.pay_channel = val;
		});
//		document.addEventListener("pause",function(){
//			console.log(" 应用从前台切换到后台" );
//		}, false );
//		document.addEventListener("resume",function(){
//			console.log(" 应用从后台切换到前台" );
//			if(!_this.resultOff){
//				_this.resultOff = true;
//				setTimeout(function(){
//					_this.payResult();
//				},1000);
//			};
//		}, false );
	},
	orderDetail:function(){
		var _this = this;
		var token = localStorage.getItem('token');
		mui.ajax(AJAX_PATH+'/user/order/detail?token='+token,{
			data:{
				"order_num":_this.order_sn,
				"park_id":_this.park_id,
			},
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					console.log(JSON.stringify(res.data));
					var order_info = res.data.order_info;
					var parkType = '',start='',end='';
					//类型判断
					if(order_info.flag == 'D'){
						parkType = '固定'
					}else if(order_info.flag == 'C'){
						parkType = '不固定'
					};
					//出入场时间判断
					//入场时间
					if(order_info.start_time&&order_info.start_time!=''){
						start = _this.timestampToTime(order_info.start_time);
					}else{
						start = '暂无数据';
					}
					//出场时间
					if(order_info.end_time&&order_info.end_time!=''){
						end = _this.timestampToTime(order_info.end_time);
					}else{
						end = '暂无数据';
					}
					document.getElementById('parkName').innerHTML = res.data.park_info.parking_lot_name;
					document.getElementById('parkAddress').innerHTML = res.data.park_info.parking_lot_address;
					document.getElementById('parkType').innerHTML = parkType;
					document.getElementById('plateNum').innerHTML = order_info.car_num;
					document.getElementById('stateTime').innerHTML = start;
					document.getElementById('endTime').innerHTML = end;
					document.getElementById('parkPrice').innerHTML = res.data.order_info.order_amount/100;
					$('[v-cloak]').removeAttr('v-cloak');
				}else if(res.code==509){
					_this.orderDetail();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,'系统提示','确定',null);
				};
			}
		});
	},
	//时间戳转换为时间格式
	timestampToTime:function(timestamp){
		function p(s) {
		    return s < 10 ? '0' + s: s;
		}
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear() + '-';
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        D = date.getDate() + ' ';
        h = date.getHours() + ':';
        m = date.getMinutes();
        s = date.getSeconds();
        return Y+M+p(D)+p(h)+p(m);
    },
	init:function(){
		this.ws = plus.webview.currentWebview();
		this.wo = this.ws.opener();
		this.order_sn = this.ws.order_sn;
		this.park_id = this.ws.park_id;
		this.orderDetail();
		this.getChannels();
		this.bindEvent();
	}
}
mui.plusReady(function(){
	orderPay.init();
});