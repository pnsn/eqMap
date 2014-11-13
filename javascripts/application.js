// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
$(function(){
		//add "+" to all li.open classes
		// $("ul li.open > a").each(function(){
		// 	$(this).html($(this).html() + "  +");
	//});
	
	// flash-messages
	//keep the iframes poachers out!
	if(location != top.location){ 
	  $.ajax({
      type: 'POST',
      url: "/iframe_users",
      data: {url: top.location}
    });
	  var url="http://www.pnsn.org"; 
    var redirect=confirm("A Message from the PNSN: \nIt appears that somebody is embeding our site without our permission. Please notify the webmaster of this site at: \n" + top.location + 
	   "\nClick OK to go directly to "  + url); 
    if(redirect) { 
    window.location=url; 
    }
	   
	}
  //dialog for plots
  $(".dialog-plot").dialog({ 
        autoOpen: false,
        width: 1010,
        closeText: "X",
        open: function(){
          $('.loading img').hide();
        }
         });
	
  $('#flash-messages').delay(15000).fadeOut(2000);
  $('#flash-messages a.close').click( function(){
    $('#flash-messages').stop().fadeOut();
    return false;
  });
	
	
  $('#welcome.accent-block').delay(5000).slideUp(600);
  // $("table.zebra tr:even").addClass("even");
	$('#search :text').focus(function(){
		if($(this).val() == "Search"){
			$(this).val("");
		}
	});
	
  // $('.comment-link a').click(function(){
  //   $('#comments').slideToggle();
  //   return false;
  // });
	
	$(".closed .quick-links .arrow, #plot-ui").removeClass("open");
	$("a.slide-toggle").click(function(){
	  $(".slide[rev=" + $(this).attr("rel") + "]").slideToggle();
    $(this).children('.arrow').toggleClass("open");
	  return false;
	});
	


	
	
	$('.secondary-nav ul.depth-1 > li a:not(.no-slide), .secondary-nav ul.depth-2 > li a:not(.no-slide)').click( function(){
    $(this).parent().children('ul').slideToggle();
    return false;
  });
  
  //tabs stuff
  $("ul.tabs").tabs(".panes > .pane", { history: true });
  
  //tooltips
  // $('.tip a').poshytip({
  //   content: function(){ return $(".tooltip[rev=" + $(this).attr('rel') + "]").html();},
  //   className: 'tooltip-open',
  //   alignX: 'left',
  //   alignY: 'top'
  // });
  
  // $('.tip a').click(function(){return false;});
  // 
  // //disable default behavior of links
  // $('table td.label a').click(function(){
  //   return false;
  // });
  
  $('.fancy-button').button();
  $('.fancy-buttonset').buttonset();
  
  // refresh any div with #auto-refresh every 2-min
  // $(".auto-refresh").each(function(){
  //   window.setInterval(function(){
  //     window.location = window.location;
  //   },120000);
  // });
  
  ///forms
  $('.select-all :checkbox').change(function(){
    $this = $(this);
    var fg = $this.parent(".select-all").parent(".label-header").next(".field-group");
    
    if($this.attr("checked")){
      fg.find(":input").each(function(){
        if($(this).attr('type') == "checkbox"){
          $(this).attr("checked", true);
        }else if($(this).attr('type') == "text"){
          $(this).val("");
        }else if($this.parent(".select-all").hasClass("magnitudes")){
          $('#mag_min').val(-2);
          $('#mag_max').val(9);
        }else{
          $('#depth_min').val(0);
          $('#depth_max').val(1000);
        }
     });
     fg.slideUp();
   }else{
     fg.slideDown();
     
   }
    
  });
  
  $('.select-all :checkbox').each(function(){
    $this = $(this);
    var fg = $this.parent(".select-all").parent(".label-header").next(".field-group");
    var cb = fg.find(":checkbox").length;
    var cbChecked = fg.find(":checked").length;
    var tb = fg.find(':text').length;
    var tbEmpty = tb > 0;
      fg.find(":text").each(function(){
        tbEmpty =  $(this).val().length === 0;
      });
    if(cb > 0 && cb == cbChecked || tbEmpty ||
        $this.parent(".select-all").hasClass("magnitudes") && $('#mag_min').val() == -2 && $('#mag_max').val() == 9 ||
        $this.parent(".select-all").hasClass("depths") && $('#depth_min').val() == 0 && $('#depth_max').val() == 1000 ){
      $this.attr("checked",true);
      fg.slideUp();  
    }
        
  });


 $("#hist1-event-ui select").change(function() {
      window.location = "/events/historic/1793-1929?decade=" + $(this).val();
  });

 $("#hist2-event-ui select").change(function() {
      window.location = "/events/historic/1928-1970?decade=" + $(this).val();
  });
  
  
});
	