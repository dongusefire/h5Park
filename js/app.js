var AJAX_PATH = 'http://bj.ecosysnet.com:7098/api';
var AJAX_HOST = 'http://bj.ecosysnet.com:7098';
var app = {
	name:"易惠停",
	trim:function(str){
		return str.replace(/(^\s*)|(\s*$)/g,"");
	},
	addRoute:function(str){
		if(str.indexOf('index')==-1 && str.length!=1){
			str = '/template/'+str;
		};
		if (self != top) { 
		　	window.top.location.href = str;
		}else{
			location.href = str;
		};
	},
	getRequest:function() {    
	   var url = location.search; //获取url中"?"符后的字串    
	   var theRequest = new Object();    
	   if (url.indexOf("?") != -1) {        
	       var str = url.substr(1);        
	       strs = str.split("&");        
	       for(var i = 0; i < strs.length; i ++) {          
	           theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
	       }
	   }
	   return theRequest;
	}
};
//发送验证码  resCallback:ajax成功后的回调；completeCallback:ajax完成后的回调
function smsSend(phone,type,resCallback,completeCallback){
	mui.ajax(AJAX_PATH+'/sms/send',{
		data:{
			"phone_number":phone, //手机号
			"code_type":type //验证码类型|必须    （1-注册，2-登录，3-添加车辆，4-提现）
		},
		dataType:'json',
		type:'POST',
		success:function(res,textStatus,xhr){
			if(res.code!=200){
				mui.alert(res.msg,app.name+'提示','确定',null);
			}else{
				resCallback(res,textStatus,xhr)
			};
		},
		complete:function(xhr, status){
			completeCallback(xhr,status);
		}
	});
};
function login(str){
	if(!str || str==''){
		str='尚未登录或登录已过期';
	};
	mui.alert(str,app.name+'提示','去登录',function(){
		app.addRoute('login.html');
	});
};
//设置ajax全局的beforeSend
mui.ajaxSettings.beforeSend = function(xhr, setting) {
	console.log('beforeSend:' + JSON.stringify(setting));
};
//设置ajax全局的complete
mui.ajaxSettings.complete = function(xhr, status) {
	console.log('complete:' + status,xhr,xhr.response);
	if(xhr.response&&xhr.response!=''){
		var res = mui.parseJSON(xhr.response);
		if(res.code==502 || res.code==503){
			login('登录已过期')
		}else if(res.code==509){ 
			localStorage.setItem('token',res.data.newToken);
		};
	};
};
   