mui.init();
var token,ws;
var mask = mui.createMask();
mui.plusReady(function(){
	token=localStorage.getItem('token');
	ws=plus.webview.currentWebview();
	readData();
	plus.nativeUI.showWaiting('信息加载中，请稍候...',{
		modal:true,
		padlock:true
	});
	mask.show();//显示遮罩
	document.getElementById("details").addEventListener('tap',function(){
			mui.openWindow({
			url:'balance.html',
			id:'balance.html',
			styles:{
				popGesture: "close",
					statusbar:{
						background:"#fff" 
					}
			}
	      })
    })
});
var html_="";
function readData(){
	mui.ajax(AJAX_PATH+'/profit/price?token='+token,{
		type:'get',
		dataType:'json',
		data:{},
		success:function(res){
			plus.nativeUI.closeWaiting();
			mask.close();//关闭遮罩层
			if(res.code==200){
				var _data=res.data;
				console.log(JSON.stringify(_data));
				html_+= '<span class="num">'+(_data.profitTotal/100)+'</span>元';
				$('.money').append(html_);
			}else if(res.code==509){
				readData();
			}else if(res.code!=502 &&res.code!=503){
				plus.nativeUI.closeWaiting();
				mask.close();//关闭遮罩层
				mui.alert(res.msg,app.name+'提示','确定',null);
			};
			
		}
		
	})
};

