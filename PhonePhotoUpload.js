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
				};
				
				//页面传值，覆盖默认值
				$.each(config,function(k,v){
					if (v != undefined){
						eval('defaults.'+k+'="'+v+'";');
					}
				});
				
				/**
				 * 初始化界面
				 */
				var init = function(divs) {

					divs.each(function(i) {
						
						var plugin_container = this;
						
						$(plugin_container).attr("id","PhonePhotoUpload"+i);
						
						$(plugin_container).css("background",defaults.ContentColor);

						
						// 初始化图片舞台
						
						var HTML_ImageStatus = '<div id="PhonePhotoUpload_stage'+ i + '" style=" overflow:hidden;"></div>';
						
						
						// 初始化添加删除按钮
						
						var HTML_OperaBtn = '<div id="PhonePhotoUpload_OperaBtn'+ i + '" style="width:132px; height:64px; overflow:hidden;padding-bottom:2px;">' + 
						                         '<div id="PhonePhotoUpload_OperaBtn_Add'+ i + '" style="height:60px;width:60px;float:left;margin:2px;border:1px solid '+defaults.BorderColor+';background:'+ defaults.ContentColor +';">'+
							                         '<div style="height:30px;width:30px;float:left;margin:15px;background:'+ defaults.IconColor +';">'+
							                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';float:left;margin:0;"></div>'+
							                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';margin:0;float:right;"></div>'+
							                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';margin:0;display:inline-block;margin-top:2px;"></div>'+
							                         	'<div style="width:14px;height:14px;background:'+ defaults.ContentColor +';margin:0;margin-top:2px;float:right;"></div>'+
							                         '</div>'+
						                         '</div>'+
						                         '<div id="PhonePhotoUpload_OperaBtn_Remove'+ i + '" style="height:60px;width:60px;display:none;margin:2px;border:1px solid '+defaults.BorderColor+';float:right;">'+
							                         '<div style="height:30px;width:30px;margin:15px;">'+
							                         	'<div style="height:2px;width:30px;background:'+defaults.IconColor+';margin-top:29px;"></div>'+
							                         '</div>'+
						                         '</div>'+
						                    '</div>';
						
						// 初始化命令菜单
						
						var HTML_CMenu = '<div id="PhonePhotoUpload_CMenu'+ i + '" style="display:none;position:fixed;top:0;left:0;background:white;width:100%;height:100%;background: rgba(0, 0, 0, 0.6);text-align:center;">' + 
						 				 		'<span id="PhonePhotoUpload_CMenu_multiple_btn' + i + '"  style="padding:0 5px;font-size:14px;border:none;background:white;line-height:35px;'+
						 				 																		'border:1px solid #eee;margin:5px;display: inline-block;margin-top:100px;border-radius:2px;">从相册添加多张图片</span>'+
						 				 		'<span id="PhonePhotoUpload_CMenu_single_btn'+ i + '"  style="padding:0 5px;font-size:14px;border:none;background:white;line-height:35px;'+
						 				 																	 'border:1px solid #eee;margin:5px;display: inline-block;margin-top:100px;border-radius:2px;">拍照或添加单张图片</span>'+
						                 '</div>';
						
						//初始化上传单张或多张图片按钮操作
						
						var HTML_InputControls = '<div id="PhonePhotoUpload_InputControls'+ i + '" style="display:none">'+
														'<input type="file" multiple="multiple" id="PhonePhotoUpload_InputControls_multiple_selector'+ i+ '">'+
														'<input type="file" id="PhonePhotoUpload_InputControls_single_selector'+ i + '">'+
												 '</div>';
						
						//初始化上传按钮
						
						var HTML_UploadBtn = '<div id="PhonePhotoUpload_UploadBtn_wrap'+ i + '">'+
						                          '<div id="PhonePhotoUpload_UploadBtn'+ i + '" style="margin-top:5px;padding:8px 0;width:100%;text-align:center;background:'+defaults.ButtonColor+';color:'+defaults.BtnFontColor+';border-radius:2px;">'+defaults.BtnText+'</div>'+
											 '</div>';
						
						//初始化图片压缩操作
						
						var HTML_RS = '<div style="width:0px;height:0px;overflow:hidden;"><div id="PhonePhotoUpload_tmpImgs'+ i + '"></div><div id="PhonePhotoUpload_Canvases'+ i + '"></div><div id="PhonePhotoUpload_RS'+ i + '"></div></div>'
				
						//初始化正在上传提示
						
						var HTML_Upload_status='<div id="PhonePhotoUpload_Status'+i+'" style="display:none;position:fixed;background: rgba(0, 0, 0, 0.6);width:100%;text-align:center;font-weight:bold;color:white;">图片正在上传中，请稍候...</div>';
						
						// 组装HTML

						$(plugin_container).append(HTML_Upload_status);
						$(plugin_container).append(HTML_ImageStatus);
						$(plugin_container).append(HTML_OperaBtn);
						$(plugin_container).append(HTML_CMenu);
						$(plugin_container).append(HTML_InputControls);
						$(plugin_container).append(HTML_UploadBtn);
						$(plugin_container).append(HTML_RS);

						
						
						/**
						 * 绑定事件处理函数
						 */
						
						//添加按钮
						$("#PhonePhotoUpload_OperaBtn_Add"+ i).bind("click",i,function(e){
							$("#PhonePhotoUpload_CMenu"+ i).css('display','block');
							//阻止事件冒泡操作
							e.stopPropagation();
						});
					
						//删除按钮,把图片舞台里的图片变成可点击删除状态
						$("#PhonePhotoUpload_OperaBtn_Remove"+ i).bind("click",i,PhonePhotoUpload_OperaDelBtn_click);
						
						//命令菜单自我隐藏
						$("#PhonePhotoUpload_CMenu"+ i).bind("click",i,function(e){
							$(this).css('display','none');
							//阻止事件冒泡操作
							e.stopPropagation();
							
						});
						
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
						$("#PhonePhotoUpload"+i).bind("click",i,PhonePhotoUpload__OperaDelBtn_hide);
						
						
						// 点击上传按钮事件
						$("#PhonePhotoUpload_UploadBtn"+ i).bind("click",i,PhonePhotoUpload_UploadBtn_limit);
						
					});
				};
				
				/*
				 * 点击上传处理函数
				 */
				var PhonePhotoUpload_UploadBtn_limit=function(e){
					//判断加减按钮是否显示，不显示则表示正在删除状态中，则不运行以下上传操作
					if($('#PhonePhotoUpload_OperaBtn'+e.data).css("display")=="block"){
						//弹出确认框，确认是否上传图片
						var PhonePhotoUpload_confirm=confirm("是否上传所选图片!");
						if(PhonePhotoUpload_confirm==true){
							//判断没图片的情况
							if (PhonePhotoUpload_CheckImageCountOfStage(e.data) < 1){
								alert("还没图片");
							//判断图片张数大于所限制张数的情况
							}else if (PhonePhotoUpload_CheckImageCountOfStage(e.data) > defaults.PicCount){
								alert('一次最多只能上传'+defaults.PicCount+'张图片');
							//有图片并且小于或等于所限制张数时，执行上传操作
							}else{
								PhonePhotoUpload_Status_toggle(e.data,true);
								// 压缩、上传图片
								PhonePhotoUpload_UploadStageImages(e.data);
							}
						}
					}
					
				}
				
				
				/*
				 * 切换上传状态提示
				 */
				var PhonePhotoUpload_Status_toggle = function( plug_index , status ){
					if(status){
						//未上传成功时显示上传状态
						$('#PhonePhotoUpload_Status'+plug_index).css("display","block");
						//设置提示语的高度与行高
						var PhonePhotoUpload_Status_height=$('#PhonePhotoUpload'+plug_index).height();
						$('#PhonePhotoUpload_Status'+plug_index).css("height",PhonePhotoUpload_Status_height+"px");
						$('#PhonePhotoUpload_Status'+plug_index).css("line-height",PhonePhotoUpload_Status_height+"px");
					}else{
						//上传完成时提示框消失
						$('#PhonePhotoUpload_Status'+plug_index).css("display","none");
					}
				}
				
				
				/**
				 * 多张图片选择器处理函数
				 */
				var multiple_selector_proccessor = function(e) {
				
					  var fileList = this.files;
					
					 // var dd =document.getElementById('PhonePhotoUpload_stage'+e.data);
						
					//生成浏览器临时图片  
					  for (var i = 0; i < fileList.length; i++) {
						  var file =fileList[i]; 

						  var URLObject = window.URL ? window.URL : window.webkitURL;
						  
						  if (!URLObject) alert('你的浏览器不支持！');
						  
						  var blob = (typeof file === 'string') ? file : URLObject.createObjectURL(file);
						  
						  var imgbox = '<div style="float:left;height:60px;width:60px;display:inline-block;margin:2px;border:1px solid '+defaults.BorderColor+';overflow:hidden;background:'+defaults.ContentColor+'">'+
									  		'<img alt="'+file.name+'" src="'+blob+'">'+
									   '</div>';
						  
						  $('#PhonePhotoUpload_stage'+e.data).append(imgbox);
						  $('#PhonePhotoUpload_stage'+e.data+' img').attr("style","height:auto;max-width:60px;"); 
					  }
					  PhonePhotoUpload_OperaDelBtnStatus_toggle(e.data,true);
				};
				
				/**
				 * 单张图片选择器处理函数
				 */
				var single_selector_proccessor = function(e) {

					 var fileList = this.files;
						
						//  var dd =document.getElementById('PhonePhotoUpload_stage'+e.data);
							
						//生成浏览器临时图片  
						  for (var i = 0; i < fileList.length; i++) {
							  var file =fileList[i]; 

							  var URLObject = window.URL ? window.URL : window.webkitURL;
							  
							  if (!URLObject) alert('你的浏览器不支持！');
							  
							  var blob = (typeof file === 'string') ? file : URLObject.createObjectURL(file);
							  
							  var imgbox = '<div style="height:60px;width:60px;display:inline-block;margin:2px;border:1px solid '+defaults.BorderColor+';overflow:hidden;background:'+defaults.ContentColor+'">'+
										  		'<img alt="'+file.name+'" src="'+blob+'">'+
										   '</div>';
							  
							  $('#PhonePhotoUpload_stage'+e.data).append(imgbox);
							  $('#PhonePhotoUpload_stage'+e.data+' img').attr("style","height:auto;max-width:60px;"); 
						  }
						  PhonePhotoUpload_OperaDelBtnStatus_toggle(e.data,true);
					 
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
				
				/**
				 * 删除按钮隐藏 事件处理器
				 */
				var PhonePhotoUpload__OperaDelBtn_hide = function(e){
					
					// 把图片舞台切换为可操作状态
					PhonePhotoUpload_ImageStatus_toggle(e.data,false);
					
					// 显示命令菜单中的删除按钮
					PhonePhotoUpload_OperaDelBtnStatus_toggle(e.data,true);
					
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
				 * 判断图片舞台上是否有图片，执行减号按钮的隐藏与显示
				 */
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
				
				var PhonePhotoUpload_CheckImageCountOfStage = function (plug_index){
					return $('#PhonePhotoUpload_stage'+plug_index+' img').length;
				};
				
				
				// 压缩、上传图片
				var PhonePhotoUpload_UploadStageImages = function (plug_index){
					
					$('#PhonePhotoUpload_stage'+plug_index+' img').each(function(i){
						
						$("#PhonePhotoUpload_tmpImgs"+plug_index).append('<img id="PhonePhotoUpload_tmpImgs'+plug_index+'_img'+i+'" src="'+this.src+'" style="max-width:'+defaults.ImgSize+'px;">');
						
						$("#PhonePhotoUpload_tmpImgs"+plug_index+"_img"+i).bind('load',function(){
							
							$("#PhonePhotoUpload_Canvases"+plug_index).append('<canvas id="PhonePhotoUpload_Canvases'+plug_index+'_canvas'+i+'" width="'+$(this).width()+'" height="'+$(this).height()+'"></canvas>');
							var myCanvas = $("#PhonePhotoUpload_Canvases"+plug_index+"_canvas"+i).get(0);
					        var ctx = myCanvas.getContext("2d");
					        

					        ctx.drawImage(this,0,0,myCanvas.width,myCanvas.height);
					        
					        var imageData = myCanvas.toDataURL("image/png");
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
							
							if (data.status == "success"){
								//上传成功
								if (data.msg) alert(data.msg);
								else alert('上传成功');
								//隐藏上传显示框
								PhonePhotoUpload_Status_toggle(plug_index,false);
								//页面跳转
								location.href=defaults.redirectUrl;
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