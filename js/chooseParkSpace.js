mui.init();
var vm = new Vue({
	el:'.mui-content',
	data:{
		items:[],
		keywords:''
	},
	methods:{
		load:function(){
			var that = this;
			var token = localStorage.getItem('token');
			mui.ajax(AJAX_PATH+'/user/park/space/search?token='+token,{
				data:{
					keywords:that.keywords
				},
				dataType:'json',
				type:"get",
				success:function(res){
					if(res.code==200){
						that.items = res.data;
					}else if(res.code==509){
						that.load();
					}else if(res.code!=502 && res.code!=503){
						mui.alert(res.msg,'系统提示','确定',null);
					}
				}
			})
		}
	}
});
var chooseParkSpace = {
	ws:null,
	wo:null,
	bindEvent:function(){
		var _this = this,mc = mui('.mui-content');
		mui.plusReady(function(){
			_this.ws = plus.webview.currentWebview();
			_this.wo = _this.ws.opener();
			vm.load();
		});
		mc.on('tap','.parking',function(){
			mui.fire(_this.wo,'getParking',{
				name:this.dataset.name,
				id:this.dataset.id,
				num:this.dataset.num
			});
			setTimeout(function(){
				_this.ws.close();
			},300);
		})
	},
	init:function(){
		this.bindEvent();
	}
}
chooseParkSpace.init();
