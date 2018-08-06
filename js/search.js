mui.init();
mui.plusReady(function(){
	var ws = plus.webview.currentWebview();
	vm.point = ws.point;
	vm.getSearch();
})
var vm = new Vue({
	el:'.mui-content',
	data:{
		searchList:['2'],
		items:[],
		point:null,
		keywords:'',
		tabIndex:0
	},
	methods:{
		getSearch:function(){
			var search = localStorage.getItem('search');
			if(search &&search!=''){
				if(search.substring(search.length-7)=='&-嘿嘿嘿-&'){
					search = search.substring(0,search.length-7);
				};
				this.searchList = search.split('&-嘿嘿嘿-&');
			};
		},
		setSearch:function(str){
			if(str!=''){
				var list  = localStorage.getItem('search');
				if(!list || list==''){ //如果是第一次获取的数据，那么就创建search的storage
					localStorage.setItem('search',str);
				}else{
					if(list&&list!=''){
						var arr = list.split('&-嘿嘿嘿-&');
						var arr2 = [];
						for(var i=0;i<arr.length;i++){
							if(str!=arr[i]){
								arr2.push(arr[i])
							};
						};
						localStorage.setItem('search',str+'&-嘿嘿嘿-&'+arr2.join('&-嘿嘿嘿-&'));
					};
				};
			};
		},
		getParking:function(){
			var _this= this;
			mui.ajax(AJAX_PATH+'/parkinglot/search',{
				data:{
					"longitude":this.point.lng,
					"latitude":this.point.lat,
					"sort":'distance',
					"keywords":this.keywords		
				},
				dataType:'json',
				type:'POST',
				success:function(res,textStatus,xhr){
					_this.tabIndex = 1;
					if(res.code==200){
						var _list = res.data.list;
						for(var i=0;i<_list.length;i++){
							_list[i].distance = (_list[i].distance/1000).toFixed(3)
						};
						_this.items = _list;
					}else{
						mui.alert(res.msg,app.name+'提示','确定',null);
					};
				}
			});
		}
	}
});
mui('.header-bar').on('change','#search-input',function(){
	var str = this.value.replace(/^\s+|\s+$/g, '');
	vm.setSearch(str);
})
mui('.header-bar').on('input','#search-input',function(){
	vm.keywords = this.value.replace(/^\s+|\s+$/g, '');
	vm.getParking();
})
mui('.search-list').on('tap','.parking',function(){
	var id = this.getAttribute('id');
	localStorage.setItem('parkingName',vm.items[id].parking_lot_name);
	plus.webview.currentWebview().opener().evalJS('home.bespeak('+vm.items[id].parking_lot_number+')');
});
mui('.search-list').on('tap','.goRoute',function(e){
	var id = this.getAttribute('id');
	localStorage.setItem('parking_lot_address',vm.items[id].parking_lot_address);
	plus.webview.currentWebview().opener().evalJS('home.createRoute('+vm.items[id].longitude+','+vm.items[id].latitude+')');
    e.stopPropagation();
});
