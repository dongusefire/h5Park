mui.init();
var cancelOrder = {
	ws:null,
	wo:null,
	reason:'',
	bindEvent:function(){
		var _this = this;
		mui.plusReady(function(){
			_this.ws=plus.webview.currentWebview();
			_this.wo=_this.ws.opener();
		});
		mui('.box').on('tap','span',function(){
			_this.reason = $(this).text();
			$(this).addClass('active').siblings().removeClass('active');
		});
		mui('.g-content').on('tap','.cancel-btn',function(){
			mui.confirm('您确定要取消订单吗？',app.name+'提示',['确定','取消'],function(e){
				if(e.index==0){
					_this.orderCancel();
				};
			})
		});
	},
	orderCancel:function(){
		var token = localStorage.getItem('token'),_this=this;
		mui.ajax(AJAX_PATH+'/user/order/cancel?token='+token,{
			data:JSON.stringify({
				"order_num":_this.ws.order_num,
				"reason":_this.reason
			}),
			dataType:'json',
			type:'post',
			success:function(res,textStatus,xhr){
				_this.addOff = false;
				if(res.code==200){
					mui.toast('订单取消成功');
					window.history.back(-1); 
				}else if(res.code==509){
					_this.orderCancel();
				}else if(res.code==500){
					mui.toast('订单取消失败');
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		});
	},
	init:function(){
		this.bindEvent();
	}
}
cancelOrder.init();