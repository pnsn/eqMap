//The following is common js
$(function(){
 // flash-messages
 //keep the iframes poachers out!
 // if(location != top.location){
 //   $.ajax({
 //      type: 'POST',
 //      url: "/iframe_users",
 //      data: {url: top.location}
 //    });
 //   var url="http://www.pnsn.org";
 //    var redirect=confirm("A Message from the PNSN: \nIt appears that somebody is embeding our site without our permission. Please notify the webmaster of this site at: \n" + top.location +
 //    "\nClick OK to go directly to "  + url);
 //    if(redirect) {
 //    window.location=url;
 //    }
 //
 // }

  $('#flash-messages').delay(15000).fadeOut(2000);
  $('#flash-messages a.close').click( function(){
    $('#flash-messages').stop().fadeOut();
    return false;
  });
 
 
  $('#welcome').delay(5000).slideUp(600);
  // $("table.zebra tr:even").addClass("even");
 $('#search :text').focus(function(){
   if($(this).val() == "Search"){
     $(this).val("");
   }
 });
 
 $('.secondary-nav ul.depth-1 > li a:not(.no-slide), .secondary-nav ul.depth-2 > li a:not(.no-slide)').click( function(){
    $(this).parent().children('ul').slideToggle();
    return false;
  });
  
  
  $('.tip a').click(function(){return false;});
  
  //disable default behavior of links
  $('table td.label a').click(function(){
    return false;
  });

 $("#hist1-event-ui select").change(function() {
      window.location = "/events/historic/1793-1929?decade=" + $(this).val();
  });

 $("#hist2-event-ui select").change(function() {
      window.location = "/events/historic/1928-1970?decade=" + $(this).val();
  });
  
  // The following sets the heights of certain elements (map, quickshake, homepage)
  // that require a fixed height. 
  
  // TODO: find a better way
    $("#map-container, #quickshake").css({
      height:Math.round(.8*$(window).height())
    });

    // Sets the heights of the home page panels
    $("#twitter-widget").css({
      height:$("#map-container").height()-$("#observations-block").height()-67
    });
    
    $("#recent").css({
      height:$("#map-container").height()-$("#volcano").height()-77
    });
  

  // Replace home with home icon in the breadcrumbs
  $(".home>a").html(' <i class="fa fa-home"></>');

  $(".toggler").click(function(){
    var target = $(this).attr("toggle");
    if($(target).hasClass("toggleable")){
        $(target).toggleClass("off");
    }
  });

  
  //Make a tooltip with: %a.tooltip-icon{rel:'whatever the rel is'}
  //I'm calling it a tooltip, buts its really a popover shhh
  $('.tooltip-icon').addClass("fa fa-info-circle").attr('data-toggle', 'popover');
  
  $('.tooltip-icon[data-toggle="popover"]').popover({
    html: true,
    trigger:'click',
    title: function(){ return $(".tooltip[rev=" + $(this).attr('rel') + "] .title").html()},
    content:function(){ return $(".tooltip[rev=" + $(this).attr('rel') + "] .content").html()}, 
    placement:"auto"
  });
  
  //Make tool tips disappear when clicking away from them
  $('body, .modal').on('click', function (e) {
      $('[data-toggle="popover"]').each(function () {
          //the 'is' for buttons that trigger popups
          //the 'has' for icons within a button that triggers a popup
          if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
              $(this).popover('hide');
          }
      });
  });
  
  // Add loading gif to instances of .loading
  $(".loading").addClass("center-block").append('<i class="fa fa-spinner fa-pulse fa-3x">');  
  
  $(".loading.sm i").replaceWith('<i class="fa fa-spinner fa-pulse fa-2x">');
  // set tab panel ids into url
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');
    $('.nav-tabs a').click(function (e) {
      $(this).tab('show');
      var scrollmem = $('body').scrollTop();
      window.location.hash = this.hash;
      $('html,body').scrollTop(scrollmem);
    });
    
    
    // Show/hide appropriate boxes
    $('.select-all').each(function(){
      var body = $(this).parent(".panel-heading").next(".panel-body");
      var checkbox = $(this).find("input[type=checkbox]");
      
      if (!body.hasClass("in")){
        var isDefault = true;
        body.find(":text, select").each(function(){
          var $this = $(this);
          var value = $this.attr("default") ? $this.attr("default"): "";
          isDefault = isDefault? ($(this).val() == value) : isDefault
        });
        checkbox.prop("checked", isDefault);
        body.toggleClass("select-all-hide", isDefault);
      }
    });
    
    $('.select-all').change(function(){
      var body = $(this).parent(".panel-heading").next(".panel-body");
      var checkbox = $(this).find("input[type=checkbox]");
      var checked = checkbox.is(":checked");
  
      body.find("input, select").each(function(){
        var $this = $(this);
        if (checked){
          if ($this.prop("type")=="checkbox"){
            $(this).attr("checked", "checked");
          } else {
            var value = $this.attr("default") ? $this.attr("default"): "";
            $(this).val(value);
          }
        }
      });

      body.toggleClass("select-all-hide");
    });
    
    //Forcing the tremors map to be centered
    $(".cms>iframe[src='https://tunk.ess.washington.edu/map_display/']").addClass("center-block");

  //returns param value (from stack overflow)
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results==null){
           return null;
        }
        else{
           return results[1] || 0;
        }
    };
    
    //Returns passed in url with the given param removed
    $.removeParam = function(param, url){
      var loc = location.href.split("?");
      var href = "";
      if(loc.length > 1){
        loc = $.grep(loc[1].split("&"), function(p, i){
          return p.split("=")[0] != param;
        });
      
        $.each(loc, function(i, param){
          if(i == 0){ href += "?"}
          if(i == loc.length - 1){
            href += param;
          }else{
            href += param + "&";
          }
        });
      }
      return href;
    };
    if($.urlParam('auto_refresh')){
      window.setInterval(function(){
        window.location = window.location;
      },300000);
    }


});