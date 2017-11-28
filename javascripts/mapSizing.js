// Mapping JS for full screen and legend function
$(function(){  
  var offset = "10px";
  var height = $(window).height();
  var width = $(window).width();
  var fullScreen = $.urlParam('full_screen');
  
  // The following sets the heights of certain elements
  // that require a fixed height. 
  $("#map-container").css({
    height: Math.round(.8 * $(window).height())
  });

  //update width&height in case of resizing
  $(window).resize(function() {
    console.log("test")
    if (fullScreen){
    
      height = $(window).height();
      width = $(window).width();
      $("#map-container").height(height);
    }

    if($("#map").is(":visible")){
      recenterMap();
    }
  });
      
  if(fullScreen){
    expandMap();
    $("#expand").hide();
  } 

  $("#map").css({
    height:$("#map-container").height()-$("#map-summary").height()
  });
  
  //Toggle fullscreen
  $(".full-screen").click(function(e){
    var href = $.removeParam("full_screen", location.href);
    if($(this).attr('id') == 'expand'){
     if(!fullScreen){
       if(href.length > 0){ //if there are other params
         loc = "&full_screen=true"
       } else{
         loc = "?full_screen=true"
       }
       location.href = location.href + loc;
     } else {
       expandMap();
     }
    } else {
      location.href=location.href.split("?")[0] + href
    }
    recenterMap();
  });

//Map resizing  
  //Expand the map
  function expandMap(){
    $('#footer').hide();
    $("#map-container").css({
      position:'fixed',
      top:0,
      left:0,
      right:0,
      height:height
    });
    $("#compress").show();
  }

  function recenterMap(){
    $("#map").css({
      height:$("#map-container").height()-$("#map-summary").height()
    }).delay(800);
    var center = eqMap.getCenter();
    google.maps.event.trigger(eqMap, 'resize');
    eqMap.setCenter(center);
    resetLegend(false);
  }

  //set the map-legend to its correct position
  function resetLegend(toggle){
    var legend = $("#map-legend");
    if(toggle){
      legend.toggle();
    }
    legend.css({
      bottom:offset,
      left: offset
    });
  }
  
  $('#display-legend').click(function(){
    resetLegend(true);
  });
  
  $('#legend-close').click(function(){
    resetLegend(true);
    $('#display-legend').prop('checked', false);
  });
  
  //make the legend draggable
  $("#map-legend").draggable({ containment: "#map-container", scroll: false });
});