/* a jquery plugin for creating eq and station maps
  * for seismo networks
  *@author: Jon Connolly joncon@uw.edu
  instantiate with $(elem).eqMap({mapType: someMapType})
  where somemapType is the type of map. This will build map with defaults, all of which can be overriden
  map types are:
  'recent' last two weeks of seismic events
  'notable' large historical events
  'historical' historical events in a given lat/lng box
  'thumb' small map with no controls
  'mobile' map with no controls that fills viewport
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
          eq: {
            markers: [],
            cluster:{
              mc: [],
              removed: null,
              markers: []
            }
          },
          sta: {
            markers: [],
            cluster:{
              mc: [],
              removed: null,
              markers: []
            }
          },
          xSectMarkers: [],
          xSectPolyline: null

        };
        //start with standard default, overwrite with specific defaults and then
        //overwrite with options
        var opts = $.fn.eqMap.standardDefaults;
        opts = $.extend({}, opts, eval("$.fn.eqMap." + options.eqMapType + "Defaults")); //overwrite  as needed
        opts = $.extend({}, opts, options); //overwrite from plugin call
         var mapOptions = {
          zoom: opts.zoom,
          center: new google.maps.LatLng(opts.lat, opts.lng),
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          scaleControl: opts.scaleControl,
          draggable: opts.draggable,
    			disableDefaultUI: opts.disableDefaultUI,
    			disableDoubleClickZoom: opts.diableDoubleClickZoom,
    			scrollwheel: opts.scrollwheel,
          navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
           }
         };
        overlays.bounds = new google.maps.LatLngBounds();
        return this.each(function(){
          //ready handlers           
          
          
          
          $.each(['eq', 'sta'], function(i,key){
            $("#map-ui #cluster-display-" + key + " :checkbox").click(function(){
              if ($(this).attr('checked')){
                overlays[key].cluster.mc = new MarkerClusterer(eqMap, overlays[key].cluster.markers, {gridSize: 50, maxZoom: 7});
            
              }else{
                overlays[key].cluster.mc.clearMarkers();
                $.each(overlays[key].cluster.markers, function(i,marker){
                  marker.setMap(eqMap);
                });
              
              }
            });
          });
          
          $('.slider-control').addClass("mag-range-" + (opts.magMax - opts.magMin));
          $('#map-ui .slider-control .slider').slider({
            		  value: opts.magMin,
            			min: opts.magMin,
            			max: opts.magMax,
            			step: 1,
            			slide: slideControl
          });
          $('span.slider-mag-value').html(opts.magMin);
          $('#map-ui #icon-toggle :radio').change(toggleIcon);
          
          $("#map-ui button#reset").click(resetAll);
          
          $("#req-legend-key").addClass(opts.eqMapType);
          if(opts.points.eq && opts.points.sta){            
            $("#req-legend-key, #req-legend-key2").addClass("two-key");
          }
          //x-section handlers
          $('#define-plot-area').click(function(){
            if($('.define-plot-area').text() == "Draw"){ 
              $('.define-plot-area span').text('Clear');
              plotSteps(2);
            }else{
              $('.define-plot-area span').text('Draw');
               clearCrossSection();
               plotSteps(1);
            }
            });

          $('#plot').click(function(){
              $('.loading img').show();
              var plotType = $('input[name=select-plot]:checked').val();
              switch(plotType){
                case 'x-section':
                  plotCrossSection();
                  break;
                case 'depth-time':
                  plotTimeDepth();
                  break;
                case 'mag-time':
                  plotMagTime();
                  break;
                default:
                  plotCumulativeCount();
              }
              return false;
            });
            
            $("a.slide-toggle-plot-ui").click(function(){
          	  $(".slide[rev=" + $(this).attr("rel") + "]").slideToggle();
              $("#plot-ui").toggleClass("open");
              plotSteps(1);
              if($('#define-plot-area:hidden').length > 0){
                
              }
          	  return false;
          	});
          	
          	$("a.slide-toggle-filter-ui").click(function(){
          	  $(".slide[rev=" + $(this).attr("rel") + "]").slideToggle();
          	  return false;
          	});
          	
          	
          	$("#plot-ui-close").click(function(){
              resetPlotUi();
          	  return false;
          	  });
            
            $("#station-search-field").autocomplete({
                    source: function(req, add){
                      var re = new RegExp(req.term,'i');
                       arr=[];
                        $(".map-list tbody tr td:first-child").each(function(){
                          if($(this).text().match(re)){
                            arr.push($(this).text());
                          }
                        });
                        add(arr);
                      },
                      select: function(e, ui){
                        var tr =  $(".map-list tr:contains('" + ui.item.value + "')");
                        tr.trigger("click");
                        $(".dataTables_scrollBody").scrollTop(0);
                        $(".dataTables_scrollBody").scrollTop(tr.position().top -20);
                      }
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
          //add logo to map
          if(opts.logo){
          	var logoControlDiv = document.createElement('DIV');
            var logoControl = netLogoControl(logoControlDiv);
            logoControlDiv.index = 0; // used for ordering
            eqMap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(logoControlDiv);
          }

            //iterate through each collection
            var total_count =0;
            $.each(opts.points, function(key, collection){
              var count=0;
              var ajaxArray = [];
               $.each(collection.urls, function(i, url){ //parse each url
                 //is this a json obj or do we need to parse it? json  obj comes from file or backend template query
                 if(typeof opts.params[key] == 'object'){
                   var  qp = opts.params[key];
                 }else{
                   var qp = $.parseJSON(opts.params[key]);
                 }
                 //set evid param if needed
                 if(opts.evid){
                   qp.evid = opts.evid;
                 }
                 //set map_type
                 qp.map_type =  opts.eqMapType;                 
                 
                 $.getJSON(url, qp, function(json) { //requests each url
                   count +=1;
                    $.each(json, function(j, response){
                      $.each(response, function(key, obj){
                        ajaxArray.push(obj);
                      });
                    });
                     //set sort order once all urls have been queried
                     //if obj does not respond to #.event_time_utc it will be sorted to beginning of array(bottom of zIndex)
                     //sort, create summary and list table if this is last element in collection
                    if(count == collection.urls.length){
                      ajaxArray.sort(function(a,b){
                        return (a.event_time_epoch < b.event_time_epoch) ? 1 : (a.event_time_epoch > b.event_time_epoch) ? -1 : 0;
                      });
                      
                      //plot
                      total_count += ajaxArray.length +1;
                       var zIndex = total_count;
                       $.each(ajaxArray, function(k,obj){
                         zIndex -=1;
                         plotMarker(obj, zIndex, collection, key);
                       });
                      
                      //summary at top of map
                      if(overlays.eq.markers.length > 0 && key == 'eq'){ 
                        $(opts.summaryHtmlEq(overlays.eq.markers)).appendTo($('#map-summary'));
                      }
                      $("#map-summary ul li a").click(function(){
                        $(".map-list tr[rev='" + $(this).attr('rel') +  "']" ).trigger('click');
                        return false;
                      });
                      
                      //cluster
                      if(opts.points[key].cluster){
                        // overlays[key].cluster.mc = new MarkerClusterer(eqMap, overlays[key].cluster.markers, {gridSize: 50, maxZoom: 7});
                         overlays[key].cluster.mc = new MarkerClusterer(eqMap, overlays[key].cluster.markers, {gridSize: opts.points[key].cluster.gridSize, maxZoom: opts.points[key].cluster.gridSize});
                      }
                      
                      
                      //create list
                      //we don't want to render the list for large queries
                      if (collection.listHtml && ajaxArray.length < opts.list_limit){
                        $("." + key + "-list.data-table").dataTable({
                            "bPaginate": false,
                            "sScrollY": "400px",
                            "bFilter": false,
                            "bInfo": false,
                            "aaSorting": [[1,"desc"]]
                        });
                      }else{
                        $(".list-ui-"+ key).hide();
                        $(".list-limit-warning-" + key).show();
                      }                      
                    }
                                       
                   $(".loading img").hide();
                     
                 }); //json call
               }); //collections
                
             }); //end  $.each(opts.points, function(key, collection){
             
             //iterate through polygons and create display events
             if(opts.polygons){
               $.each(opts.polygons, function(key, val){
                 var p = new google.maps.KmlLayer(
                    opts.polygons[key].url,
                    {
                      map: opts.polygons[key].displayOnLoad ? eqMap : null, 
                      preserveViewport: true
                     }
                   );
                   overlays[key] = p;
                 
                 $("#map-ui #" + key + " :checkbox").click(function(){
                   if ($(this).attr('checked')){
                     overlays[key].setMap(eqMap);

                   }else{
                     overlays[key].setMap(null);
                   }
                 });
               });
             }
            
          init_helper_container();
          google.maps.event.addListener(eqMap, 'click', function(e){
            closeInfoWindow();
            drawXSection(e);
          });          
         
       });
        // end of return
      } else {
        $.error( 'Method ' +  options + ' does not exist on jQuery.eqMap' );
      }//end of is/else
        
//private methods

//Add network logo to map
function netLogoControl(div) {
    div.style.padding = '0 5px';
    var logo = document.createElement('IMG');
    logo.src = opts.logo.logoSrc;
    logo.style.cursor = 'pointer';
    logo.style.width = opts.logo.logoWidth;
    div.appendChild(logo);
    google.maps.event.addDomListener(logo, 'click', function() {
        window.location = opts.logo.logoHref; 
    });
}




function plotMarker(obj, zIndex, collection, key){
   var latLng = new google.maps.LatLng(obj.lat, obj.lng);
   var marker = new google.maps.Marker({     
     position: latLng,
     map: collection.displayOnLoad ? eqMap : null
   });
   if(opts.points[key].cluster){
     overlays[key].cluster.markers.push(marker);
   }
   
	
   if(opts.zoomToFit){
     overlays.bounds.extend(latLng);
     eqMap.fitBounds(overlays.bounds); 
   }
   
   
   createMarkerArrays(marker, obj, zIndex, collection, key);
   if((collection.bubbleHtml)){
     var html = collection.bubbleHtml(obj, marker);
   }
   if(collection.listHtml){
     var tr = $(collection.listHtml(obj));     
     var css_klass = "table." + key  + "-list tbody ";
     tr.click(function(){
       openInfoWindow(marker, key, tr, html, false);
       }).appendTo($(css_klass));
    }else{
      tr =null;
    }
     
    if(collection.bubbleHtml){
      if(opts.evid && opts.evid== obj.evid){
        openInfoWindow(marker,key, tr, html, true);
      }else{
        google.maps.event.addListener(marker, 'click', function(){
          openInfoWindow(marker, key, tr, html, true);
        });
      }
    }
 }


 //a place for every marker and every marker in its place
 function createMarkerArrays(marker, obj, zIndex, collection, key){
   if(obj.evid){ //is it an eq or station? 
     var depthIcon = createEqIcon('depth', obj, collection);
     if(!collection.displayDepthOnly){
       var timeIcon  = createEqIcon('time', obj, collection);
       var defaultIcon = timeIcon;
      }else{
        var defaultIcon = depthIcon;
      }
     // }
     markerObj = {
       marker:        marker,
       mag:           parseFloat(obj.magnitude).toFixed(1),
       depthKm:         obj.depth_km,
       depthMi:         obj.depth_mi,
       epoch:           obj.event_time_epoch,
       //event_time_utc:  obj.event_time_utc,
       timeIcon:        timeIcon,
       depthIcon:       depthIcon,
       evid:            obj.evid,
       region:          obj.region
     };
     marker.setIcon(defaultIcon);
     if(opts.evid && opts.evid == obj.evid){
       zIndex = 10000;
     }
   }else{ //station
     var staIcon = createStaIcon(obj, collection);
     markerObj = {
       marker:  marker,
       name:    obj.sta
     };
    marker.setIcon(staIcon);
    overlays.sta.markers.push(markerObj);
    
   }
   marker.setZIndex(zIndex);
   overlays[key].markers.push(markerObj);
   
 }
 
 
// // icons are all part of one image(sprite)
// //use arrays to determine sprite image offsets and size
  function createEqIcon(type, obj, collection){
    var xSpriteOffset = collection.icon.xSpriteOffset;
    var ySpriteOffset = collection.icon.ySpriteOffset;
    var spriteMask    = collection.icon.spriteMask;
    var d = new Date;
    var epochRenderStamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())/1000;    
    //xIndex = magnitude
    var xIndex = Math.max(Math.floor(obj.magnitude)-1, 0);
    var yIndex; 
  
    //depth
    // <1 red
    // 1-4 orange
    // 5-10 yellow
    //11 -20 blue
    // 21-35 dark blue
    // 36 -64 black
    // >65 white
    
    
    
    //find coordinates along the sprite y-axis
    if (type == "time"){
      //plot by before/after
      if(opts.evid && opts.plot_relative_to_evid){
        //assumes evid is numeric
        if(parseInt(opts.evid, 0) > parseInt(obj.evid, 0)){
          //before event
          yIndex = 2;
        }else{
          //after event
          yIndex = 0;
        }
      //plot temporal
      }else{
        if (obj.event_time_epoch > epochRenderStamp - collection.temporalSteps[0]){
          yIndex = 0;
        }else if(obj.event_time_epoch > epochRenderStamp - collection.temporalSteps[1]){
          yIndex = 1;
        }else{
          yIndex = 2;
        }        
      }
      if(obj.etype == 'px' || obj.etype == 'ex'){
        //add two to increase size
        yIndex < 7 ? yIndex +=15 : 8;
        xIndex = xIndex+=2;
      }
    
    }else{ //plot by depth
      if(obj.etype == 'px' || obj.etype == 'ex'){
        yIndex = 15;
        xIndex +=2; //add two to index
      }else{
        if(obj.depth_km < 1){
          yIndex = 0;
        }else if(obj.depth_km < 5){
          yIndex =1;
        }else if(obj.depth_km < 11){
          yIndex = 2;
        }else if(obj.depth_km < 21){
          yIndex = 3;
        }else if(obj.depth_km < 36){
          yIndex = 4;
        }else if(obj.depth_km < 65){
          yIndex = 5;
        }else{
          yIndex = 6;
        }
      }
      // yIndex = Math.min(parseInt(obj.depth_km/10, 0), 5);

    }
    //if not in network or not the queried event of a historical map, add 6 to the yIndex
    if(($.inArray(obj.auth.toLowerCase(), opts.authNetworks) < 0 || obj.etype == "re") && !opts.evid){
      yIndex +=7;
    //add another 7 if its an explosion
    }

    
  
    //plot star when event is queried historical event
    if(opts.evid && opts.evid == obj.evid){
      yIndex = 14;
      xIndex += 1; //make star a bit bigger
    }

    // if (yIndex == 2){yIndex = 6;}
    xIndex = Math.min(xIndex, 6);
    xIndex = Math.max(xIndex, 0);
    yIndex = Math.min(yIndex,17 );
    yIndex = Math.max(yIndex, 0);
    // if(obj.evid == 60403136){
    // }
    // 
    
    ////////////////////temp overides for testing
    // yIndex = 12;
    
    ///////////////////////end
    
    var size = spriteMask[xIndex];
    var originX= xSpriteOffset[xIndex];
    var originY= ySpriteOffset[yIndex];
   return  new google.maps.MarkerImage(collection.icon.spritePath,
     new google.maps.Size(size, size),
     new google.maps.Point(originX, originY),
     new google.maps.Point(size/2,size/2)
     );
 } 
 
 
 
 //create the station icon
  function createStaIcon(obj, collection){
    var xSpriteOffset = collection.icon.xSpriteOffset;
    var ySpriteOffset = collection.icon.ySpriteOffset;
    var spriteMask    = collection.icon.spriteMask;
    // var d = new Date;
    // var epochRenderStamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())/1000;    
    // //xIndex = magnitude
    // var xIndex = Math.floor(obj.magnitude);
    // var yIndex; 
    //find y cords
    yIndex=0;
    if ($.inArray(obj.auth.toLowerCase(), opts.authNetworks) < 0){
      yIndex = 1;
    }
    //find x cords based on station type
    switch(obj.sta_code){
      case '3bb':
        xIndex=0;
        break;
      case '3bb3sm':
        xIndex=2;
        break;
      case '3sm':
        xIndex=5;
        break;
      case '3sm1sp':
        xIndex=4;
        break;
      case '3sp':
        xIndex=3;
        break;
      default:
        xIndex=1;
    }
    
    //find coordinates along the sprite y-axis
    // xIndex = 5;
    // yIndex = 1;
    var size = spriteMask[0];
    var originX= xSpriteOffset[xIndex];
    var originY= ySpriteOffset[yIndex];
   return  new google.maps.MarkerImage(collection.icon.spritePath,
     new google.maps.Size(size, size),
     new google.maps.Point(originX, originY),
     new google.maps.Point(size/2,size/2)
     );
 }



 //plot regions by zoom level
 function plotIconZoom(e){
   var zoom = eqMap.getZoom();
   $.each(overlays.eq.markers, function(i,val){
     if(val.marker.region){
        // alert(val.marker.region);
        if(zoom >= opts.regions_zoom){
          val.marker.setMap(eqMap);
        }else { 
          val.marker.setMap(null);
        }
     }
   });
   
 }
 function closeInfoWindow() {
   clearListHighlight();
   add2cluster();
   eqMap.infoWindow.close();
 }
 
 function openInfoWindow(marker, key, tr, html, scrollList){
   clearListHighlight();
   removeFromCluster(marker, key);
   google.maps.event.addListener(eqMap.infoWindow, 'closeclick', function(){
     if(tr){
       tr.removeClass("highlight-list");
      }
     add2cluster();
   });
   eqMap.infoWindow.setContent(html);
   //FIXME: There should be a way to get the markerImage position.
   eqMap.infoWindow.setOptions({pixelOffset: new google.maps.Size(0, 6)});
   eqMap.infoWindow.open(eqMap, marker);
   if(tr){
     tr.addClass("highlight-list");
   }
   if(tr && scrollList){
     $(".dataTables_scrollBody").scrollTop(0);
     $(".dataTables_scrollBody").scrollTop(tr.position().top -20);
     // $(".dataTables_scrollBody").animate({scrollTop: tr.position().top - 20}, "fast");
   }
   return false;
 }
   function clearListHighlight(){
     $('tr.highlight-list').removeClass('highlight-list');
   }
   //remove an icon from a cluster
   function removeFromCluster(marker, key){
     if(overlays[key].cluster){
       if(overlays[key].cluster.removed){
        overlays[key].cluster.removed.setMap(null);       
        overlays[key].cluster.removed = null;
       }
       if(!marker.getMap()){
         overlays[key].cluster.mc.removeMarker(marker);
         overlays[key].cluster.removed = marker;
          // marker.setZIndex(100000000); this ain't workn
         marker.setMap(eqMap);
       }
      }
     
   }
   
   //re-cluster an icon
   function add2cluster(){
     $.each(['eq', 'sta'], function(i,key){
     if(overlays[key].cluster.removed){
         overlays[key].cluster.removed.setMap(null);
         overlays[key].cluster.mc.addMarker(overlays[key].cluster.removed, true);
         overlays[key].cluster.removed  = null;
       }
      });
     
   }
    
    
    function km2Miles(km){
      return (parseFloat(km) * 0.62).toFixed(1);
    }
    
    function slideControl(event, ui){
      $( ".slider-mag-value" ).html( ui.value );
      $.each(overlays.eq.markers, function(i,val){                
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
   
   function resetAll(){
     $('#map-ui .slider-control .slider').slider("value", opts.magMin);
     $.each(overlays.eq.markers, function(i,val){                
         val.marker.setMap(eqMap);
     $('span.slider-mag-value').html(opts.magMin);
     setEqList(opts.magMin);
     });
     $('#from, #to').val("");
     resetPlotUi();
     resetOverlays();
   }
   function resetOverlays(){
     if($('#map-ui #icon-toggle :radio:checked').val()=="Depth"){
       $.each(overlays.eq.markers, function(i, val){
           val.marker.setIcon(val.timeIcon);
           $('#req-legend-key').removeClass("depth");
         });
       $('#map-ui #icon-toggle :radio[value=Time]').attr("checked", true);
     }
     $('#map-ui .checkbox :checkbox').attr("checked", false);
     $.each(opts.polygons, function(key,obj){
       $("#map-ui #" + key + " :checkbox").attr("checked", obj.displayOnLoad);
       overlays[key].setMap(obj.displayOnLoad ? eqMap : null); 
     });
   }
   
   function resetPlotUi(){
     $("#plot-ui").removeClass("open");
     clearCrossSection();
     if($("#slide-plot-ui.slide:visible").length > 0){
       $("#slide-plot-ui.slide").slideUp();
     }
     $('.define-plot-area').removeClass('ui-state-active');
     $('.define-plot-area span').text('Draw');
     $('#define-plot-area').attr('checked', false);
     $('.plot-type label').removeClass('ui-state-active');
     $('.plot-type input[value=x-section]').attr("checked", true);
     $('.plot-type label[for=select-x-section-plot]').addClass("ui-state-active");
     $("#plot").hide();
   }
   
   function toggleIcon(){
    closeInfoWindow();
    $this = $(this);
    $.each(overlays.eq.markers, function(i, val){
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
   
 function plotSteps(step){
   if(step ==1 || $("#plot-instructions ul li.steps.step" + step + ":hidden").length >0 ){
     $("#plot-instructions ul li.steps").hide();//.fadeOut(1000);
     $("#plot-instructions ul li.steps.step" + step).fadeIn(500);
   }
 }



 function plotTimeDepth(){
  var plotEqs0 = [];
  var plotEqs1 = [];
  var plotEqs2 = [];
  var plotEqs3 = [];
  var plotEqs4 = [];
  var plotEqs5 = [];
  elevationMin = 0;
  if(overlays.xPoly){
    plotEqs =[];
     $.each(overlays.eq.markers, function(i, markerObj){
       var mag = parseInt(markerObj.mag, 0);
       if (polyContainsPoint(overlays.xPoly, markerObj.marker.getPosition()) && mag >= parseInt($( ".slider-mag-value" ).html(), 0)){
         elevationMin = Math.min(elevationMin, -1*markerObj.depthKm);
         mag = Math.max(0, mag);
         mag = Math.min(5, mag);
         eval("plotEqs" + mag).push([markerObj.epoch*1000, -1*markerObj.depthKm]);
       }
     });
   }
   // maxDepth = maxDepth || elevationMin;
   // var  maxDepth =  elevationMin;
   $('#depth-time.dialog-plot').dialog("open");
   $('#depth-time.dialog-plot').dialog( "option", "title", 'Depth-Time');
   
   $.plot($("#plot-depth-time"),[   
   
   {
       data: plotEqs5,
       // color: eqColor
       label: ">5",
       points: {
         radius: 12,
         symbol: 'circle',
         show: true
       }
   },
    
    {
        data: plotEqs4,
         // color: eqColor,
         label: "4",
        points: {
          radius: 10,
          symbol: 'circle',
          show: true
        }
    },
    
    
    {
        data: plotEqs3,
        // color: eqColor,
        label: "3",
        points: {
          radius: 12,
          symbol: 'circle',
          show: true
        }
    },
    
    
    {
        data: plotEqs2,
         // color: eqColor,
         label: "2",
        points: {
          radius: 6,
          symbol: 'circle',
          show: true
        }
    },
    
    
    {
        data: plotEqs1,
        // color: eqColor,
        label: "1",
        points: {
          radius: 4,
          symbol: 'circle',
          show: true
        }
    },
    
    
    {
       data: plotEqs0,
       // color: eqColor,
       label: "< 1",
       points: {
         radius: 2,
         symbol: 'circle',
         show: true
       }
   } 
   
   ],
   
    {
     yaxis:{
       min: elevationMin,
       max: 0
     },
     xaxis:{
       mode: "time",
       position: "bottom",
       timeformat: "%y/%m/%d"
     },
     legend:{
       show:true,
       noColumns: 7,
       container: ".plot-legend"
     }
   });
    
 }


 function plotMagTime(){
   var plotEqs = [];
   if(overlays.xPoly){
     //find min mag for bottom of bar(stick)
     var minMag = 0;
    $.each(overlays.eq.markers, function(i, markerObj){
       minMag=Math.min(minMag, markerObj.mag);
     });
     minMag +=.05;
      $.each(overlays.eq.markers, function(i, markerObj){
        var mag = markerObj.mag ;
        if (polyContainsPoint(overlays.xPoly, markerObj.marker.getPosition()) && 
        mag >= parseInt($( ".slider-mag-value" ).html(), 0)){
        // mag >= parseInt($( ".slider-mag-value" ).html(), 0) && (!maxDepth || markerObj.depthKm >= maxDepth*-1)){
          plotEqs.push([markerObj.epoch*1000, mag, minMag]);
        }
      });
    }
    // $('a#mag-time-link').trigger("click");
    $('#mag-time.dialog-plot').dialog("open");
    $('#mag-time.dialog-plot').dialog( "option", "title", 'Magnitude-Time');
    $.plot($("#plot-mag-time"),[
     
      {
         data: plotEqs,
         points: {
           radius: 4,
           symbol: 'circle',
           show: true
         },
         bars: {
           barWidth:1,
           show: true
         }
         
     } 
     

     // {
     //    data: line,
     //    lines:{
     //      show: true,
     //      steps: true
     //    }
        
    //}


    ],

     {
      yaxis:{
        tickDecimals: 0,
        min: minMag
      },
      xaxis:{
        mode: "time",
        position: "bottom",
        timeformat: "%y/%m/%d"
      }//,
      // legend:{
      //   show:true,
      //   noColumns: 7,
      //   container: ".plot-legend"
      // }
    });
   
 }

 function plotCumulativeCount(){
   var line =[];
   var plotEqs0 = [];
   var plotEqs1 = [];
   var plotEqs2 = [];
   var plotEqs3 = [];
   var plotEqs4 = [];
   var plotEqs5 = [];
   if(overlays.xPoly){
     var count = 0;
     var newEqArray = $.merge([], overlays.eq.markers); //clone array so we can sort it without altering original array
      newEqArray.sort(function(a,b){
        return a.epoch - b.epoch;
      });
      $.each(newEqArray, function(i, markerObj){
        var mag = parseInt(markerObj.mag, 0);
        if (polyContainsPoint(overlays.xPoly, markerObj.marker.getPosition()) && 
          mag >= parseInt($( ".slider-mag-value" ).html(), 0)){
        // mag >= parseInt($( ".slider-mag-value" ).html(), 0) && (!maxDepth || markerObj.depthKm >= maxDepth*-1)){
          count +=1;
          line.push([markerObj.epoch*1000, count]);
          mag = Math.max(0, mag);
          mag = Math.min(5, mag);
          eval("plotEqs" + mag).push([markerObj.epoch*1000, count]);
        }
      });
    }
    
    // $('a#cumulative-count-link').trigger("click");
    $('#cumulative-count.dialog-plot').dialog("open");
    $('#cumulative-count.dialog-plot').dialog( "option", "title", 'Cumulative Count');
    $.plot($("#plot-cumulative-count"),[
     {
         data: plotEqs5,
         label: ">5",
         points: {
           radius: 12,
           symbol: 'circle',
           show: true
         }
     },
     
     {
         data: plotEqs4,
          label: "4",
         points: {
           radius: 10,
           symbol: 'circle',
           show: true
         }
     },     
     {
         data: plotEqs3,
         label: "3",
         points: {
           radius: 12,
           symbol: 'circle',
           show: true
         }
     },
     {
         data: plotEqs2,
          label: "2",
         points: {
           radius: 6,
           symbol: 'circle',
           show: true
         }
     },
     {
         data: plotEqs1,
         label: "1",
         points: {
           radius: 4,
           symbol: 'circle',
           show: true
         }
     },
      {
         data: plotEqs0,
         label: "< 1",
         points: {
           radius: 2,
           symbol: 'circle',
           show: true
         }
     },
     
     {
        data: line,
        lines:{
          show: true,
          steps: true
        }
        
    }


    ],

     {
      yaxis:{
        tickDecimals: 0
      },
      xaxis:{
        mode: "time",
        position: "bottom",
        timeformat: "%y/%m/%d",
        ticks: 10
      },
      legend:{
        show:true,
        noColumns: 7,
        container: ".plot-legend"
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

  //this is the call
   function plotCrossSection(){
     var aPix = overlays.xSectMarkers[0].pixelPoint;
     var bPix = overlays.xSectMarkers[3].pixelPoint;
     var a = new google.maps.LatLng(overlays.xSectMarkers[0].marker.getPosition().lat(), overlays.xSectMarkers[0].marker.getPosition().lng());
     var b = new google.maps.LatLng(overlays.xSectMarkers[3].marker.getPosition().lat(), overlays.xSectMarkers[3].marker.getPosition().lng());
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
     // if(maxDepth && maxDepth >= -10){
     //    verticalExag = 1; 
     //  }
     var elevationArray = [];
     var elevMaxArray =[];
     var elevationMinArray = [];
     var plotEqs0 = [];
     var plotEqs1 = [];
     var plotEqs2 = [];
     var plotEqs3 = [];
     var plotEqs4 = [];
     var plotEqs5 = [];
     
     //find eqs in poly
     
     if(overlays.xPoly){
       $.each(overlays.eq.markers, function(i, markerObj){
         var mag = parseInt(markerObj.mag, 0);
         if (polyContainsPoint(overlays.xPoly, markerObj.marker.getPosition()) && mag >= parseInt($( ".slider-mag-value" ).html(), 0) ){ 
           mag = Math.max(0, mag);
           mag = Math.min(5, mag);
           eval("plotEqs" + mag).push([(projectEq(markerObj.marker))*metersPerPixel, -1*markerObj.depthKm]);
           elevationMinArray.push(-1*markerObj.depthKm);
         }
       });
    }
     var sampleDistance = (xSectLength/pathRequest.samples-1); //(meters) end points inclusive
     elevator.getElevationAlongPath(pathRequest, function(results, status){
       if (status == google.maps.ElevationStatus.OK) {
         $.each(results, function(i, elevation){
           elevationArray.push([i*sampleDistance, elevation.elevation*verticalExag/1000]);
           elevMaxArray.push(elevation.elevation*verticalExag/1000);
         });
         var elevationMin =Math.min.apply(-1, elevationMinArray);
         // elevationMin = elevationMin > -18 ? -20 : elevationMin - 2; //two km's of padding  on bottom
         var elevationMax = Math.max.apply(null, elevMaxArray);
         var eqColor = 3;
         $('#cross-section.dialog-plot').dialog("open");
         $('#cross-section.dialog-plot').dialog( "option", "title", 'Cross Section');
         $.plot($("#plot-cross-section"),[
           {
               data: elevationArray               
            },
             
          
          {
              data: plotEqs5,
              label: ">5",
              points: {
                radius: 12,
                symbol: 'circle',
                show: true
              }
          },
          
          
          {
              data: plotEqs4,
               label: "4",
              points: {
                radius: 10,
                symbol: 'circle',
                show: true
              }
          },           
           
          {
              data: plotEqs3,
              label: "3",
              points: {
                radius: 8,
                symbol: 'circle',
                show: true
              }
          },   
           
           {
               data: plotEqs2,
                label: "2",
               points: {
                 radius: 6,
                 symbol: 'circle',
                 show: true
               }
           },
           
           {
                data: plotEqs1,
                label: "1",
                points: {
                  radius: 4,
                  symbol: 'circle',
                  show: true
                }
            },
           
           
           {
              data: plotEqs0,
              label: "< 1",
              points: {
                radius: 2,
                symbol: 'circle',
                show: true
              }
          }
         
         ],
         
          {
           yaxis:{
             min: elevationMin,
             // min: (parseInt(maxDepth,0)  || elevationMin),
             max: elevationMax
           },
           xaxis:{
             position: "bottom",
             ticks: 0
           },
           legend:{
             show:true,
             noColumns: 7,
             container: ".plot-legend"
           }
           
           
         });

       }
   });
   return false;
   }

 
   function drawXSection(e){
     if(!$('#define-plot-area').attr('checked') || overlays.xSectMarkers.length > 3){
       return;
     }else{
       createPolyMarker(e.latLng);
     }
   }
   
   //overlays.xSectMarkers are layed out in the following manner
   //  6----------5-----------4
   //  |                      |
   //  0                      3
   //  |                      |
   //  1----------------------2
   // where 0 and are the cross-section line
   // and 5 is the drag handle
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
     overlays.xSectMarkers.push(markerObj);
     
     switch(overlays.xSectMarkers.length){
       //set A marker
       case 1:
         marker.setIcon(
           new google.maps.MarkerImage(
             opts.xSectionIconA,
             null,
             null, 
             new google.maps.Point(15,10)
             )
           ); //w
         createPolyMarker(latlng); //sw
         plotSteps(3);
         break;
        // set b marker
      
       
       case 3:
        marker.setIcon(opts.xSectionIconTrans); //se
        createPolyMarker(latlng); 
        break;
       case 4:
         marker.setIcon(
           new google.maps.MarkerImage(
             opts.xSectionIconB,
             null,
              null, 
              new google.maps.Point(-5,12)
             )
           ); //e
         //create a line between a & b 
         // var path = 
          var paths = [];
          $.each(overlays.xSectMarkers, function (i, val){
           paths.push(val.marker.getPosition());
         });
         overlays.xSectPolyLine = new google.maps.Polyline({
           map: eqMap,
           path: [overlays.xSectMarkers[0].marker.getPosition(),latlng], 
           strokeWeight: 1,
           stokeOpacity: 1.0,
           strokeColor:"#FF0000"
           
         });
        //  overlays.xSectPolyLine.setMap(eqMap);
        
         createPolyMarker(latlng); //ne
         
         //n  drag handle
         createPolyMarker(overlays.container.getProjection().fromContainerPixelToLatLng( 
           new google.maps.Point(
               parseInt((overlays.xSectMarkers[0].pixelPoint.x + overlays.xSectMarkers[3].pixelPoint.x)/2, 0), 
               parseInt((overlays.xSectMarkers[0].pixelPoint.y + overlays.xSectMarkers[3].pixelPoint.y)/2, 0))
               )
           );
         createPolyMarker(overlays.xSectMarkers[0].marker.getPosition()); //nw
         $("#plot").fadeIn(500);
         plotSteps(4);
         break;
       case 6:
         marker.draggable = true;
         // marker.setIcon(opts.xSectionIconDrag);
         marker.setIcon(
           new google.maps.MarkerImage(
              opts.xSectionIconDrag,
              null,
              null, 
              new google.maps.Point(0,6)
              )
           );
         google.maps.event.addListener(marker, 'drag', function(e){
           createRectangle(e.latLng);
         });
         break;
       default: // icon is tansperant 
         marker.setIcon(opts.xSectionIconTrans);
     }
     marker.setMap(eqMap);
     

     if(overlays.xSectMarkers.length > 1){
       // createPolygon();
     }
   }
   
   function createPolygon(){
     clearPolygon();
     var paths = [];
      $.each(overlays.xSectMarkers, function (i, val){
       paths.push(val.marker.getPosition());
     });
     overlays.xPoly = new google.maps.Polygon({
       map: eqMap,
       paths: paths
     });
   }
   
   function clearCrossSection(){
     $('.dialog-plot').dialog("close");
     $.each(overlays.xSectMarkers, function(i, val){
       val.marker.setMap(null);
     });
     clearPolygon();
     if(overlays.xSectPolyLine){
       overlays.xSectPolyLine.setMap(null);
     }
     overlays.xSectPolyLine = null;
     overlays.xSectMarkers = [];
   }
   
   function clearPolygon(){
     if(overlays.xPoly){ overlays.xPoly.setMap(null);}
   }
   
   
   //takes endpoints of cross section plus the eq(latlng) and returns pixel offset from endPt1
   function projectEq(eqMarker){
     var pointA =overlays.xSectMarkers[0].pixelPoint;
     var pointB =overlays.xSectMarkers[3].pixelPoint;      
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
     $.each(overlays.xSectMarkers, function(i, val){
       val.pixelPoint = overlays.container.getProjection().fromLatLngToContainerPixel(val.marker.getPosition());
     });
     var pointA =overlays.xSectMarkers[0].pixelPoint;
     var pointB =overlays.xSectMarkers[3].pixelPoint;
     var widthPoint = overlays.container.getProjection().fromLatLngToContainerPixel(widthLatlng);
     //solve distance from line using
     //d = |Am +Bn +C| /(A*A + B*B)^1/2 where (m,n) are x,y of mouse drag event
     var m = (pointB.y-pointA.y)/(pointB.x-pointA.x);      //slope of the line
     var b = pointA.y-(m*pointA.x);                //y intercept
     var B = -1/m;  //convert to line of Ax + By + C = 0
     var C = b/m;
     //pixelWidth is the pixel distance from mouse event to the cross-section line 
     var pixelWidth = parseInt(((widthPoint.x + B*widthPoint.y + C))/(Math.sqrt(1 + B*B)), 0);
     var phirad = Math.atan(((pointB.y-pointA.y)/(pointB.x-pointA.x)));   //output in radians
     var phideg = Math.abs(180/(Math.PI)*phirad);
     var dely = Math.abs(Math.abs(pixelWidth)* Math.sin((Math.PI/180)*(90-phideg)));
     var delx = Math.abs(Math.abs(pixelWidth)* Math.cos((Math.PI/180)*(90-phideg)));
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
      var pointSw = new google.maps.Point(pointA.x - delx, pointA.y - dely);
      var pointSe = new google.maps.Point(pointB.x - delx, pointB.y - dely);
      var pointNe = new google.maps.Point(pointB.x + delx, pointB.y + dely);
      var pointNw = new google.maps.Point(pointA.x + delx, pointA.y + dely);
      var pointN = new google.maps.Point(
        parseInt((pointNw.x + pointNe.x)/2, 0), 
        parseInt((pointNw.y + pointNe.y)/2, 0)
        );
      overlays.xSectMarkers[1].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointSw));
      overlays.xSectMarkers[1].pixelPoint = pointSw;
      overlays.xSectMarkers[2].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointSe));
      overlays.xSectMarkers[2].pixelPoint = pointSe;
      overlays.xSectMarkers[4].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointNe));
      overlays.xSectMarkers[4].pixelPoint = pointNe;
      overlays.xSectMarkers[6].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointNw));
      overlays.xSectMarkers[6].pixelPoint = pointNw;
      overlays.xSectMarkers[5].marker.setPosition(overlays.container.getProjection().fromContainerPixelToLatLng(pointN));
      overlays.xSectMarkers[5].pixelPoint = pointN; 
      createPolygon();
      plotSteps(5);
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
   
})(jQuery);