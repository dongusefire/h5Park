mui.init();
var rentDetails = {
	ws:null,
	userDetail:function(){
		var token = localStorage.getItem('token'),_this=this;
		mui.ajax(AJAX_PATH+'/user/park/space/user_detail/'+_this.ws.rentId+'?token='+token,{
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					console.log(JSON.stringify(res));
					var _html = '',park_info=res.data.park_info,order_info=res.data.order_info,vl=mui('.g-content')[0];
					_html +='<div class="ba_color">'+
						'<div class="rent-park">'+
							'<h3>'+park_info.parking_lot_name+'</h3>'+
							'<p>放租编号:<span>'+park_info.id+'</span></p>'+
							'<p>放租时间:<span>'+park_info.start_date+' '+park_info.start_time+'</span></p>'+
							'<p>发布时间:<span>'+park_info.end_date+' '+park_info.end_time+'</span></p>'+
//							'<p class="parking_fee">停车费:<span>5元/小时</span></p>'+
						'</div>'+
					'</div>';
					if(order_info.data.length!=0){
						_html +='<div class="orderlist"><h3>租用列表</h3>';
						for(var i=0;i<order_info.data.length;i++){
							_html +='<div class="order-num">'+
								'<p class="order_c">订单号：<span>'+order_info.data[i].order_sn+'</span></p>'+
								'<p>下单时间：<span>'+order_info.data[i].submit_time+'</span></p>'+
								'<p>开始时间：<span>'+order_info.data[i].start_time+'</span></p>'+
								'<p>结束时间：<span>'+order_info.data[i].end_time+'</span></p>'+
								'<p>停车费：<span>'+order_info.data[i].order_amount/100+'元</span></p>'+
							'</div>';
						};
						_html +='</div>';
					};
					vl.innerHTML = _html;
					vl.removeAttribute('v-cloak');
				}else if(res.code==509){
					_this.userDetail();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		});
	},
	init:function(){
		this.ws = plus.webview.currentWebview();
		this.userDetail();
	}
}
mui.plusReady(function(){
	rentDetails.init();
})