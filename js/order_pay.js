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
	payResult:function(){//查询支付状态
		var loding = layer.open({
		    type: 2
		    ,content: '加载中'
		    ,shadeClose: false
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
				layer.close(loding);
				_this.resultOff = false;
				if(res.code==200){
					//支付成功之后的回调
					app.addRoute('paySuccess.html?order_sn='+_this.order_sn+'&park_id='+_this.park_id);
				}else if(res.code==509){
					_this.payResult();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
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
					mui('#payView')[0].src = res.data['mweb_url'];
				}else if(res.code==509){
					_this.getPayInfo();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
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
				mui.alert('请选择支付类型',app.name+'提示');
			};
		});
		mui('.mui-content').on('tap','.radio_inline',function(){
			var val = $(this).find('.pay-type').val();
			var id = 'alipay';
			if(val==2){
				id = 'wxpay';
			};
			_this.payId = id;
			_this.pay_channel = val;
		});
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
					mui.alert(res.msg,app.name+'提示','确定',null);
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
		var data = app.getRequest();
		this.order_sn = data.order_sn;
		this.park_id = data.park_id;
		this.orderDetail();
		this.bindEvent();
	}
}
orderPay.init();