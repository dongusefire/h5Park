mui.init();
var myParking = {
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
		var userName = localStorage.getItem('phone_number');
		console.log(userName)
		mui.ajax(AJAX_PATH+'/user/park/space/list?token='+token,{
			dataType:'json',
			type:'get',
			success:function(res,textStatus,xhr){
				if(res.code==200){
					var _html = '',data=res.data,vl=mui('.vehicle-list')[0];
					_this.itemList = data;
					for(var i=0;i<data.length;i++){
						var status = '已提交',_cls='status1',name='';
						if(data[i].status==2){
							status='已审核'
							_cls='status2';
						}else if(data[i].status==3){
							status='未通过';
							_cls='status3';
						};
						name=data[i].p_s_building_num+'栋';
						if(data[i].p_s_building_floor[0]=='1'){
							name +='负';	
						};
						name+=data[i].p_s_building_floor[1];
						if(data[i].p_s_building_floor[2]=='1'){
							name +='夹层';	
						}else{
							name+='层';
						};
						name +=(data[i].p_s_building_area+'区'+data[i].p_s_sn);
						_html +='<div class="vehicle-box">'+
							'<div class="vehicle-tbar">'+
								'<span class="mui-pull-left vehicle-name">'+data[i].parking_lot_name+'</span>'+
								'<span class="mui-left vehicle-status mui-pull-right '+_cls+'">'+status+'</span>'+
							'</div>'+
							'<div class="vehicle-b">'+name+'</div>'+
						'</div>';
					};
					vl.innerHTML = _html;
					vl.removeAttribute('v-cloak');
				}else if(res.code==509){
					_this.spaceList();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		});
	},
	bindeEvent:function(){
		var mc = mui('.mui-content'),_this = this;
		mc.on('tap','.addvehicle',function(){
			mui.openWindow('newParkSpace.html','newParkSpace.html',_this.webviewOptions);
		});
		window.addEventListener('upDate',function(){
			_this.spaceList();
		});
	},
	init:function(){
		this.spaceList();
		this.bindeEvent();
	}
}
mui.plusReady(function(){
	myParking.init();
})