mui.init();
var vm = new Vue({
	el:'.mui-content',
	data:{
		items:[],
		car_id:'',
		token:null
	},
	methods:{
		getData:function(){
			this.token = localStorage.getItem('token');
			if(this.token && this.token!=''){
				this.readData();
			}else{
				login('尚未登录或登录已过期')
			};
		},
		openView:function(){
			mui.openWindow('add_vehicle.html','add_vehicle.html',{
				styles:{
					bottom:0,
					top:0,
					width:'100%',
					popGesture: "close",
					statusbar:{
						background:"#fff" 
					}
				}
			})
		},
		readData:function(){
			var _this = this;
			mui.ajax(AJAX_PATH+'/user/car/list?token='+this.token,{
				dataType:'json',
				type:'get',
				success:function(res,textStatus,xhr){
					if(res.code==200){
						_this.items = res.data;
					}else if(res.code==509){
						_this.readData();
					}else if(res.code!=502 && res.code!=503){
						mui.alert(res.msg,app.name+'提示','确定',null);
					};
				}
			});
		},
		changeDefault:function(index){
			var list = this.items;
			var oid = 0;
			var jsonData = JSON.stringify({car_number:list[index].car_number});
			for(var i=0;i<list.length;i++){
				if(list[i].default==1){
					oid = i;
				};
				if(i!=index){
					list[i].default = 0;
				}else{
					list[i].default = 1;
				};
			};
			mui.ajax(AJAX_PATH+'/user/car/default?token='+this.token,{
				data:jsonData,
				dataType:'json',
				type:'post',
				success:function(res,textStatus,xhr){
					if(res.code==200){
						mui.toast(res.msg)
					}else if(res.code==509){
						_this.changeDefault(index);
					}else{
						for(var i=0;i<list.length;i++){
							if(i==oid){
								list[i].default = 1;
							}else{
								list[i].default = 0;
							};
						};
						if(res.code!=502 && res.code!=503){
							mui.alert(res.msg,app.name+'提示','确定',null);
						};
					};
				}
			});
		},
		removeVehicle:function(index){
			var list = this.items;
			var arr = [];
			var _this = this;
			var jsonData = JSON.stringify({car_number:list[index].car_number});
			mui.ajax(AJAX_PATH+'/user/car/delete?token='+this.token,{
				data:jsonData,
				dataType:'json',
				type:'post',
				success:function(res,textStatus,xhr){
					if(res.code==200){
						mui.toast(res.msg);
						for(var i=0;i<list.length;i++){
							if(i!=index){
								arr.push(list[i])
							};
						};
						_this.items = arr;
						_this.readData();
					}else if(res.code==509){
						_this.removeVehicle(index);
					}else if(res.code!=502 && res.code!=503){
						mui.alert(res.msg,app.name+'提示','确定',null);
					};
				}
			});
		}
	}
})
mui.plusReady(function(){
	vm.getData();
})
//设置更新事件
window.addEventListener('readData',function(){
	vm.readData();
});