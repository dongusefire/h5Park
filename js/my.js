mui.init();
document.getElementById('openLogin').addEventListener('tap',function(){
	mui.openWindow('login.html','login.html');
},false);
mui('.park-nav').on('tap','a',function(){
	var href = this.getAttribute('href');
	var token = localStorage.getItem('token');
	//非plus环境，直接走href跳转
	if(!mui.os.plus) {
		location.href = href;
		return;
	}
	if(href=='#'){
		mui.alert('敬请期待','系统提示','确定',null)
		return false;
	};
	//判断要跳转的页面是否需要登录才能跳转
	if(href.indexOf('setting')==-1){
		if(!token || token==''){
			login();
			return false;
		};
	};
	var options = {
		styles:{
			bottom:0,
			top:0,
			width:'100%',
			popGesture: "close",
			statusbar:{
				background:"#fff" 
			}
		},
		extras:{}
	};
	mui.openWindow(href,href,options);
});
