mui.init();
var date1,date2,time_start,time_end;
var x = '';
var p_week = [],mapResult=[];
var token;
var ajax_submit = false;
var mask=mui.createMask();
var issue = {
	isShow:false,
	spacePicker:null,
	//获取车位列表
	getCarSpace:function(){
		var this_ = this;
		token = localStorage.getItem('token');
		mui.ajax(AJAX_PATH+'/user/park/space/list?token='+token,{
			type:'get',
			dataType:'json',
			success:function(res){
				var spaceData = res.data;
				if(res.code==200){
					if(res.data==''){
						mui.alert('您还未添加车位，请先添加车位',app.name+'提示','去添加',function(){
							mui.trigger(mui('.addSpace')[0],'tap');
						});
						//数据为空，跳转到添加车位页面
						jQuery(".mySpace").css('display','none');
						jQuery(".addSpace").css('display','block');
						//此处加判断出问题，需要在点击发布的时候做判断
					}else{
						jQuery(".mySpace").css('display','block');
						jQuery(".addSpace").css('display','none');
						//处理车位数据填充到页面
						var space_arr = [],space_arr_checking = [],space_arr_failed = [];
						jQuery.each(spaceData,function(key,value){
							//循环遍历数组，取status为2的车位信息才可以发布
							if(this.status==2){
								space_arr.push(this);
								console.log(JSON.str);
							}else if(this.status==1){
								space_arr_checking.push(this);
							}else if(this.status==3){
								space_arr_failed.push(this);
							}
						});
						//筛选出来的可发布车位继续进行循环
						if(space_arr.length!=0){
							jQuery.each(space_arr,function(key2,value2){
								jQuery(".spaceName").html(space_arr[0].parking_lot_name);
								jQuery(".spaceName").attr('data-id',space_arr[0].id);
							})
						}else{
							if(space_arr_checking.length!=0&&space_arr_failed.length==0){
								mui.alert('您的车位正在审核中，请联系车场管理员',app.name+'提示','去查看',function(){
									app.addRoute('my_parking.html');
								})
							}else if(space_arr_checking.length==0&&space_arr_failed.length!=0){
								mui.alert('您的车位审核未通过，请联系车场管理员',app.name+'提示','去查看',function(){
									app.addRoute('my_parking.html');
								})
							}else if(space_arr_checking.length!=0&&space_arr_failed.length!=0)(
								mui.alert('您的车位审核未完成或者未通过，请到我的车位页面查看',app.name+'提示','去查看',function(){
									app.addRoute('my_parking.html');
								})
							)
						}
						var picker_data = [];
						for(var i=0;i<space_arr.length;i++){
							picker_data.push({value:space_arr[i].id,text:space_arr[i].parking_lot_name});
						}
						this_.spacePicker.setData(picker_data);
					}
				}else if(res.code==509){
					this_.getCarSpace();
				}else if(res.code!=502 && res.code!=503){
					mui.alert(res.msg,app.name+'提示','确定',null);
				};
			}
		})
	},
	//获取时间差
	getTimeDiff:function(startTime, endTime, diffType){
			  //将计算间隔类型字符串转换为小写
			  diffType = diffType.toLowerCase();
			  var sTime = new Date(startTime); //开始时间
			  var eTime = new Date(endTime); //结束时间
			  //作为除数的数字
			  var divNum = 1;
			  switch (diffType) {
			    case "second":
			      divNum = 1000;
			      break;
			    case "minute":
			      divNum = 1000 * 60;
			      break;
			    case "hour":
			      divNum = 1000 * 3600;
			    case "day":
			      divNum = 1000 * 3600 * 24;
			      break;
			    default:
			      break;
			  }
			  return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
	},
	//获取当前时间
	getTimeNow:function(){
		function p(s) {
		    return s < 10 ? '0' + s: s;
		}
		var myDate = new Date();
		//获取当前年
		var year=myDate.getFullYear();
		//获取当前月
		var month=myDate.getMonth()+1;
		//获取当前日
		var date=myDate.getDate(); 
		var h=myDate.getHours();       //获取当前小时数(0-23)
		var m=myDate.getMinutes();     //获取当前分钟数(0-59)
		var m2=myDate.getMinutes()+15; 
		var s=myDate.getSeconds();  
		var now=year+'-'+p(month)+"-"+p(date);
		return now;
	},
	bindEvent:function(){
		var _this = this;
		$('.week_day').on('tap','li',function(){
			jQuery(this).toggleClass('active');
		});
		mui('.chooseDate').on('tap','.startDate',function() {
			var _self = this;
			if(_self.picker) {
				_self.picker.show(function (rs) {
					_self.innerText =  rs.text;
					_self.picker.dispose();
					_self.picker = null;
				});
			} else {
				var optionsJson = this.getAttribute('data-options') || '{}';
				var options = JSON.parse(optionsJson);
				options.beginDate = new Date();
				_self.picker = new mui.DtPicker(options);
				_self.picker.show(function(rs) {
					_self.innerText = rs.text;
					_self.picker.dispose();
					_self.picker = null;
					date1 = _self.innerText;
					var nowDate = _this.getTimeNow();
					var diff = _this.getTimeDiff(date1,date2,'day');
					var diff_now = _this.getTimeDiff(nowDate,date1,'day');
					console.log(diff_now);
					if(diff<1){
						mui.alert('结束日期必须大于起始日期，请重新选择',app.name+'提示','确定',null);
						return false;
					}
					if(diff_now<0){
						mui.alert('开始日期必须大于当前日期，请重新选择',app.name+'提示','确定',null);
						return false;
					}
				});
				_self.picker.setSelectedValue(date1);
			}
		}, false);
		mui('.chooseDate').on('tap','.endDate',function() {
			var _self = this;
			if(_self.picker) {
				_self.picker.show(function (rs) {
					_self.innerText =  rs.text;
					_self.picker.dispose();
					_self.picker = null;
				});
			} else {
				var optionsJson = this.getAttribute('data-options') || '{}';
				var options = JSON.parse(optionsJson);
				options.beginDate = new Date();
				_self.picker = new mui.DtPicker(options);
				_self.picker.show(function(rs) {
					_self.innerText = rs.text;
					_self.picker.dispose();
					_self.picker = null;
					date2 = _self.innerText;
					var diff = _this.getTimeDiff(date1,date2,'day');
					if(diff<0){
						mui.alert('结束日期必须大于起始日期，请重新选择',app.name+'提示','确定',null);
						return false;
					}
				});
				_self.picker.setSelectedValue(date2);
				
			}
		}, false);
		mui('.chooseTime').on('tap','.start_time',function() {
			var _self = this;
			if(_self.picker) {
				_self.picker.show(function (rs) {
					_self.innerText =  rs.text;
					_self.picker.dispose();
					_self.picker = null;
				});
				
			} else {
				var options = {
					"type":"time",
					"customData":{
						"i":[{"text":"15","value":"15"},{"text":"30","value":"30"},{"text":"45","value":"45"},{"text":"00","value":"00"}]
					}
				}
				_self.picker = new mui.DtPicker(options);
				_self.picker.show(function(rs) {
					_self.innerText = rs.text;
					_self.picker.dispose();
					_self.picker = null;
				});
			}
		}, false);
		mui('.chooseTime').on('tap','.end_time',function() {
			var _self = this;
			if(_self.picker) {
				_self.picker.show(function (rs) {
					_self.innerText =  rs.text;
					_self.picker.dispose();
					_self.picker = null;
				});
			} else {
				var options = {
					"type":"time",
					"customData":{
						"i":[{"text":"15","value":"15"},{"text":"30","value":"30"},{"text":"45","value":"45"},{"text":"00","value":"00"}]
					}
				}
				_self.picker = new mui.DtPicker(options);
				_self.picker.show(function(rs) {
					_self.innerText = rs.text;
					_self.picker.dispose();
					_self.picker = null;
				});
			}
		}, false);
		//获取自定义的data-day
		mui(".repeat").on('tap','.week_day li',function(){
			if($(this).hasClass('active')){
				var day = $(this).attr('data-day');
				p_week.push(day)
				mapResult = p_week.map(function(item,index,array){
					return item-0;
				});
				console.log(mapResult.toString());
			}else{
				var day = $(this).attr('data-day');
				var index = jQuery.inArray(day,p_week);
				p_week.splice(index,1);
				mapResult = p_week.map(function(item,index,array){
					return item-0;
				});
				console.log(mapResult.toString());
			}
		});
		mui('.mui-content').on('tap','.issue',function(){
			var data_start_date = jQuery(".startDate").html();
			var data_end_date = jQuery(".endDate").html();
			var data_start_time = jQuery(".start_time").html();
			var data_end_time = jQuery(".end_time").html();
			var id = jQuery(".spaceName").attr('data-id');
			var dataStartDate = data_start_date+' '+data_start_time;
			dataStartDate = new Date(dataStartDate.replace(/-/g,"/"));
			if(data_start_date=='选择开始日期'||data_end_date=='选择结束日期'){
				mui.alert('请选择预定起始与结束日期',app.name+'提示','确定',null);
				return false;
			};
			if(data_start_time=='选择开始时间'||data_end_time=='选择结束时间'){
				mui.alert('请选择预定起始与结束时间',app.name+'提示','确定',null);
				return false;
			};
			if( (new Date()).getTime() > dataStartDate.getTime()){
				mui.alert('开始时间不能小于当前时间',app.name+'提示','确定',null);
				return false;
			};
			if(data_start_time > data_end_time){
				mui.alert('开始时间不能大于结束时间',app.name+'提示','确定',null);
				return false;
			};
			if( (data_end_time.substring(0,2) - data_start_time.substring(0,2))<4 ){
				mui.alert('开始时间与结束时间必须相隔4小时以上',app.name+'提示','确定',null);
				return false;
			};
			if(mapResult.length==0){
				mui.alert('请选择每周共享的星期数',app.name+'提示','确定',null);
				return false;
			};
			var week = mapResult.toString().replace(/,/g, "");
			var jsonData = {
				"id":id,
				"p_s_week":week,
				"start_date":data_start_date,
				"start_time":data_start_time,
				"end_date":data_end_date,
				"end_time":data_end_time
			};
			if(!ajax_submit){
				ajax_submit = true;
				token = localStorage.getItem('token');
				plus.nativeUI.showWaiting();
				mask.show();//显示遮罩
				mui.ajax(AJAX_PATH+'/user/park/space/release?token='+token,{
					type:'post',
					dataType:'json',
					data:JSON.stringify(jsonData),
					success:function(res){
						ajax_submit = false;
						plus.nativeUI.closeWaiting();
						mask.close();//关闭遮罩层
						if(res.code==200){
							console.log('发布成功!');
							//跳转到发布成功页面
							app.addRoute('successfulIssue.html');
						}else if(res.code!=502 && res.code!=503){
							mui.alert(res.msg,app.name+'提示','确定',null);
						}
					}
				})
			}
			
		});
		mui('.paaddSpace').on("tap",".addSpace",function(){
			app.addRoute('newParkSpace.html');
		});
		//点击放租列表
		$('.tolist').click(function(){
			app.addRoute('rentList.html');
		});
		//车位拾取器的处理
		var spaceName = jQuery(".spaceName");
		mui(".mySpace").on('tap','.chooseSpace',function(event){
			_this.spacePicker.show(function(items){
				spaceName.html(items[0].text);
				spaceName.attr('data-id',items[0].value);
			})
		});
	},
	init:function(){
		var token = localStorage.getItem('token');
		if(token && token!=''){
			_this.getCarSpace();
		}else{
			login('请先登录');
		};
		this.bindEvent();
		this.spacePicker = new mui.PopPicker();
	}
}
issue.init();
