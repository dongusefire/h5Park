mui.init();
var token,ws;
var mask = mui.createMask();
var html_="";
var index;
function readData(){
	mui.ajax(AJAX_PATH+'/profit/price?token='+token,{
		type:'get',
		dataType:'json',
		data:{},
		beforeSend:function(){
		index = layer.open({
			type: 2
			,content: '加载中'
			,shadeClose:false
			,shade:'top:47px;background-color: rgba(0,0,0,.2)'
		});
		},
		success:function(res){
			layer.close(index); 
			if(res.code==200){
				var _data=res.data;
				console.log(JSON.stringify(_data));
				html_+= '<span class="num">'+(_data.profitTotal/100)+'</span>元';
				$('.money').append(html_);
			}else if(res.code==509){
				readData();
			}else if(res.code!=502 &&res.code!=503){
				mui.alert(res.msg,app.name+'提示','确定',null);
			};
		}
	})
};
window.onload = function(){
	token = localStorage.getItem('token');
	readData();
	$("#details").click(function(){
		window.location.href = 'balance.html';
	})
}
