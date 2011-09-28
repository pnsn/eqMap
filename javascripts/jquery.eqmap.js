/* a jquery plugin for creating eq and station maps
  * for seismo networks
  *@author: Jon Connolly joncon@uw.edu
  instantiate with $(elem).eqMap({mapType: someMapType})
  where somemapType is the type of map. This will build map with defaults, all of which can be overriden
  map types are:
  'recent' last two weeks of seismic events
  'notable' historical events greater than mag 3
  'historical' historical events in a given lat/lng box
  'station' station map 
*/


var methods = {
  toggleIcons: function(){
    return null;
  }, 
  //example of a public method that calls a private
  closeInfoWindow: function(){
    closeInfoWindow.call(this);
  }

 };

(function($){
  //the effin plugin
  $.fn.eqMap = function(options){
  
   if ( methods[options] ) { // calling a public method?
      return methods[options].apply( this, Array.prototype.slice.call( arguments, 1 ));
   
    } else if ( typeof options === 'object' || !options ) {
        var overlays ={
          eq: [],
          xSect: [],
          plotHistoric: false
        };
        //start with standard default, overwrite with specific defaults and then
        //overwrite with options
        var opts = $.fn.eqMap.standardDefaults;
         if (options.eqMapType == "thumb"){
           opts = $.extend({}, opts,  $.fn.eqMap.thumbDefaults); 
         }else if(options.eqMapType == "noteable") {
           opts = $.extend({}, opts,  $.fn.eqMap.noteableDefaults); 
          }else if(options.eqMapType == "historic") {
            opts = $.extend({}, opts,  $.fn.eqMap.historicDefaults); 
          }else if(options.eqMapType == "volcano") {
            opts = $.extend({}, opts,  $.fn.eqMap.volcanoDefaults); 
          }
          opts = $.extend({}, opts, options);
         var mapOptions = {
          zoom: opts.zoom,
          center: new google.maps.LatLng(opts.lat, opts.lng),
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          navigationControl: opts.navigationControl,
          draggable: opts.draggable,
    			disableDefaultUI: opts.disableDefaultUI,
    			disableDoubleClickZoom: opts.diableDoubleClickZoom,
    			scrollWheel: opts.scrollWheel,
          navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
           }
         };
        overlays.bounds = new google.maps.LatLngBounds();
        if ($("body.mobile").length > 0){ //if mobile device
          var useragent = navigator.userAgent;
          var mobileLatlng = new google.maps.LatLng(opts.mobileLat, opts.mobileLng);
          mapOptions.zoom = opts.mobileZoom;
          mapOptions.center = mobileLatlng;
          $('body, html, #page, .interior, #content').addClass('max-height');
          $(".mobile-area").addClass('max-area');
          $('#header, #stage-warning, .title, #left-column, #footer, .no-mobile').hide();
        }
        return this.each(function(){
          //ready handlers           
          
          $('#map-ui .checkbox :checkbox').click(function(){
            //closeInfoWindow();
            if ($(this).attr('checked')){
              overlays.authPoly.setMap(eqMap);
            }else{
              overlays.authPoly.setMap(null);
            }
          });
          
          $('.slider-control').addClass("min" + opts.minMag);
          $('#map-ui .slider-control .slider').slider({
            		  value: opts.minMag,
            			min: opts.minMag,
            			max: 9,
            			step: 1,
            			slide: slideControl
          });
          $('span.slider-mag-value').html(opts.minMag);
          $('#map-ui :radio').change(toggleIcon);
          
          $("#map-ui button#reset").click(function(){
            $('#map-ui .slider-control .slider').slider("value", opts.minMag);
            $.each(overlays.eq, function(i,val){                
                val.marker.setMap(eqMap);
            clearCrossSection();
            $('span.slider-mag-value').html(opts.minMag);
            setEqList(opts.minMag);
            });
            $('#define-cross-section').attr('checked',false);
            $('.define-cross-section span').text('Define');
            $('.define-cross-section').removeClass("ui-state-active");
          });
          
          $("#req-legend-key").addClass(opts.eqMapType);
          
          //x-section handlers
          $('#define-cross-section').click(clearCrossSection);

          $('#plot-cross-section').click(plotCrossSection);
          
          $('#define-cross-section').change(function(){ 
            if($('.define-cross-section').hasClass('ui-state-active')){
              $('.define-cross-section span').text('Clear');
            }else{
              $('.define-cross-section span').text('Define');
            }
            });
            $('.change-units a').click(function(){
              $this = $(this);
              $this.hide();
              $(".eq-list thead th span[rev=" +  $this.attr('rev') + "]").hide();
              $(".eq-list thead th span[rev=" +  $this.attr('rel') + "]").show();
              var data = "data-" + $this.attr('rel');
              $(".change-units a[rev=" + $this.attr('rel') + "]").show();
              $(".eq-list tbody td[" + data + "]").html(function(){
                return $(this).attr(data);
              });
              return false;
            });
          
          //extend Latlng for distanceFrom method returns distance in meters
           google.maps.LatLng.prototype.distanceFrom = function(newLatLng) { 
             var R = 6371000; // meters 
             var lat1 = this.lat(); 
             var lon1 = this.lng(); 
             var lat2 = newLatLng.lat(); 
             var lon2 = newLatLng.lng(); 
             var dLat = (lat2-lat1) * Math.PI / 180; 
             var dLon = (lon2-lon1) * Math.PI / 180; 
             var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
               Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) 
           * 
               Math.sin(dLon/2) * Math.sin(dLon/2); 
             var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
             return R * c; 
           };
          
          
          //lets make us a map
          eqMap = new google.maps.Map(this, mapOptions);
          eqMap.infoWindow = new google.maps.InfoWindow();
          //create queryparams to append to url string
          var queryString = "?";
          var ajaxArray = [];
          var count = 0;
          if (!opts.jsonFromFile){
            $.each(opts.ajaxQueryParams, function(key, val){
               queryString += key + "=" + val + "&";
             });
           }
          $.each(opts.ajaxUrlArray, function(i, url){
            $.getJSON(url + queryString, function(json) {
              $.each(json, function(j, response){
                $.each(response, function(key, obj){
                  //plotEq(obj);
                  ajaxArray.push(obj);
                });
              });
              count+=1;
              //set initial sort order
              if(count == opts.ajaxUrlArray.length){
                ajaxArray.sort(function(a,b){
                  return (a.event_time_utc < b.event_time_utc) ? 1 : (a.event_time_utc>b.event_time_utc) ? -1 : 0;
                });
                $.each(ajaxArray, function(k,eq){
                  plotEq(eq);
                });
              }
            });
          });
          init_helper_container();
          google.maps.event.addListener(eqMap, 'click', function(e){
            closeInfoWindow();
            drawXSection(e);
          });
          
        if(opts.polyNodes){
          var paths = buildPolyPoints();
          overlays.authPoly = new google.maps.Polygon({
                map:          null,
                fillOpacity:  0,
                strokeWeight: 1,
                paths: paths
              });
         }
       });
        // end of return
      } else {
        $.error( 'Method ' +  options + ' does not exist on jQuery.eqmap' );
      }//end of is/else
        
//private methods


//  //plot eqs, clickable list view of all events
//  // and bind events to list and list to events
function buildPolyPoints(){
    var arr =[];
    $.each(opts.polyNodes, function(i, val){
     arr.push(new google.maps.LatLng(val[0], val[1]));
    });
    return arr;
}

 function plotEq(eq){
   var latLng = new google.maps.LatLng(eq.lat, eq.lng);
   var marker = new google.maps.Marker({     
     position: latLng,
     map: eqMap
   });
   if(opts.zoomToFit){
     overlays.bounds.extend(latLng);
     eqMap.fitBounds(overlays.bounds); 
   }
   createEqMarkerArrays(marker, eq);
  
   if(opts.eqMapType != "thumb"){
     var tr = $("<tr> <td>" +  parseFloat(eq.magnitude).toFixed(1) + 
             "</td><td data-utc='" + eq.event_time_utc + "' data-local='" + eq.event_time_local +"'>" + eq.event_time_local  + 
             "</td><td data-kilometers =" + parseFloat(eq.depth).toFixed(1) + " data-miles=" +km2Miles(eq.depth) + ">" + parseFloat(eq.depth).toFixed(1) + 
             "</td></tr>");
     var html = createHtml(eq);
     google.maps.event.addListener(marker, 'click', function(){
       openInfoWindow(marker, tr, html);
     });
   
     tr.click(function(){
       openInfoWindow(marker, tr, html);
     }).appendTo($("table.eq-list tbody "));
     $(".eq-list").trigger("update");
      }
    if(parseInt(opts.ajaxQueryParams.evid, 0) == parseInt(eq.evid, 0)){
      tr.trigger("click");
    }
 }
 
 
 function closeInfoWindow() {
   clearListHighlight();
   eqMap.infoWindow.close();
 }
 
 function openInfoWindow(marker, tr, html){
   clearListHighlight();
   //alert(marker.getIcon());
   google.maps.event.addListener(eqMap.infoWindow, 'closeclick', function(){
     tr.removeClass("highlight-list");
   });
   eqMap.infoWindow.setContent(html);
   //FIXME: There should be a way to get the markerImage position.
   eqMap.infoWindow.setOptions({pixelOffset: new google.maps.Size(0, 12)});
   eqMap.infoWindow.open(eqMap, marker);
   tr.addClass("highlight-list");
   return false;
 }
   function clearListHighlight(){
     $('table.eq-list tr.highlight-list').removeClass('highlight-list');
   }
   
 
 //a place for every marker and every marker in its place
 function createEqMarkerArrays(marker, eq){
   var timeIcon  = createIcon('time', eq);
   defaultIcon = timeIcon;
   var depthIcon;
   if(opts.eqMapType != "historic"){
     depthIcon = createIcon('depth', eq);
   }
   if(opts.eqMapType == "noteable"){
     defaultIcon = depthIcon;
   }
   markerObj = {
     marker:       marker,
     mag:          parseFloat(eq.magnitude).toFixed(1),
     depthKm:      eq.depth,
     depthMi:     km2Miles(eq.depth),
     time:         eq.datetime,
     timeIcon:     timeIcon,
     depthIcon:    depthIcon
   };
   marker.setIcon(defaultIcon);
   overlays.eq.push(markerObj);
 }
 
 
// // icons are all part of one image(sprite)
// //use arrays to determine sprite image offsets and size
  function createIcon(type, eq){
    var d = new Date;
    var epochRenderStamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())/1000;
    var xSpriteOffset = opts.xSpriteOffset;
    var ySpriteOffset = opts.ySpriteOffset;
    var spriteMask    = opts.spriteMask;
    var yIndex; 
    //xIndex = magnitude
    var xIndex = Math.floor(eq.magnitude);
    
    //find coordinates along the sprite y-axis
    if (type == "time"){
      if(opts.eqMapType == "historic"){
        if(overlays.plotHistoric){
          yIndex = 3;
        }else{
          yIndex = 5;
        }
        
      }else{
        if (eq.event_time_epoch > epochRenderStamp - 7201){
          yIndex = 5;
        }else if(eq.event_time_epoch > epochRenderStamp - 172801){
          yIndex = 4;
        }else{
          yIndex = 3;
        }
      }
    }else{ //plot by depth
      yIndex = Math.floor(eq.depth/10);

    }
    //if not in network add 6 to the yIndex
    if($.inArray(eq.auth.toLowerCase(), opts.authNetworks) < 0 && opts.eqMapType != "historic"){
      yIndex +=6;
    }
    
    //plot star when event is queried historical event
    if(opts.eqMapType == "historic" && opts.ajaxQueryParams.evid == eq.evid){
      yIndex = 12;
      xIndex += xIndex; //make star a bit bigger
      overlays.plotHistoric = true;
    }
    xIndex = Math.min(xIndex, 6);
    xIndex = Math.max(xIndex, 0);
    
    ////////////////////temp overides for testing
    // yIndex = 12;
    
    ///////////////////////end
    
    var size = spriteMask[xIndex];
    var originX= xSpriteOffset[xIndex];
    var originY= ySpriteOffset[yIndex];
    
   return  new google.maps.MarkerImage(opts.spritePath,
     new google.maps.Size(size, size),
     new google.maps.Point(originX, originY),
     new google.maps.Point(size/2,size/2)
     );
 } 
  

    function createHtml(eq){
      var miles = km2Miles(eq.depth);
      return opts.bubbleHtml(eq, miles);
    }


    function km2Miles(km){
      return (parseFloat(km) * 0.62).toFixed(1);
    }
    
    function slideControl(event, ui){
      $( ".slider-mag-value" ).html( ui.value );
      $.each(overlays.eq, function(i,val){                
        if(parseFloat(val.mag) < ui.value){
          val.marker.setMap(null);
        }else { 
          val.marker.setMap(eqMap);
        }

      });
      setEqList(ui.value);
   }
   
   //show or hide list rows based on slider value
   function setEqList(val){
     $('.eq-list tr  td:nth-child(1)').each(function(){
       if (parseFloat($(this).text()) < val){
         $(this).parent().hide();
       }else{
         $(this).parent().show();
       }
     });
     
   }
   
   function toggleIcon(){
    closeInfoWindow();
    $this = $(this);
    $.each(overlays.eq, function(i, val){
      if($this.val() == 'Time'){
         val.marker.setIcon(val.timeIcon);
         $('#req-legend-key').removeClass("depth");
      }else{
         val.marker.setIcon(val.depthIcon);
         $('#req-legend-key').addClass("depth");
         
      }
      if(val.marker.getMap()){
        val.marker.setMap(eqMap);
      }
    });
   }



// 
// ///////////////////////////////////////////////////////////////// cross section stuff


//  //overlay to translate coordinates to pixels
 function init_helper_container(){ 
   overlays.container = new google.maps.OverlayView(); 
   overlays.container.setMap(eqMap); 
   overlays.container.draw = function () { 
       if (!this.ready) { 
           this.ready = true; 
           google.maps.event.trigger(this, 'ready'); 
       } 
   }; 
 }


   function plotCrossSection(){
     var aPix = overlays.xSect[0].pixelPoint;
     var bPix = overlays.xSect[1].pixelPoint;
     var a = new google.maps.LatLng(overlays.xSect[0].marker.getPosition().lat(), overlays.xSect[0].marker.getPosition().lng());
     var b = new google.maps.LatLng(overlays.xSect[1].marker.getPosition().lat(), overlays.xSect[1].marker.getPosition().lng());
     var elevator = new google.maps.ElevationService();
     var path = [a,b];
     var xSectLength = a.distanceFrom(b); //meters
     var xSectLengthPixels =  Math.sqrt(Math.pow(aPix.x - bPix.x ,2) + Math.pow(aPix.y - bPix.y ,2)); //distance formula 
     var metersPerPixel = xSectLength/xSectLengthPixels;
     var pathRequest = {
       'path': path,
       'samples': 100
     };
     var verticalExag = 1.10;
     var chartWidth = 980;
     var elevationArray = [];
     var elevMaxArray =[];
     var elevationMinArray = [];
     var plotEqs = [];
     
     var sampleDistance = xSectLength/(pathRequest.samples-1); //(meters) end points inclusive
     //find eqs in poly
     
     if(overlays.xPoly){
       $.each(overlays.eq, function(i, markerObj){
         if (polyContainsPoint(overlays.xPoly, markerObj.marker.getPosition())){
           plotEqs.push([(projectEq(markerObj.marker))*metersPerPixel, -1*markerObj.depthKm*1000]);
           elevationMinArray.push(parseInt(-1*markerObj.depthKm*1000, 0));
         }
       });
     }

     elevator.getElevationAlongPath(pathRequest, function(results, status){
       if (status == google.maps.ElevationStatus.OK) {
         $.each(results, function(i, elevation){
           elevationArray.push([i*sampleDistance, elevation.elevation*verticalExag]);
           elevMaxArray.push(elevation.elevation*verticalExag);
         });
         // dataArray.push(elevationArray);
         var elevationMin =Math.min.apply(null, elevationMinArray);
         elevationMin = elevationMin > -18000 ? -20000 : elevationMin - 2000; //two km's of padding  on bottom
         var elevationMax = Math.max.apply(null, elevMaxArray);
         
         $('#cross-section-plot, #cross-section').width(chartWidth + 'px');
         $('a#cross-section-link').trigger("click");
         $.plot($("#cross-section-plot"),[
           {
               data: elevationArray               
            },
             
           {
              data: plotEqs,
              points: {show: true}            
          }
         
         ],
         
          {
           yaxis:{
             min: elevationMin,
             max: elevationMax
           },
           xaxis:{
             position: "bottom"
           },
           legend:{
             position: "nw"
           }
           
           
         });

       }
   });
   return false;
   }

 
   function drawXSection(e){
     if(!$('#define-cross-section').attr('checked') || overlays.xSect.length >= 4){
       return;
     }else{
       createPolyMarker(e.latLng);
     }
   }
   
   //polyopts.markers are layed out in the following manner
   // a-b, once b is determined, c is th corner perpendicular to b, d is the drag icon, and e is the corner perpendicular to a
   function createPolyMarker(latlng){
     var marker = new google.maps.Marker({
        position: latlng,
        map: eqMap,
        draggable: false,
       raiseOnDrag: false
     });

     markerObj ={
       marker:       marker,
       pixelPoint:   overlays.container.getProjection().fromLatLngToContainerPixel(latlng),
       distFromXsect: null 
     };
     overlays.xSect.push(markerObj);
     switch(overlays.xSect.length){
       case 1:
         marker.setIcon(opts.xSectionIconA);
         break;
       case 2:
         marker.setIcon(opts.xSectionIconB);
         createPolyMarker(overlays.xSect[1].marker.getPosition());
         createPolyMarker(overlays.container.getProjection().fromContainerPixelToLatLng(
           new google.maps.Point(
               parseInt((overlays.xSect[0].pixelPoint.x + overlays.xSect[1].pixelPoint.x)/2, 0), 
               parseInt((overlays.xSect[0].pixelPoint.y + overlays.xSect[1].pixelPoint.y)/2, 0))
               )
           );
         createPolyMarker(overlays.xSect[0].marker.getPosition());  
         break;
       case 4:
         marker.draggable = true;
         marker.setIcon(opts.xSectionIconDrag);
         google.maps.event.addListener(marker, 'drag', function(e){
           createRectangle(e.latLng);
         });
         break;
       default:
         marker.setIcon(opts.xSectionIconTrans);
     }
     marker.setMap(eqMap);
     
      //switch order so smaller x value is on the left

     if(overlays.xSect.length > 1){
       createPolygon();
     }
   }
   
   function createPolygon(){
     clearPolygon();
     var paths = [];
      $.each(overlays.xSect, function (i, val){
       paths.push(val.marker.getPosition());
     });
     overlays.xPoly = new google.maps.Polygon({
       map: eqMap,
       paths: paths
     });
     //plotCrossSection();
   }
   
   function clearCrossSection(){
     $.each(overlays.xSect, function(i, val){
       val.marker.setMap(null);
     });
     clearPolygon();
     overlays.xSect = [];
   }
   
   function clearPolygon(){
     if(overlays.xPoly){ overlays.xPoly.setMap(null);}
   }
   
   
   
   
   //takes endpoints of cross section plus the eq(latlng) and returns pixel offset from endPt1
   function projectEq(eqMarker){
     var pointA =overlays.xSect[0].pixelPoint;
     var pointB =overlays.xSect[1].pixelPoint;      
     var eq = overlays.container.getProjection().fromLatLngToContainerPixel(eqMarker.getPosition());
     var m = (pointB.y-pointA.y)/(pointB.x-pointA.x);      //slope of the line
     var b = pointA.y-(m*pointA.x);                //y intercept
     var c = eq.x;
     var d = eq.y;
     //find intersection of line through point and original line
     var y = ((m*m)*d + m*c + b)/((m*m)+1);
     var x = (m*d + c - m*b)/((m*m)+1);
     return Math.sqrt(Math.pow(pointA.x - x ,2) + Math.pow(pointA.y - y,2)); //distance formula
   }
   
   //create rectangle from two end points and third width point
   function createRectangle(widthLatlng){
     //reset incase zoom has changed
     $.each(overlays.xSect, function(i, val){
       val.pixelPoint = overlays.container.getProjection().fromLatLngToContainerPixel(val.marker.getPosition());
     });
     var pointA =overlays.xSect[0].pixelPoint;
     var pointB =overlays.xSect[1].pixelPoint;
     var widthPoint = overlays.container.getProjection().fromLatLngToContainerPixel(widthLatlng);
     //solve distance from line using
     //d = |Am +Bn +C| /(A*A + B*B)^1/2 where (m,n) are x,y of mouse drag event
     var m = (pointB.y-pointA.y)/(pointB.x-pointA.x);      //slope of the line
     var b = pointA.y-(m*pointA.x);                //y intercept
     var B = -1/m;  //convert to line of Ax + By + C = 0
     var C = b/m;
     //pixelWidth is the pixel distance from mouse event to the cross-section line 
     var pixelWidth = parseInt(((widthPoint.x + B*widthPoint.y + C))/(Math.sqrt(1 + B*B)), 0);
     //Switch A and B if needed, so profile agrees with plot. Trust it...it works
     if(pointA.x >  pointB.x && m/pixelWidth > 0  || pointA.x <  pointB.x && m/pixelWidth < 0){
       var temp_marker = overlays.xSect[0];
       var temp_icon = temp_marker.marker.getIcon();
       overlays.xSect[0].marker.setMap(null);
       overlays.xSect[1].marker.setMap(null);
       overlays.xSect[0].marker.setIcon(overlays.xSect[1].marker.getIcon());
       overlays.xSect[1].marker.setIcon(temp_icon);
       overlays.xSect[0] = overlays.xSect[1];
       overlays.xSect[1] = temp_marker;
       overlays.xSect[0].marker.setMap(eqMap);
       overlays.xSect[1].marker.setMap(eqMap);
       createRectangle(widthLatlng);
     }else{
       var phirad = Math.atan(((pointB.y-pointA.y)/(pointB.x-pointA.x)));   //output in radians
       var phideg = Math.abs(180/(Math.PI)*phirad);
       var dely = Math.abs(Math.abs(pixelWidth)* Math.sin((Math.PI/180)*(90-phideg)));
       var delx = Math.abs(Math.abs(pixelWidth)* Math.cos((Math.PI/180)*(90-phideg)));
       //alert("dely = " + dely +", delx = " + delx);
       //which way to we go George?
       var sign = pixelWidth/Math.abs(pixelWidth);
     
       if(m ==(1/0)){ //infinity or 90
         dely = 0;
         delx = delx*sign;
       }else if(m < 0){
         delx = delx*sign;
         dely = dely*sign;
       }else if(m > 0){
         if(sign > 0){
           dely = -1*dely;
         }else{
           delx = delx*sign;
         }
       }else{ //m == 0
         delx = 0;
         dely = -1*widthPoint*sign;
       }
     
       //now move points c,d and e
       var pointC = new google.maps.Point(pointB.x + delx, pointB.y + dely);
       var pointE = new google.maps.Point(pointA.x + delx, pointA.y + dely);
       var pointD = new google.maps.Point(
         parseInt((pointC.x + pointE.x)/2, 0), 
         parseInt((pointC.y + pointE.y)/2, 0)
         );
       overlays.xSect[2].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointC));
       overlays.xSect[2].pixelPoint = pointC;
       overlays.xSect[4].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointE));
       overlays.xSect[4].pixelPoint = pointE;
       overlays.xSect[3].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointD));
       overlays.xSect[3].pixelPoint = pointD;
       createPolygon();
     }
   }
   
   //found at http://www.devcomments.com/Re-Polygon-contains-LatLng-at228409.htm
    function polyContainsPoint(obj,latLng) {
      var j=0;
      var oddNodes = false;
      var x = latLng.lng();
      var y = latLng.lat();
       for (var i=0; i < obj.getPath().getLength(); i++) {
        j++;
        if (j == obj.getPath().getLength()) {j = 0;}
        if (((obj.getPath().getAt(i).lat() < y) && (obj.getPath().getAt(j).lat() >= y)) || 
         ((obj.getPath().getAt(j).lat() < y) && (obj.getPath().getAt(i).lat() >= y))) {
          if ( obj.getPath().getAt(i).lng() + (y -obj.getPath().getAt(i).lat()) /
           (obj.getPath().getAt(j).lat()-obj.getPath().getAt(i).lat())* 
           (obj.getPath().getAt(j).lng() - obj.getPath().getAt(i).lng())<x ) {
            oddNodes = !oddNodes;
          }
        }
      }
      return oddNodes;
    };
   
   
   };
   //define some defaults.
   $.fn.eqMap.standardDefaults = {
     //standard map
    jsonFromFile: false,
    ajaxUrlArray: ['events.json'],
      ajaxQueryParams: {
      map_type: "recent",
      evid: null
    },
    lat: 45.07,
    lng: -120.95,
   	zoom: 6,
   	mobileLng: -118.95,
   	mobileLat: 42,
   	mobileZoom: 5,
   	displayEqUiControls: true,
   	navigationControl: true,
   	draggable: true,
		disableDefaultUI: false,
		disableDoubleClickZoom: false,
		scrollWheel: true,
		zoomToFit: false,
		minMag: 0,
   	authNetworks: ['uw'],
   	authPoly: null,
   	xSpriteOffset: [0,10,26,44,67,95,130],
   	ySpriteOffset: [2,47,89,132,176,220,260,304,347,388,430,472,511],
   	spriteMask:    [10,15,19,23,28,37,42],
   	spritePath: "images/req-icons.png",
   	xSectionIconA: "images/blue_MarkerA.png",
   	xSectionIconB: "images/blue_MarkerB.png",
   	xSectionIconDrag: "images/polyEditSquare.png",
   	xSectionIconTrans: "images/transparent.png",
   	polyNodes:  [[43.0, -125.0], 
                  [42.0,  -125.0], 
                  [42.0,  -120.0], 
                  [42.0, -117.0], 
                  [49.0, -117.0],
                  [48.95, -123.3],
                  [48.3, -123.4],
                  [48.5, -125.0],
                  [44.5, -124.6],
                  [43.0, -125.0]
                  ],
                  
   bubbleHtml: function(eq, miles){
     if(eq.auth == "nc"){
       a = "<a href=http://earthquake.usgs.gov/earthquakes/recenteqsus/Quakes/nc" + eq.evid + ".php> View Event Page </a>";
     }else{
       a = "<a href='/event/" +  eq.evid + "#overview'> View Event Page </a>";
     }
      return a +
             "<table>" +
              "<tr> <td class ='label'> Magnitude: </td><td class = 'content'>" +  parseFloat(eq.magnitude).toFixed(1) +"</td> " + "</tr>" +
              "<tr> <td class ='label'> Time(UTC): </td><td class = 'content'>" + eq.event_time_utc +"</td> " + "</tr>" +
              "<tr> <td class ='label'> Time(Local): </td><td class = 'content'>" + eq.event_time_local +"</td> " + "</tr>" +
              "<tr> <td class ='label'> Depth: </td><td class = 'content'>" + parseFloat(eq.depth).toFixed(1) +"Km ("+ miles + "miles)</td> " + "</tr>" +
              "<tr> <td class ='label'> Event Id: </td><td class = 'content'>" + eq.evid +"</td> " + "</tr>" +
               "<tr> <td class ='label'> Network: </td><td class = 'content'>" + eq.auth +"</td> " + "</tr>" +
              "</table>";
     
   }
   };

   //clickable thumbnail all gmap events disabled
   $.fn.eqMap.thumbDefaults = {
   	zoom: 5,
   	displayEqUiControls: false,
    navigationControl: false,
   	draggable: false,
		disableDefaultUI: true,
		disableDoubleClickZoom: true,
		scrollwheel: false,
		ajaxUrlArray: ['/events', '/non_net_events'],
		ajaxQueryParams: {
		  map_type: "thumb"
		}
   };
   
   $.fn.eqMap.noteableDefaults ={
     ajaxUrlArray: ['/events'],
     ajaxQueryParams: {
 		  map_type: "noteable"
 		},
     minMag: 3
   };
   //plot eq with it's old friends
   $.fn.eqMap.historicDefaults = {
     ajaxUrlArray: ['/events'],
     zoomToFit: true,
     minMag: 2
   };
   
   //and the volcanoes
   $.fn.eqMap.volcanoDefaults = {
     ajaxUrlArray: ['/events'],
     minMag: 2,
     zoom: 12,
     ajaxQueryParams: {
 		 map_type: "volcano"
 		}
     
   };

   
})(jQuery);