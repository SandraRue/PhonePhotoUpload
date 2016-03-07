jQuery.fn.extend({
	
	PhonePhotoUpload : function(config) {
		
		//设置默认值
		var defaults={
	            remoteUrl:window.location.href,//设置图片上传路径
	            redirectUrl:window.location.href,//设置上传完成后的跳转路径
				ContentColor:'white',//设置上传模块的背景色
				IconColor:"#999",//设置添加与删除图标的颜色
				BorderColor:"#eee",//设置添加与删除图标以及图片的边框颜色
				ButtonColor:"orange",//设置上传按钮的背景颜色
				BtnFontColor:"#eee",//设置上传按钮的字体颜色
				BtnText:"上传已选择的文件",//设置上传按钮的文字
				ImgSize:'300',//设置图片压缩后的宽度
				PicCount:'9',//设置上传图片的限制数量
				GetUrls:null, // 设置上传完成后要处理已上传图片URLs的函数
				Weixin:null, //微信jssdk已配置对象
		};
				
		//页面传值，覆盖默认值
		$.each(config,function(k,v){
			
			if (v != undefined){
				
				switch(k){
					case 'remoteUrl':
						defaults.remoteUrl = v;
						break;
					case 'redirectUrl':
						defaults.redirectUrl = v;
						break;
					case 'ContentColor':
						defaults.ContentColor = v;
						break;
					case 'IconColor':
						defaults.IconColor = v;
						break;
					case 'BorderColor':
						defaults.BorderColor = v;
						break;
					case 'ButtonColor':
						defaults.ButtonColor = v;
						break;
					case 'BtnFontColor':
						defaults.BtnFontColor = v;
						break;
					case 'BtnText':
						defaults.BtnText = v;
						break;
					case 'ImgSize':
						defaults.ImgSize = v;
						break;
					case 'PicCount':
						defaults.PicCount = v;
						break;
					case 'GetUrls':
						defaults.GetUrls = v;
						break;
					case 'Weixin':
						defaults.Weixin = v;
						break;
				}
			}
		});
				
				
		/**
		 * 初始化全局变量
		 */
		var states = new Array(this.length); // this.length 是要生成的 控件数,states用于存放各控件的数据
				
		/**
		 * 初始化界面
		 */
		var init = function(divs) { // divs 是控件容器div集，此变量是上面this.length的this，由后面调用init(this)时传进来

			divs.each(function(i) { // i是控件容器在容器集中的索引数字
				
				// 当前控件的状态数据，在后面控件运行时，这些值会被改变
				states[i] = {
					UploadSuccessed:false, 				// 上传是否已经成功完成
					ProgressBarAnimationDone:false,		// 进度条动画是否已播放完成
					ProgressBarAnimationRuning:false	// 进度条动画是否正在播放
				};
				
				// 当前控件容器，注意此this不同上面this.length的this
				var plugin_container = this;
				
				// 给当前容器一个唯一的id值，以便后面调用
				$(plugin_container).attr("id","PhonePhotoUpload"+i);
				
				// 设置容器的背景颜色
				$(plugin_container).css("background",defaults.ContentColor);

				
				
				/**************************
				 * 从这里开始组装控件的HTML **
				 *************************/
				
				// 图片舞台，用于显示已选择的图片
				var HTML_ImageStatus = '<div id="PhonePhotoUpload_stage'+ i + '" style="overflow:hidden;"></div>';
						
						
				// 添加删除操作按钮,纯HTML+CSS拼接 "+" "-" 图标
				var HTML_OperaBtn = '<div id="PhonePhotoUpload_OperaBtn'+ i + '" style="width:132px; height:64px; overflow:hidden;padding-bottom:2px;">' + 
				                         '<div id="PhonePhotoUpload_OperaBtn_Add'+ i + '" style="height:60px;width:60px;float:left;margin:2px;border:1px solid '+defaults.BorderColor+';background:'+ defaults.ContentColor +';">'+
					                         '<div style="height:30px;width:30px;float:left;margin:15px;background:'+ defaults.IconColor +';">'+
					                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';float:left;margin:0;"></div>'+
					                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';margin:0;float:right;"></div>'+
					                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';margin:0;float:left;margin-top:2px;"></div>'+
					                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';margin:0;margin-top:2px;float:right;"></div>'+
					                         '</div>'+
				                         '</div>'+
				                         '<div id="PhonePhotoUpload_OperaBtn_Remove'+ i + '" style="height:60px;width:60px;display:none;margin:2px;border:1px solid '+defaults.BorderColor+';float:right;">'+
					                         '<div style="height:30px;width:30px;margin:15px;">'+
					                         	'<div style="height:2px;width:30px;background:'+defaults.IconColor+';margin-top:29px;"></div>'+
					                         '</div>'+
				                         '</div>'+
				                    '</div>';
						
				// 点击添加图片时，显示的命令菜单：单选，多选，还是拍照
				var HTML_CMenu = '<div id="PhonePhotoUpload_CMenu'+ i + '" style="display:none;position:fixed;top:0;left:0;background:white;width:100%;height:100%;background: rgba(0, 0, 0, 0.6);text-align:center;">' + 
				 				 		'<span id="PhonePhotoUpload_CMenu_multiple_btn' + i + '"  style="padding:0 5px;font-size:14px;border:none;background:white;line-height:35px;'+
				 				 																		'border:1px solid #eee;margin:5px;display: inline-block;margin-top:100px;border-radius:2px;">从相册添加多张图片</span>'+
				 				 		'<span id="PhonePhotoUpload_CMenu_single_btn'+ i + '"  style="padding:0 5px;font-size:14px;border:none;background:white;line-height:35px;'+
				 				 																	 'border:1px solid #eee;margin:5px;display: inline-block;margin-top:100px;border-radius:2px;">拍照或添加单张图片</span>'+
				                 '</div>';
						
				// 两个html原生input控件，用于触发浏览器的选择文件对话框
				var HTML_InputControls = '<div id="PhonePhotoUpload_InputControls'+ i + '" style="display:none">'+
												'<input type="file" multiple="multiple" id="PhonePhotoUpload_InputControls_multiple_selector'+ i+ '">'+
												'<input type="file" id="PhonePhotoUpload_InputControls_single_selector'+ i + '">'+
										 '</div>';
						
				// 上传按钮，当用户选择好图片后，点击以把它们上传到服务器
				var HTML_UploadBtn = '<div id="PhonePhotoUpload_UploadBtn_wrap'+ i + '">'+
				                          '<div id="PhonePhotoUpload_UploadBtn'+ i + '" style="margin-top:5px;padding:8px 0;width:100%;text-align:center;background:'+defaults.ButtonColor+';color:'+defaults.BtnFontColor+';border-radius:2px;">'+defaults.BtnText+'</div>'+
									 '</div>';
						
				// 用于压缩图片的Canvas容器
				var HTML_RS = '<div style="width:0px;height:0px;overflow:hidden;"><div id="PhonePhotoUpload_tmpImgs'+ i + '"></div><div id="PhonePhotoUpload_Canvases'+ i + '"></div><div id="PhonePhotoUpload_RS'+ i + '"></div></div>';
				
				// 用于显示上传状态的容器
				var HTML_Upload_status='<div id="PhonePhotoUpload_Status'+i+'" style="display:none;position:fixed;background: rgba(0, 0, 0, 0.6);width:100%;text-align:center;font-weight:bold;color:white;"></div>';
						
				// 组装所有HTML
				$(plugin_container).append(HTML_Upload_status);
				$(plugin_container).append(HTML_ImageStatus);
				$(plugin_container).append(HTML_OperaBtn);
				$(plugin_container).append(HTML_CMenu);
				$(plugin_container).append(HTML_InputControls);
				$(plugin_container).append(HTML_UploadBtn);
				$(plugin_container).append(HTML_RS);

						
						
				
				
				/***************************
				 * 从这里开始绑定事件处理函数 **
				 ***************************/
				
				
				// 添加按钮，显示“单传或多传”选择菜单
				$("#PhonePhotoUpload_OperaBtn_Add"+ i).bind("click",i,PhonePhotoUpload_AddBtn_Click);
			
				// 删除按钮,把图片舞台里的图片变成可点击删除状态
				$("#PhonePhotoUpload_OperaBtn_Remove"+ i).bind("click",i,PhonePhotoUpload_OperaDelBtn_click);
				
				// 命令菜单自我隐藏
				$("#PhonePhotoUpload_CMenu"+ i).bind("click",i,PhonePhotoUpload_CMenu_Click);
				
				
				
				// "从相册添加多张图片" 按钮点击
				$("#PhonePhotoUpload_CMenu_multiple_btn"+ i).bind("click",i,function(e){
					// 触发input multiple click 事件
					$("#PhonePhotoUpload_InputControls_multiple_selector"+ i).click();
				});
				
				// "拍照或添加单张图片" 按钮点击
				$("#PhonePhotoUpload_CMenu_single_btn"+ i).bind("click",i,function(e){
					// 触发input single click 事件
					$("#PhonePhotoUpload_InputControls_single_selector"+ i).click();
				});
				
				// multiple input onchange事件
				$("#PhonePhotoUpload_InputControls_multiple_selector"+ i).bind("change",i,multiple_selector_proccessor);
				// single input onchange事件
				$("#PhonePhotoUpload_InputControls_single_selector"+ i).bind("change",i,single_selector_proccessor);
				
				
				
				//切换图片舞台为不可操作状态事件
				$("#PhonePhotoUpload"+i).bind("click",i,PhonePhotoUpload_OperaDelBtn_hide);
				
				
				// 点击上传按钮事件
				$("#PhonePhotoUpload_UploadBtn"+ i).bind("click",i,PhonePhotoUpload_UploadBtn_limit);
						
			});
		};
		
		
		
		/***************************
		 * 定义所有的事件处理函数     **
		 ***************************/
		
		/**
		 * 点击添加图片按钮
		 */
		var PhonePhotoUpload_AddBtn_Click=function(e){
			
			var plugin_container_index = e.data;
			
			var isWeiXin = function (){
			    var ua = window.navigator.userAgent.toLowerCase();
			    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
			        return true;
			    }else{
			        return false;
			    }
			}
			
			// 如果有微信组件可以用，那么则直接调用微信组件，不再显示菜单
			if (defaults.Weixin && isWeiXin()) {
				console.log('微信组件可用');

				wx.chooseImage({
				    count:defaults.PicCount, // 默认9
				    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				    success: function (res) {
				       alert(res); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
				       PhonePhotoUpload_AppendPhotoToStage(res.localIds,plugin_container_index,true);
				       $.each(res,function(k,v){
				    	   alert(k+':'+v);
				       });
				    },
				    fail:function(){
				    	alert('hehe');
				    }
				});
				
			} else {
				console.log('微信组件不可用');
				$("#PhonePhotoUpload_CMenu"+ plugin_container_index).css('display','block');
			}
			
			
			//阻止事件冒泡操作
			e.stopPropagation();
			
		};
		
		/*
		 * 删除按钮点击事件处理器
		 */
		var PhonePhotoUpload_OperaDelBtn_click=function(e){
			
			// 把图片舞台切换为可操作状态
			PhonePhotoUpload_ImageStatus_toggle(e.data,true);
			 
			// 隐藏命令菜单中的删除按钮
			PhonePhotoUpload_OperaDelBtnStatus_toggle(e.data,false);
			//阻止事件冒泡操作
			e.stopPropagation();
			
		};
		
		/*
		 * “单选 、多选” 菜单自我隐藏
		 */
		var PhonePhotoUpload_CMenu_Click=function(e){
			
			$(this).css('display','none');
			//阻止事件冒泡操作
			e.stopPropagation();
			
		};
		
		/**
		 * 多张图片选择器处理函数
		 */
		var multiple_selector_proccessor = function(e) {

			PhonePhotoUpload_selector_proccessor(this,e);
			
		};
		
		/**
		 * 单张图片选择器处理函数
		 */
		var single_selector_proccessor = function(e) {
			
			PhonePhotoUpload_selector_proccessor(this,e);
			 
		};
		
		/*
		 * 点击空白区域时 隐藏删除按钮
		 */
		var PhonePhotoUpload_OperaDelBtn_hide = function(e){
			
			var plugin_container_index = e.data;
			
			// 把图片舞台切换为不可操作状态
			PhonePhotoUpload_ImageStatus_toggle(plugin_container_index,false);
			
			// 显示命令菜单中的删除按钮
			PhonePhotoUpload_OperaDelBtnStatus_toggle(plugin_container_index,true);
			
		};
		
		/*
		 * 点击上传按钮
		 */
		var PhonePhotoUpload_UploadBtn_limit=function(e){
			
			//判断加减按钮是否显示，不显示则表示正在删除状态中，则不运行以下上传操作
			if($('#PhonePhotoUpload_OperaBtn'+e.data).css("display")=="block"){
				//弹出确认框，确认是否上传图片
				
				
				
				var PhonePhotoUpload_confirm=window.confirm("是否上传所选图片!");
				
				
				if(PhonePhotoUpload_confirm==true){
					//判断没图片的情况
					if (PhonePhotoUpload_CheckImageCountOfStage(e.data) < 1){
						alert("还没图片");
					//判断图片张数大于所限制张数的情况
					}else if (PhonePhotoUpload_CheckImageCountOfStage(e.data) > defaults.PicCount){
						alert('一次最多只能上传'+defaults.PicCount+'张图片');
					//有图片并且小于或等于所限制张数时，执行上传操作
					}else{
						PhonePhotoUpload_Status_toggle(e.data,true); console.log(123);
						// 压缩、上传图片
						PhonePhotoUpload_UploadStageImages(e.data);console.log(456);
					}
				}else{
					PhonePhotoUpload_Status_toggle(e.data,false);
				}
			}
			
		}
		
		
		
		
		/*********************
		 * 工具类函数定义      *
		**********************/
		
		// 获取URLObject对象！
		var PhonePhotoUpload_getURLObject=function(){
			
			var URLObject = window.URL ? window.URL : window.webkitURL;
			if (!URLObject) alert('你的浏览器不支持URLObject对象！');
			else return URLObject;
			
		};
		
		// 添加图片到舞台
		var PhonePhotoUpload_AppendPhotoToStage=function(file,plugin_container_index,is_weixin){

			var make_imgbox = function(img_alt,img_src){
				return '<div style="float:left;height:60px;width:60px;display:inline-block;margin:2px;border:1px solid '+defaults.BorderColor+';overflow:hidden;background:'+defaults.ContentColor+'">'+
								'<img alt="'+img_alt+'" src="'+img_src+'">'+
							 '</div>';
			};
			
			var append_html = '';
			
			if (is_weixin) {
				$.each(file,function(data_index){
					append_html += make_imgbox(this,this);
				});
			}else{
				var URLObject = PhonePhotoUpload_getURLObject();
				var name = file.name;
				var src = (typeof file === 'string') ? file : URLObject.createObjectURL(file);
				append_html = make_imgbox(name,src);
			}
			
			
			$('#PhonePhotoUpload_stage'+plugin_container_index).append(append_html);
			$('#PhonePhotoUpload_stage'+plugin_container_index+' img').css({'height':'auto','max-width':'60px'});
			
		};
		
		// input file onchange事件处理器
		var PhonePhotoUpload_selector_proccessor = function(inputElement,e) {
			
			var plugin_container_index = e.data;
			
			var fileList = inputElement.files;
				
			//生成浏览器临时图片  
			for (var i = 0; i < fileList.length; i++) {
				
				var file =fileList[i];
				
				PhonePhotoUpload_AppendPhotoToStage(file,plugin_container_index); 
			}

			PhonePhotoUpload_OperaDelBtnStatus_toggle(plugin_container_index,true);
			 
		};
		
		// 检查舞台上已选择的图片数量
		var PhonePhotoUpload_CheckImageCountOfStage = function (plug_index){
			return $('#PhonePhotoUpload_stage'+plug_index+' img').length;
		};		
		
		// 判断图片舞台上是否有图片，执行减号按钮的隐藏与显示
		var PhonePhotoUpload_OperaDelBtnStatus_toggle=function(plug_index, tag){
			if (tag){
				if(PhonePhotoUpload_CheckImageCountOfStage(plug_index)>0){
					$('#PhonePhotoUpload_OperaBtn_Remove'+plug_index).css("display","inline-block");
				}else{
					$('#PhonePhotoUpload_OperaBtn_Remove'+plug_index).css("display","none");
				}
			}else{
				$('#PhonePhotoUpload_OperaBtn_Remove'+plug_index).css("display","none");
			}

		};
		
		// 切换图片舞台状态
		var PhonePhotoUpload_ImageStatus_toggle = function( plug_index , tag ){
			
			if (tag){
				
				$('#PhonePhotoUpload_OperaBtn'+plug_index).css("display","none");
				
				
				$('#PhonePhotoUpload_stage'+plug_index+' div').wrap('<div style="display:inline-block;margin:2px;" class="PhonePhotoUpload_stage_Img'+plug_index+'"></div>');
				$('#PhonePhotoUpload_stage'+plug_index+' > div.PhonePhotoUpload_stage_Img'+plug_index+' div').before('<span style="color:white;background:red;float:right;position:relative;margin-left:-21px;z-index:1;font-size:15px;padding-right:1px;margin-top:-5px;height:15px;padding:3px 5px;">x</span>');
				$('#PhonePhotoUpload_stage'+plug_index+' > div.PhonePhotoUpload_stage_Img'+plug_index+' div').css("display","block");
				$('.PhonePhotoUpload_stage_Img'+plug_index).css("background","red");
				$('.PhonePhotoUpload_stage_Img'+plug_index).css("overflow","hidden");
				$('.PhonePhotoUpload_stage_Img'+plug_index+' img').css("border","none");
				$('.PhonePhotoUpload_stage_Img'+plug_index+' img').css("height","auto");
				$('.PhonePhotoUpload_stage_Img'+plug_index+' img').css("overflow","hidden");
				
				// 绑定点击事件，点击图片外层div可直接删除自己
				$('#PhonePhotoUpload_stage'+plug_index+' > div.PhonePhotoUpload_stage_Img'+plug_index).bind('click',plug_index,function(e){
					  $(this).remove();
					  //图片删除到0张的时候显示添加按钮
					  if(PhonePhotoUpload_CheckImageCountOfStage(plug_index)==0){
						  $('#PhonePhotoUpload_OperaBtn'+plug_index).css("display","block");
					  }
					//阻止事件冒泡操作
					  e.stopPropagation();
				});
				
			}else{
				
				$('#PhonePhotoUpload_OperaBtn'+plug_index).css("display","block");
				
				
				$('#PhonePhotoUpload_stage'+plug_index+' div').css("display","inline-block");
				$('#PhonePhotoUpload_stage'+plug_index+' div').each(function(){
					
					$('#PhonePhotoUpload_stage'+plug_index).append(this);
					
				});
				$('.PhonePhotoUpload_stage_Img'+plug_index).remove();

			}

		};
		
		
		
		
		
		
	
				
				
				/*
				 * 切换上传状态提示
				 */
				var PhonePhotoUpload_Status_toggle = function( plug_index , status ){
					if(status){
						
						$('#PhonePhotoUpload_Status'+plug_index).html('图片正在准备上传，请稍候...');
						
						//未上传成功时显示上传状态
						$('#PhonePhotoUpload_Status'+plug_index).css("display","block");
						//设置提示语的高度与行高
						var PhonePhotoUpload_Status_height=$('#PhonePhotoUpload'+plug_index).height();
						$('#PhonePhotoUpload_Status'+plug_index).css("height",PhonePhotoUpload_Status_height+"px");
						$('#PhonePhotoUpload_Status'+plug_index).css("line-height",PhonePhotoUpload_Status_height+"px");
						
						// 开启进度条
						PhonePhotoUpload_Status_ProgressBar( plug_index );
						
					}else{
						
						//上传完成时提示框消失
						$('#PhonePhotoUpload_Status'+plug_index).css("display","none");
					}
				}
				
				/**
				 * 启动进度条
				 */
				var PhonePhotoUpload_Status_ProgressBar = function( plug_index ){

						// 动画已经在运行，不必重复操作
						if (states[plug_index].ProgressBarAnimationRuning) return;
						else{
							
							var ProgressBar_html  = '<div id="PhonePhotoUpload_Status_ProgressBar'+plug_index+'">';
								ProgressBar_html += 	'<div id="PhonePhotoUpload_Status_ProgressBar_Percent'+plug_index+'" style="line-height:30px;text-align:center;font-size:16px;">';
								ProgressBar_html += 		'<span id="PhonePhotoUpload_Status_ProgressBar_Percent_Number'+plug_index+'">0%</span>';
								ProgressBar_html += 	'</div>';
								ProgressBar_html += 	'<div id="PhonePhotoUpload_Status_ProgressBar_BarWrap'+plug_index+'" style="width:100%; background-color:#FFF;">';
								ProgressBar_html += 		'<div id="PhonePhotoUpload_Status_ProgressBar_BarState'+plug_index+'" style="width:0%; background-color:green; height:30px;"></div>';
								ProgressBar_html += 	'</div>';
								ProgressBar_html += 	'<div id="PhonePhotoUpload_Status_ProgressBar_MSG'+plug_index+'" style="line-height:30px;text-align:center;font-size:16px;"></div>';
								ProgressBar_html += '</div>';
							
							$('#PhonePhotoUpload_Status'+plug_index).html(ProgressBar_html);
							
							// 启动虚拟进度
							var sync_percent_number = function(){
										
										var percent = 0;
										
										var bar = parseInt($("#PhonePhotoUpload_Status_ProgressBar_BarState"+plug_index).width());
										var wrap = parseInt($("#PhonePhotoUpload_Status_ProgressBar_BarWrap"+plug_index).width());
										percent = parseInt( (bar / wrap)*100 );
										
										$("#PhonePhotoUpload_Status_ProgressBar_Percent_Number"+plug_index).html(percent+"%");
								};
							var sync_percent_number_IntervalID = setInterval(sync_percent_number,200);
							
							
							var animation_speed = (PhonePhotoUpload_CheckImageCountOfStage(plug_index)*1000);
							console.log(animation_speed);
							
							$("#PhonePhotoUpload_Status_ProgressBar_BarState"+plug_index).animate({width:"67%"},animation_speed,'swing',function(){
								
								// 启动动画完成,进度显示为60%,轮询真实上传状态，如成功，则把进度显示为100%
								var get_real_upload_state_IntervalID = null;
								var get_real_upload_state_runcount = 0;
								var get_real_upload_state = function(){
									get_real_upload_state_runcount++;
									if (states[plug_index].UploadSuccessed){ //真实上传状态
										$("#PhonePhotoUpload_Status_ProgressBar_BarState"+plug_index).animate({width:"100%"},1000,'swing',function(){
											// 标示动画100%完成状态
											clearInterval(get_real_upload_state_IntervalID);
											clearInterval(sync_percent_number_IntervalID);
											$('#PhonePhotoUpload_Status'+plug_index).html('上传完成！');
											states[plug_index].ProgressBarAnimationDone = true;
										});
									}else{
										var dot_length = get_real_upload_state_runcount%6;
										var dot_str = '.';
										for (var i = 0; i < dot_length; i++) dot_str += '.';
										
										if (get_real_upload_state_runcount > 15) $("#PhonePhotoUpload_Status_ProgressBar_MSG"+plug_index).html("您当前网速比较慢，请耐心等候"+dot_str);
									}
								};
								get_real_upload_state_IntervalID = setInterval(get_real_upload_state,200);
							});
							
						}
					
				}
				
				

				
				

				

				
				
				
				
				// 压缩、上传图片
				var PhonePhotoUpload_UploadStageImages = function (plug_index){
					
					$('#PhonePhotoUpload_stage'+plug_index+' img').each(function(i){
						
						$("#PhonePhotoUpload_tmpImgs"+plug_index).append('<img id="PhonePhotoUpload_tmpImgs'+plug_index+'_img'+i+'" src="'+this.src+'" style="max-width:'+defaults.ImgSize+'px;">');
						
						$("#PhonePhotoUpload_tmpImgs"+plug_index+"_img"+i).bind('load',function(){
							
							
							$("#PhonePhotoUpload_Canvases"+plug_index).append('<canvas id="PhonePhotoUpload_Canvases'+plug_index+'_canvas'+i+'" width="'+$(this).width()+'" height="'+$(this).height()+'"></canvas>');
							var myCanvas = $("#PhonePhotoUpload_Canvases"+plug_index+"_canvas"+i).get(0);
					        var ctx = myCanvas.getContext("2d");

					        ctx.drawImage(this,0,0,myCanvas.width,myCanvas.height);
					        var imageData = null;
					        try{
					        	imageData = myCanvas.toDataURL("image/png");
					        }catch(e){
					        	alert(e);
					        }
					        
					        $("#PhonePhotoUpload_RS"+plug_index).append('<img src="'+imageData+'">');
					        
					        if ($("#PhonePhotoUpload_RS"+plug_index+" img").length == $('#PhonePhotoUpload_stage'+plug_index+' img').length){
					        	
					        	upload_fun();
					        }
							
						});


					});
					
					//上传
					var upload_fun = function(){
						
						//提示上传成功
						var rsData = {};
						
						$("#PhonePhotoUpload_RS"+plug_index+" img").each(function(i){
							eval('rsData.image'+i+'="'+this.src+'"');
						});
						
						$.post(defaults.remoteUrl, rsData,function(data){
							console.log('success');
							if (data.status == "success"){
								//上传成功
								
								// 标示全局上传成功状态
								states[plug_index].UploadSuccessed = true;
								
								// 轮询动画完成状态
								var checkProBarAnimationState_IntervalID = null;
								var checkProBarAnimationState = function(){
										if (states[plug_index].ProgressBarAnimationDone){
											
											clearInterval(checkProBarAnimationState_IntervalID);
											
											if (data.msg) alert(data.msg);
											else alert('上传成功');
											
											//隐藏上传显示框
											PhonePhotoUpload_Status_toggle(plug_index,false);
											
											//把数据传给回调函数
											if (defaults.GetUrls) {
												defaults.GetUrls(data.urls);
											}else{
												//页面跳转
												location.href=defaults.redirectUrl;
											}
											
											
											
										}
									};
								checkProBarAnimationState_IntervalID = setInterval(checkProBarAnimationState,200);
								
								
							}else if(data.status == "error"){
								if (data.msg) alert(data.msg);
								else alert('上传失败！');
							}else{
								if (data.msg) alert(data.msg);
								else alert('服务器返回了未知状态，无法判断上传结果！');
							}
							

						},"json");
					};

					
					
				};
				
				
				init(this);

			},

		});