mui.init();
var rentList = {
	itemList:[],
	webviewOptions:{
		styles:{
			bottom:0,
			top:0,
			width:'100%',
			popGesture: "none",
			statusbar:{
				background:"#fff" 
			}
		}
	},
	spaceList:function(){
		var token = localStorage.getItem('token'),_this=this;
		mui.ajax(AJAX_PATH+'/user/park/space/user_list?token='+token,{
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					var _html = '',data=res.data,vl=mui('.vehicle-list')[0];
					_this.itemList = data;
					if(data.length==0){
						mui('#rent-null')[0].style.display = 'block';
					}else{
						for(var i=0;i<data.length;i++){
						var status = '共享中',_cls='status1',start_time=data[i].p_s_share_start_time,end_time=data[i].p_s_share_end_time;
						if(data[i].share==0){
							status='未共享'
							_cls='status4';
						};
						_html +='<div class="vehicle-box">'+
							'<div class="vehicle-tbar">'+
								'<span class="mui-pull-left vehicle-status status1">'+status+'</span>'+
								'<span class="mui-left mui-pull-right open-details" data-id="'+data[i].id+'">详情></span>'+
							'</div>'+
							'<div class="vehicle-b">'+
								'<b>'+data[i].parking_lot_name+'</b>'+
								'<p>共享开始时间：'+start_time+'</p>'+
								'<p>共享结束时间：'+end_time+'</p>'+
							'</div>'+
						'</div>';
					};
					vl.innerHTML = _html;
					vl.removeAttribute('v-cloak');
					};
				}else if(res.code==509){
					_this.spaceList();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		});
	},
	bindEvent:function(){
		mui('.rent-list').on('tap','.open-details',function(){
			var id = this.dataset.id;
			mui.openWindow({
				url:'Rent_details.html',
				id:'Rent_details.html',
				styles:{
					popGesture: "close",
					statusbar:{
						background:"#fff" 
					}
				},
				extras:{
					rentId:id
				}
			});
		});
	},
	init:function(){
		this.bindEvent();
		this.spaceList();
	}
}
mui.plusReady(function(){
	rentList.init();
})