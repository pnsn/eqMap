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
	toggleIcons: function () {
		return null;
	},
	//example of a public method that calls a private
	closeInfoWindow: function () {
		closeInfoWindow.call(this);
	}

};

(function ($) {
	//the effin plugin
	$.fn.eqMap = function (options) {
		if (methods[options]) { // calling a public method?
			return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof options === 'object' || !options) {
			var overlays = {
				eq: {
					markers: []
				},
				sta: {
					markers: []
				},
				xSectMarkers: [],
				xSectPolyline: null,
				bounds: []

			};
			//start with standard default, overwrite with specific defaults and then
			//overwrite with options
			var opts = $.fn.eqMap.standardDefaults;
			opts = $.extend({}, opts, eval("$.fn.eqMap." + options.eqMapType + "Defaults")); //overwrite  as needed
			opts = $.extend({}, opts, options); //overwrite from plugin call

			var mapOptions = {
				zoom: opts.zoom,
				center: [opts.lat, opts.lng],
				attributionControl: opts.attributionControl,
				zoomControl: opts.zoomControl,
				closePopupOnClick: opts.closePopupOnClick,
				dragging: opts.dragging,
				scrollWheelZoom: opts.scrollWheelZoom,
				zoomToFit: opts.zoomToFit
			};


			return this.each(function () {
				//ready handlers           


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
				if (opts.points.eq && opts.points.sta) {
					$("#req-legend-key, #req-legend-key2").addClass("two-key");
				}
				//x-section handlers
				$('#define-plot-area').click(function () {
					if ($('.define-plot-area').text() == "Draw") {
            $('#define-plot-area').addClass("draw-active");
						$('.define-plot-area').text('Clear');
						plotSteps(2);
					} else {
						$('.define-plot-area').text('Draw');
            $('#define-plot-area').removeClass("draw-active");
						clearCrossSection();
						plotSteps(1);
					}
				});

				$('#plot').click(function () {
					$('.loading').show();
					var plotType = $('.active>input[name=select-plot]').val();
					switch (plotType) {
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

				$("a.plot-ui-toggle").click(function () {
					plotSteps(1);
				});

				$("#plot-ui-close").click(function () {
					resetPlotUi();
					return false;
				});

				$("#station-search-field").autocomplete({
					source: function (req, add) {
						var re = new RegExp(req.term, 'i');
						arr = [];
						$(".map-list tbody tr td:first-child").each(function () {
							if ($(this).text().match(re)) {
								arr.push($(this).text());
							}
						});
						add(arr);
					},
					select: function (e, ui) {
						var tr = $(".map-list tr").filter(function () {
							return ui.item.value == $('td:first-child', this).text();
						});
						tr.trigger("click");

						//TODO: temporary fix --> need to make top scroll to include height of control panel
						$(".dataTables_scrollBody").scrollTop(0);

						$(".dataTables_scrollBody").scrollTop(tr.position().top);
					}
				});

				// extend Latlng for distanceFrom method returns distance in meters
				L.LatLng.prototype.distanceFrom = function (newLatLng) {

					var R = 6371000; // meters
					var lat1 = this.lat;
					var lon1 = this.lng;
					var lat2 = newLatLng.lat;
					var lon2 = newLatLng.lng;
					var dLat = (lat2 - lat1) * Math.PI / 180;
					var dLon = (lon2 - lon1) * Math.PI / 180;
					var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
						Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
						Math.sin(dLon / 2) * Math.sin(dLon / 2);
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
					return R * c;
				};

				//lets make us a map
				eqMap = new L.Map(this, mapOptions);
				L.control.scale().addTo(eqMap);

				var topoBaseMap = L.esri.basemapLayer("Topographic");

				topoBaseMap.addTo(eqMap);

				if (opts.layerControl) {

					var baseLayers = {
						"Topographic": topoBaseMap,
						"Gray": L.esri.basemapLayer("Gray"),
						"Streets": L.esri.basemapLayer("Streets"),
						"Imagery": L.esri.basemapLayer("Imagery")
					}
					layerControl = L.control.layers(baseLayers, null, {
						position: 'topleft'
					});
					layerControl.addTo(eqMap);
				}

				if (opts.zoomToFit) {
					// eqMap.initialZoom = true;
				}

				//add logo to map
				if (opts.logo) {
					L.Control.Watermark = L.Control.extend({
						onAdd: function (map) {
							var img = L.DomUtil.create('img');
							img.src = opts.logo.logoSrc;
							img.id = "map-logo";
							return img;
						},

						onRemove: function (map) {
							// Nothing to do here
						}
					});
					$("#map-logo").on('click', function () {
						window.location = opts.logo.logoHref;
					})
					L.control.watermark = function (opts) {
						return new L.Control.Watermark(opts);
					}

					L.control.watermark({
						position: 'bottomright'
					}).addTo(eqMap);
				}

				//iterate through each collection
				var total_count = 0;
				$.each(opts.points, function (key, collection) {
					var count = 0;
					var ajaxArray = [];
					$.each(collection.urls, function (i, url) { //parse each url
						//is this a json obj or do we need to parse it? json  obj comes from file or backend template query
						if (typeof opts.params[key] == 'object') {
							var qp = opts.params[key];
						} else {
							var qp = $.parseJSON(opts.params[key]);
						}
						//set evid param if needed
						if (opts.evid) {
							qp.evid = opts.evid;
						}
						//set map_type
						qp.map_type = opts.eqMapType;

						$.getJSON(url, qp, function (json) { //requests each url
							count += 1;
							$.each(json, function (j, response) {
								if (response.hasOwnProperty('event')) {
									response = response['event'];
								} else if (response.hasOwnProperty('non_net_event')) {
									response = response['non_net_event'];
								}
								ajaxArray.push(response);
							});
							//set sort order once all urls have been queried
							//if obj does not respond to #.event_time_utc it will be sorted to beginning of array(bottom of zIndex)
							//sort, create summary and list table if this is last element in collection
							if (count == collection.urls.length) {
								ajaxArray.sort(function (a, b) {
									return (a.event_time_epoch < b.event_time_epoch) ? 1 : (a.event_time_epoch > b.event_time_epoch) ? -1 : 0;
								});

								//plot
								total_count += ajaxArray.length + 1;
								var zIndex = total_count;
								$.each(ajaxArray, function (k, obj) {
									zIndex -= 1;
									plotMarker(obj, zIndex, collection, key);
								});


								//summary at top of map
								if (overlays.eq.markers.length > 0 && key == 'eq') {
									$(opts.summaryHtmlEq(overlays.eq.markers)).appendTo($('#map-summary'));
								}
								$("#map-summary ul li a").click(function () {
									$(".map-list tr[rev='" + $(this).attr('rel') + "']").trigger('click');
									return false;
								});


								$("span.numEvents").html($(".eq-list tbody tr").length);

								//create list
								//we don't want to render the list for large queries
								if (collection.listHtml && ajaxArray.length < opts.list_limit) {
									$("." + key + "-list.data-table").DataTable({
										"bPaginate": false,
										"sScrollY": "400px",
										"bFilter": false,
										"bInfo": false,
										"bAutoWidth": false,
										"autoWidth": false,
										"aaSorting": [
											[1, "desc"]
										]
									});

								} else {
									$(".list-ui-" + key).hide();
									$(".list-limit-warning-" + key).show();
								}

								if (opts.zoomToFit) {
									eqMap.fitBounds(overlays.bounds);
								}

							}


							$(".loading").hide();

						}); //json call
					}); //collections

				}); //end  $.each(opts.points, function(key, collection){

				//look for polygon map objects
				if (opts.polyObjects) {
					$.each(opts.polyObjects, function (key, val) {
						if (key == "circle") {
							var circle = L.circle([opts.lat, opts.lng], {
								radius: parseInt(opts.radius, 0),
								color: val.objOptions.strokeColor,
								opacity: val.objOptions.strokeOpacity,
								weight: val.objOptions.strokeWeight,
								fillOpacity: val.objOptions.fillOpacity
							});
							//check to see if center is set by options

							if (opts.polyObjects[key].displayOnLoad) {
								circle.addTo(eqMap);
							}

						}
					});
				}

				//iterate through polygons and create display events
				if (opts.polygons) {

					$.each(opts.polygons, function (key, val) {
						$.ajax({
							dataType: "json",
							url: val.url,
              success: function (response) {
  						  var features = [];

  							$.each(response.features, function (i, feature) {
  								features.push(new L.geoJSON(feature, {
  									style: function () {
  										return {
  											color: feature.properties["stroke"],
  											weight: feature.properties["stroke-width"],
  											opacity: feature.properties["stroke-opacity"],
  											fill: feature.properties["fill"],
  											"fill-opacity": feature.properties["fill-opacity"]
  										};
  									},
  									onEachFeature: function (f, layer) {
  										layer.bindPopup("<h4>" + feature.properties["name"] + "</h4><div>" + feature.properties["description"] + "<div>");
  									}
  									//properties[name]
  									//properties[description]
  								}));

  							});

  							overlays[key] = L.layerGroup(features);

  							if (opts.polygons[key].displayOnLoad) {
  								overlays[key].addTo(eqMap);
  							}

  							$("#map-ui #" + key + " :checkbox").click(function () {
  								var checkbox = $(this);

  								if (checkbox.is(':checked') && eqMap.getZoom() < 12) {
  									eqMap.addLayer(overlays[key]);
  								} else {
  									eqMap.removeLayer(overlays[key]);
  								}

  							});
              },
              fail: function (response) {
  							console.log("failed: ", response);
  						}

						// overlays[key] = p;

					  });
				  });
        }
        
				init_helper_container();

				eqMap.on('click', function (e) {
					closeInfoWindow();
					drawXSection(e);
				});
      });
			// end of return
		} else {
			$.error('Method ' + options + ' does not exist on jQuery.eqMap');
		} //end of is/else

		//private methods


		// Builds the legend for the maps. Could use some fixin'
		function buildLegend(type) {
			var legend = $("#legend-body");
			var topRow = $("#top-row").length > 0 ? $("#top-row") : $("<div id='top-row'></div>");
			var bottomRow = $("#bottom-row").length > 0 ? $("#bottom-row") : $("<div id='bottom-row'></div>");
			legend.append(topRow);
			legend.append(bottomRow);
			if (legend.find("." + type).length == 0) {

				if (type == "station" || type == "nn-station") {
					var stationTypes = $("<div id='stations'> </div>");
					stationTypes.append("<h4>Stations</h4>");

					$.each(["1sp", "3bb3sm", "3bb", "3sp", "3sm", "3sm1sp"], function (key, value) {
						var parentDiv = $("<div class=''></div>");
						var icon = $("<div class='station mag-2 sta-" + value + "' </div>");
						icon.append(opts.icons.station);
						parentDiv.append(icon);
						parentDiv.append("<span class='legend-event'> " + value + "<span>");
						stationTypes.append(parentDiv);
					});

					var parentDiv = $("<div class=''></div>");
					var icon = $("<div class='nn-station mag-2' </div>");
					icon.append(opts.icons.nnStation);
					parentDiv.append(icon);
					parentDiv.append("<span class='legend-event'>Non Network<span>");


					stationTypes.append(parentDiv);

					topRow.append(stationTypes);
				} else { //its an eq
					if (type == "event" || type == "nn-event" || type == "explosion") {
						var eqSizes = $("<div id='eq-sizes'</div>");
						eqSizes.append("<h4>Magnitude</h4>");
						for (var i = 0; i < 10; i++) {
							var icon = $("<div class='event mag-" + i + " " + (i > 7 ? "large-mag" : "") + "' </div>");
							icon.append(opts.icons.event);
							icon.append("<span class='legend-event'>" + i + "<span>");
							eqSizes.append(icon);
						}

						var nnEvents = $("<div id='nn-events'></div>");
						var parentDiv = $("<div class=''></div>");
						var nnIcon = $("<div class='nn-event mag-4' </div>");
						nnIcon.append(opts.icons.nnEvent);
						parentDiv.append(nnIcon)
						parentDiv.append("<span class='legend-event'> Non-network event <span>");
						nnEvents.append(parentDiv);

						var explosions = $("<div id='explosions'></div>");
						var parentDiv = $("<div class=''></div>");
						var explosionIcon = $("<div class='explosion mag-4' </div>");
						explosionIcon.append(opts.icons.explosion);
						parentDiv.append(explosionIcon);
						parentDiv.append("<span class='legend-event'> Explosion <span>");
						explosions.append(parentDiv);


						topRow.append(eqSizes);
						bottomRow.append(nnEvents);
						bottomRow.append(explosions);
					} else {
						console.log(type)
					}

					//DEPTH ICONS
					//TODO: >65 km depth issue
					var eqDepths = $("<div id='depths'> </div>");
					eqDepths.append("<h4>Depth (km)</h4>");
					var depths = ["1", "5", "11", "21", "36", "65", ">65"];
					$.each(depths, function (key, value) {
						var parentDiv = $("<div class=''></div>");
						var icon = $("<div class='event mag-2 show-depth depth-" + value + "' </div>");
						icon.append(opts.icons.event);
						parentDiv.append(icon);
						parentDiv.append("<span class='legend-event'> " + value + "<span>");
						eqDepths.append(parentDiv);
					});

					topRow.append(eqDepths);

					if (!opts.show_depth_only) {
						var eqAges = $("<div id='eq-ages'</div>");
						if (type == "queried") {
							var eqAges = $("#eq-ages");
							eqAges.html("<h4>Age</h4>");
							//before/after/queried
							$.each(["After", "Queried", "Before"], function (i, event) {
								var parentDiv = $("<div class='queried'></div>");
								var icon = $("<div class='event mag-4 age-step-" + i + "' </div>");
								if (event == "Queried") {
									icon.append(opts.icons.queried);
								} else {
									icon.append(opts.icons.event);
								}
								parentDiv.append(icon);
								parentDiv.append("<span class='legend-event'> " + event + "<span>");
								eqAges.append(parentDiv);
							});


						} else if (eqAges.children(".queried").length == 0) {
							//TODO: age steps vary
							eqAges.append("<h4>Age</h4>");
							//AGE ICONS
							$.each(["hours", "days", "weeks"], function (i, age) {
								var parentDiv = $("<div class='not-queried'></div>");
								var icon = $("<div class='event mag-4 age-step-" + i + "' </div>");
								icon.append(opts.icons.event);
								parentDiv.append(icon);
								parentDiv.append("<span class='legend-event'> Last 2 " + age + "<span>");
								eqAges.append(parentDiv);
							});

						}
						topRow.append(eqAges);
						$("#legend-body #depths").hide();
						if (eqAges.children(".queried")) {
							$("#eq-ages not-queried").hide();
						}
					}
				}
			} else {
				return false;
			}

		}

		function plotMarker(obj, zIndex, collection, key) {
			var latLng = [obj.lat, obj.lng];

			var markerObj = createMarkerArrays(obj, zIndex, collection, key);
			var marker = markerObj.marker;
			if (collection.displayOnLoad) {
				marker.addTo(eqMap);
			}

			if (opts.zoomToFit) {
				overlays.bounds.push(latLng);
			}

			if ((collection.bubbleHtml)) {
				var html = collection.bubbleHtml(obj, marker);
			}
			if (collection.listHtml) {
				var tr = $(collection.listHtml(obj));
				var css_klass = "table." + key + "-list tbody ";
				tr.click(function () {
					openInfoWindow(marker, key, tr, html, false);
				}).appendTo($(css_klass));
			} else {
				tr = null;
			}

			if (collection.bubbleHtml) {
				if (opts.evid && opts.evid == obj.evid) {
					openInfoWindow(marker, key, tr, html, true);
				} else {
					marker.on('click', function () {
						openInfoWindow(marker, key, tr, html, true);
					});
				}
			}

			// if(!legendMarkers[marker._icon.html]) {
			//   legendMarkers[marker._icon.html] = true;
			// }

		}

		//a place for every marker and every marker in its place
		function createMarkerArrays(obj, zIndex, collection, key) {

			var markerObj;

			if (obj.evid) {

				//show markers

				markerObj = createEventMarker(obj, collection, zIndex);

			} else { //station

				//show stations
				markerObj = createStationMarker(obj, collection, zIndex);

				overlays.sta.markers.push(markerObj);
			}

			overlays[key].markers.push(markerObj);
			return markerObj;
		}

		function createStationMarker(obj, collection, zIndex) {
			var marker, markerObj;
			var iconClass = "station",
				iconColor = "sta-" + obj.sta_code,
				iconShape = opts.icons.station;

			var authNet = obj.auth ? obj.auth : obj.net;
			var lng = obj.lng ? obj.lng : obj.lon;

			if ($.inArray(authNet.toLowerCase(), opts.authNetworks) < 0) {
				iconClass = "nn-station";
				iconShape = opts.icons.nnStation;
			}


			marker = L.marker([obj.lat, lng], {
				icon: L.divIcon({
					className: iconClass + " " + iconColor,
					iconSize: null,
					html: iconShape,
					zIndexOffset: zIndex
				})
			});

			if (collection.bubbleHtml) {
				marker.bindPopup(collection.bubbleHtml(obj));
			}

			buildLegend(iconClass)

			return markerObj = {
				name: obj.sta,
				marker: marker
			};
		}

		function createEventMarker(obj, collection, zIndex) {
			var markerObj, marker;
			var iconClass = "event",
				iconShape = opts.icons.event,
				iconSize = "mag-" + (obj.magnitude > 0 ? Math.floor(obj.magnitude) : 0)
			iconAge = "age-step-",
				iconDepth = "depth-";
			var d = new Date;
			var epochRenderStamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) / 1000;
			if (opts.evid && opts.plot_relative_to_evid) {
				//assumes evid is numeric
				if (parseInt(opts.evid, 0) > parseInt(obj.evid, 0)) {
					//before event
					iconAge += 2;
				} else if (parseInt(opts.evid, 0) < parseInt(obj.evid, 0)) {
					//after event
					iconAge += 0;
				} else {
					iconAge += 1;
				}
				//plot temporal
			} else {
				if (collection.temporalSteps) {
					if (obj.event_time_epoch > epochRenderStamp - collection.temporalSteps[0]) {
						iconAge += 0;
					} else if (obj.event_time_epoch > epochRenderStamp - collection.temporalSteps[1]) {
						iconAge += 1;
					} else {
						iconAge += 2;
					}
				}
			}

			if ($.inArray(obj.auth.toLowerCase(), opts.authNetworks) < 0) {
				iconClass = "nn-event"
				iconShape = opts.icons.nnEvent;
			}

			//TODO: pass break points in from config
			if (obj.etype == "ex" || obj.etype == "px") {
				iconClass = "explosion";
				iconShape = opts.icons.explosion;
			}

			//queried event
			if (opts.eqMapType && opts.evid && opts.evid == obj.evid) {

				iconClass = "queried";
				iconShape = opts.icons.queried;
			}

			if (obj.depth_km < 1) {
				iconDepth += "1"
			} else if (obj.depth_km < 5) {
				iconDepth += "5"
			} else if (obj.depth_km < 11) {
				iconDepth += "11"
			} else if (obj.depth_km < 21) {
				iconDepth += "21"
			} else if (obj.depth_km < 36) {
				iconDepth += "36"
			} else if (obj.depth_km < 65) {
				iconDepth += "65"
			} else {
				iconDepth += "66"
			}


			buildLegend(iconClass);

			if (opts.show_depths_only) {
				iconClass += " show-depth"
			}

			marker = L.marker([obj.lat, obj.lng], {
				icon: L.divIcon({
					className: iconClass + " " + iconSize + " " + iconAge + " " + iconDepth,
					iconSize: null,
					html: iconShape
				}),
				title: "M " + obj.magnitude
			});


			if (opts.evid && opts.evid == obj.evid) {
				marker.zIndexOffset = 10000;
			} else {
				marker.zIndexOffset = zIndex;
			}

			if (collection.bubbleHtml) {
				marker.bindPopup(collection.bubbleHtml(obj));
			}

			markerObj = {
				mag: parseFloat(obj.magnitude).toFixed(1),
				depthKm: obj.depth_km,
				depthMi: obj.depth_mi,
				epoch: obj.event_time_epoch,
				//event_time_utc:  obj.event_time_utc,
				evid: obj.evid,
				region: obj.region,
				marker: marker
			};


			return markerObj;
		}


		//plot regions by zoom level
		function plotIconZoom(e) {
			var zoom = eqMap.getZoom();
			$.each(overlays.eq.markers, function (i, val) {
				if (val.marker.region) {
					if (zoom >= opts.regions_zoom) {
						val.marker.setMap(eqMap);
					} else {
						val.marker.setMap(null);
					}
				}
			});

		}

		function closeInfoWindow() {
			clearListHighlight();
			// eqMap.infoWindow.close();
		}

		function openInfoWindow(marker, key, tr, html, scrollList) {
			clearListHighlight();

			marker.on('popupclose', function (e) {
				if (tr) {
					tr.removeClass("highlight-list");
				}
			});
			marker.openPopup();


			//FIXME: There should be a way to get the markerImage position.
			// eqMap.infoWindow.setOptions({
			//   pixelOffset: new google.maps.Size(0, 6)
			// });

			if (tr) {
				tr.addClass("highlight-list");
			}
			if (tr && scrollList) {
				$(".dataTables_scrollBody").scrollTop(0);

				$(".dataTables_scrollBody").scrollTop(tr.position().top);
				// $(".dataTables_scrollBody").animate({scrollTop: tr.position().top - 20}, "fast");
			}
			return false;
		}

		function clearListHighlight() {
			$('tr.highlight-list').removeClass('highlight-list');
		}

		function km2Miles(km) {
			return (parseFloat(km) * 0.62).toFixed(1);
		}

		function slideControl(event, ui) {
			$(".slider-mag-value").html(ui.value);
			$.each(overlays.eq.markers, function (i, val) {
				if (parseFloat(val.mag) < ui.value) {
					val.marker.remove();
				} else {
					val.marker.addTo(eqMap);
				}

			});
			setEqList(ui.value);
		}

		//show or hide list rows based on slider value
		function setEqList(val) {
			$('.eq-list tr  td:nth-child(1)').each(function () {
				if (parseFloat($(this).text()) < val) {
					$(this).parent().hide();
				} else {
					$(this).parent().show();
				}
			});
		}


		//TODO: deal with depth
		function resetAll() {
			$('#map-ui .slider-control .slider').slider("value", opts.magMin);
			$.each(overlays.eq.markers, function (i, val) {
				val.marker.addTo(eqMap);
				$('span.slider-mag-value').html(opts.magMin);
				setEqList(opts.magMin);
			});
			$('#from, #to').val("");
			resetPlotUi();
			resetOverlays();
		}

		function resetOverlays() {
			if ($('#map-ui #icon-toggle :radio:checked').val() == "Depth") {
				$.each(overlays.eq.markers, function (i, val) {
					val.marker.setIcon(val.timeIcon);
					$('#req-legend-key').removeClass("depth");
				});
				$('#map-ui #icon-toggle :radio[value=Time]').prop("checked", "checked");
			}
			$('#map-ui .checkbox :checkbox').prop("checked", false);
			if (!$('#map-ui #display-legend').prop("checked")) {
				$('#map-ui #display-legend').prop("checked", "checked");
				$("#map-legend").show();
			}
			$.each(opts.polygons, function (key, obj) {
				$("#map-ui #" + key + " :checkbox").prop("checked", obj.displayOnLoad);
				overlays[key].setMap(obj.displayOnLoad ? eqMap : null);
			});
		}

		function resetPlotUi() {
			$("#plot-ui").removeClass("open");
			clearCrossSection();
			if ($("#slide-plot-ui.slide:visible").length > 0) {
				$("#slide-plot-ui.slide").slideUp();
			}
			$("#plot-chevron-down").show();
			$("#plot-chevron-up").hide();
			$('.define-plot-area').removeClass('ui-state-active');
			$('.define-plot-area span').text('Draw');
			$('#define-plot-area').prop('checked', false);
			$('.plot-type label').removeClass('ui-state-active');
			$('.plot-type input[value=x-section]').prop("checked", true);
			$('.plot-type label[for=select-x-section-plot]').addClass("ui-state-active");
			$("#plot").hide();
		}

		function toggleIcon() {
			closeInfoWindow();
			$this = $(this);


			if ($this.val() == 'Time') {
				$("#legend-body #depths").hide();
				$("#legend-body #eq-ages").show();
			} else {
				$("#legend-body #depths").show();
				$("#legend-body #eq-ages").hide();
			}
			$.each(overlays.eq.markers, function (i, val) {
				if ($this.val() == 'Time') {

					$(val.marker._icon).removeClass("show-depth");
					$('#req-legend-key').removeClass("depth");
				} else {

					$(val.marker._icon).addClass("show-depth");
					$('#req-legend-key').addClass("depth");
					//TODO: change legend to depth
				}
				if (val.marker._map) {
					val.marker.addTo(eqMap);
				}
			});
		}

		function plotSteps(step) {
			if (step == 1 || $("#plot-instructions ul li.steps.step" + step + ":hidden").length > 0) {
				$("#plot-instructions ul li.steps").hide(); //.fadeOut(1000);
				$("#plot-instructions ul li.steps.step" + step).fadeIn(500);
			}
		}


		function plotTimeDepth() {
			var plotEqs0 = [];
			var plotEqs1 = [];
			var plotEqs2 = [];
			var plotEqs3 = [];
			var plotEqs4 = [];
			var plotEqs5 = [];
			var elevationMin = 0;
			var elevationMax = 0;
			if (overlays.xPoly) {
				plotEqs = [];
				$.each(overlays.eq.markers, function (i, markerObj) {
					var mag = parseInt(markerObj.mag, 0);
					if (polyContainsPoint(overlays.xPoly, markerObj.marker.getLatLng()) && mag >= parseInt($(".slider-mag-value").html(), 0)) {
						elevationMin = Math.min(elevationMin, markerObj.depthKm);
						elevationMax = Math.max(elevationMax, markerObj.depthKm);

						mag = Math.max(0, mag);
						mag = Math.min(5, mag);
						eval("plotEqs" + mag).push([markerObj.epoch * 1000, markerObj.depthKm]);
					}
				});
			}
			// maxDepth = maxDepth || elevationMin;
			// var  maxDepth =  elevationMin;
			//
			// $('#depth-time.modal').modal({backdrop: false}).modal("show");
			// $("#depth-time .modal-dialog").draggable({ containment: "#page", scroll: false });
			initializeViewer("depth-time");
			$.plot($("#depth-time .select-plot"), [

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
							radius: 8,
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
					yaxis: {
						min: elevationMin,
						max: elevationMax,
						transform: function (v) {
							return -v;
						},
						inverseTransform: function (v) {
							return -v;
						}
					},
					xaxis: {
						mode: "time",
						position: "bottom",
						timeformat: "%y/%m/%d"
					},
					legend: {
						show: true,
						noColumns: 7,
						container: ".plot-legend"
					}
				});

		}


		function plotMagTime() {
			var plotEqs = [];
			if (overlays.xPoly) {
				//find min mag for bottom of bar(stick)
				var minMag = 0;
				$.each(overlays.eq.markers, function (i, markerObj) {
					minMag = Math.min(minMag, markerObj.mag);
				});
				minMag += .05;
				$.each(overlays.eq.markers, function (i, markerObj) {
					var mag = markerObj.mag;
					if (polyContainsPoint(overlays.xPoly, markerObj.marker.getLatLng()) &&
						mag >= parseInt($(".slider-mag-value").html(), 0)) {
						// mag >= parseInt($( ".slider-mag-value" ).html(), 0) && (!maxDepth || markerObj.depthKm >= maxDepth*-1)){
						plotEqs.push([markerObj.epoch * 1000, mag, minMag]);
					}
				});
			}

			initializeViewer("mag-time");
			$.plot($("#mag-time .select-plot"), [

					{
						data: plotEqs,
						points: {
							radius: 4,
							symbol: 'circle',
							show: true
						},
						bars: {
							barWidth: 1,
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
					yaxis: {
						tickDecimals: 0,
						min: minMag
					},
					xaxis: {
						mode: "time",
						position: "bottom",
						timeformat: "%y/%m/%d"
					} //,
					// legend:{
					//   show:true,
					//   noColumns: 7,
					//   container: ".plot-legend"
					// }
				});

		}

		function plotCumulativeCount() {
			var line = [];
			var plotEqs0 = [];
			var plotEqs1 = [];
			var plotEqs2 = [];
			var plotEqs3 = [];
			var plotEqs4 = [];
			var plotEqs5 = [];
			if (overlays.xPoly) {
				var count = 0;
				var newEqArray = $.merge([], overlays.eq.markers); //clone array so we can sort it without altering original array
				newEqArray.sort(function (a, b) {
					return a.epoch - b.epoch;
				});
				$.each(newEqArray, function (i, markerObj) {
					var mag = parseInt(markerObj.mag, 0);
					if (polyContainsPoint(overlays.xPoly, markerObj.marker.getLatLng()) &&
						mag >= parseInt($(".slider-mag-value").html(), 0)) {
						// mag >= parseInt($( ".slider-mag-value" ).html(), 0) && (!maxDepth || markerObj.depthKm >= maxDepth*-1)){
						count += 1;
						line.push([markerObj.epoch * 1000, count]);
						mag = Math.max(0, mag);
						mag = Math.min(5, mag);
						eval("plotEqs" + mag).push([markerObj.epoch * 1000, count]);
					}
				});
			}

			// $('a#cumulative-count-link').trigger("click");
			initializeViewer("cumulative-count");

			$.plot($("#cumulative-count .select-plot"), [{
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
					}, {
						data: plotEqs3,
						label: "3",
						points: {
							radius: 12,
							symbol: 'circle',
							show: true
						}
					}, {
						data: plotEqs2,
						label: "2",
						points: {
							radius: 6,
							symbol: 'circle',
							show: true
						}
					}, {
						data: plotEqs1,
						label: "1",
						points: {
							radius: 4,
							symbol: 'circle',
							show: true
						}
					}, {
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
						lines: {
							show: true,
							steps: true
						}

					}


				],

				{
					yaxis: {
						tickDecimals: 0
					},
					xaxis: {
						mode: "time",
						position: "bottom",
						timeformat: "%y/%m/%d",
						ticks: 10
					},
					legend: {
						show: true,
						noColumns: 7,
						container: ".plot-legend"
					}
				});

		}

		/////////////////////////////////////////////////////////////////// cross section stuff


		//  //overlay to translate coordinates to pixels
		function init_helper_container() {
			overlays.container = new L.layerGroup();
			overlays.container.addTo(eqMap);
			overlays.container.draw = function () {
				if (!this.ready) {
					this.ready = true;
					eqMap.fire(this, 'ready');
				}
			};
		}

		//this is the call
		function plotCrossSection() {
			var aPix = overlays.xSectMarkers[0].pixelPoint;
			var bPix = overlays.xSectMarkers[3].pixelPoint;
			var a = new L.latLng(overlays.xSectMarkers[0].marker.getLatLng().lat, overlays.xSectMarkers[0].marker.getLatLng().lng);
			var b = new L.latLng(overlays.xSectMarkers[3].marker.getLatLng().lat, overlays.xSectMarkers[3].marker.getLatLng().lng);
			var elevator = new google.maps.ElevationService();
			var path = [a, b];
			var xSectLength = a.distanceFrom(b); //meters
			var xSectLengthPixels = Math.sqrt(Math.pow(aPix.x - bPix.x, 2) + Math.pow(aPix.y - bPix.y, 2)); //distance formula 
			var metersPerPixel = xSectLength / xSectLengthPixels;
			var pathRequest = {
				'path': path,
				'samples': 100
			};
			var verticalExag = 1.10;
			var elevationProfileArray = [];
			var plotEqs0 = [];
			var plotEqs1 = [];
			var plotEqs2 = [];
			var plotEqs3 = [];
			var plotEqs4 = [];
			var plotEqs5 = [];

			//find eqs in poly

			if (overlays.xPoly) {
				$.each(overlays.eq.markers, function (i, markerObj) {
					var mag = parseInt(markerObj.mag, 0);
					if (polyContainsPoint(overlays.xPoly, markerObj.marker.getLatLng()) && mag >= parseInt($(".slider-mag-value").html(), 0)) {
						mag = Math.max(0, mag);
						mag = Math.min(5, mag);
						eval("plotEqs" + mag).push([(projectEq(markerObj.marker)) * metersPerPixel, markerObj.depthKm]);
					}
				});
			}
			var sampleDistance = (xSectLength / pathRequest.samples - 1); //(meters) end points inclusive
			elevator.getElevationAlongPath(pathRequest, function (results, status) {
				if (status == google.maps.ElevationStatus.OK) {
					$.each(results, function (i, elevation) {
						elevationProfileArray.push([i * sampleDistance, -1 * elevation.elevation * verticalExag / 1000]);
					});
					var eqColor = 3;

					initializeViewer("cross-section");
					$.plot($("#cross-section .select-plot"), [{
								data: elevationProfileArray
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
							yaxis: {
								transform: function (v) {
									return -v;
								},
								inverseTransform: function (v) {
									return -v;
								}
							},
							xaxis: {
								position: "bottom",
								ticks: 0
							},
							legend: {
								show: true,
								noColumns: 7,
								container: ".plot-legend"
							}


						});

				}
			});
			return false;
		}

		// Make the modal for each type
		function initializeViewer(type) {
			$("#" + type + " .cross-section-viewer")
				.css('display', 'block')
				.draggable({
					scroll: false,
					containment: "#container"
				});

			$("#" + type + " ." + type).show();
			$(".loading").hide();
			var title;
			switch (type) {
				case 'depth-time':
					title = "Depth v. Time"
					break;
				case 'cumulative-count':
					title = "Cumulative Count"
					break;
				case 'mag-time':
					title = "Magnitude v. Time"
					break;
				default:
					title = "Magnitude Cross Section"
			}
			$("#" + type + " .close-viewer").click(function () {
				$("#" + type + " .cross-section-viewer").hide();
			});
			$("#" + type + " .cross-section-title").text(title);
		}

		function drawXSection(e) {
			if (!$('#define-plot-area').hasClass("draw-active") || overlays.xSectMarkers.length > 3) {
				return;
			} else {
				createPolyMarker([e.latlng.lat, e.latlng.lng]);
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
		function createPolyMarker(latlng) {

			var marker = new L.marker(latlng, {
				draggable: false
			});
			markerObj = {
				marker: marker,
				pixelPoint: eqMap.latLngToContainerPoint(latlng),
				distFromXsect: null
			};
			overlays.xSectMarkers.push(markerObj);

			switch (overlays.xSectMarkers.length) {
				//set A marker
				case 1:
					marker.setIcon(new L.divIcon({
						className: "",
						iconSize: null,
						html: opts.xSectionIconA
					}));
					createPolyMarker(latlng); //sw
					plotSteps(3);
					break;
					// set b marker


				case 3:
					marker.setIcon(new L.divIcon({
						className: "",
						iconSize: null,
						html: opts.xSectionIconTrans
					})); //se
					createPolyMarker(latlng);
					break;
				case 4:
					marker.setIcon(new L.divIcon({
						className: "",
						iconSize: null,
						html: opts.xSectionIconB
					})); //b
					//create a line between a & b 
					// var path = 
					var paths = [];
					$.each(overlays.xSectMarkers, function (i, val) {
						paths.push(val.marker.getLatLng());
					});

					overlays.xSectPolyLine = new L.polyline([overlays.xSectMarkers[0].marker.getLatLng(), latlng], {
						weight: 1,
						opacity: 1.0,
						color: "#FF0000"
					});

					overlays.xSectPolyLine.addTo(eqMap)
					//  overlays.xSectPolyLine.setMap(eqMap);

					createPolyMarker(latlng); //ne

					//n  drag handle
					createPolyMarker(eqMap.containerPointToLatLng(
						new L.point(
							parseInt((overlays.xSectMarkers[0].pixelPoint.x + overlays.xSectMarkers[3].pixelPoint.x) / 2, 0),
							parseInt((overlays.xSectMarkers[0].pixelPoint.y + overlays.xSectMarkers[3].pixelPoint.y) / 2, 0))
					));
					createPolyMarker(overlays.xSectMarkers[0].marker.getLatLng()); //nw


					$("#plot").fadeIn(500);
					plotSteps(4);
					break;
				case 6:
					marker.options.draggable = true;
					// marker.setIcon(opts.xSectionIconDrag);
					marker.setIcon(new L.divIcon({
						className: "",
						iconSize: null,
						html: opts.xSectionIconDrag
					})); //b


					marker.on('drag', function (e) {
						createRectangle([e.latlng.lat, e.latlng.lng]);
					});

					break;
				default: // icon is tansperant 
					marker.setIcon(new L.divIcon({
						className: "",
						iconSize: null,
						html: opts.xSectionIconTrans
					})); //b
			}
      
			marker.addTo(eqMap);

		}

		function createPolygon() {
			clearPolygon();
			var paths = [];
			$.each(overlays.xSectMarkers, function (i, val) {
				paths.push(val.marker.getLatLng());
			});
			overlays.xPoly = new L.polygon(paths);
			overlays.xPoly.addTo(eqMap);
		}

		function clearCrossSection() {
			$("#plot").hide();
			$('.cross-section-viewer').hide();
			$.each(overlays.xSectMarkers, function (i, val) {
				val.marker.remove();
			});
			clearPolygon();
			if (overlays.xSectPolyLine) {
				overlays.xSectPolyLine.remove();
			}
			overlays.xSectPolyLine = null;
			overlays.xSectMarkers = [];
		}

		function clearPolygon() {
			if (overlays.xPoly) {
				overlays.xPoly.remove();
			}
		}
    
		//takes endpoints of cross section plus the eq(latlng) and returns pixel offset from endPt1
		function projectEq(eqMarker) {
			var pointA = overlays.xSectMarkers[0].pixelPoint;
			var pointB = overlays.xSectMarkers[3].pixelPoint;
			var eq = eqMap.latLngToContainerPoint(eqMarker.getLatLng());
			var m = (pointB.y - pointA.y) / (pointB.x - pointA.x); //slope of the line
			var b = pointA.y - (m * pointA.x); //y intercept
			var c = eq.x;
			var d = eq.y;
			//find intersection of line through point and original line
			var y = ((m * m) * d + m * c + b) / ((m * m) + 1);
			var x = (m * d + c - m * b) / ((m * m) + 1);
			return Math.sqrt(Math.pow(pointA.x - x, 2) + Math.pow(pointA.y - y, 2)); //distance formula
		}

		//create rectangle from two end points and third width point
		function createRectangle(widthLatlng) {
			//reset incase zoom has changed
			$.each(overlays.xSectMarkers, function (i, val) {
				val.pixelPoint = eqMap.latLngToContainerPoint(val.marker.getLatLng());
			});
			var pointA = overlays.xSectMarkers[0].pixelPoint;
			var pointB = overlays.xSectMarkers[3].pixelPoint;
			var widthPoint = eqMap.latLngToContainerPoint(widthLatlng);
			//solve distance from line using
			//d = |Am +Bn +C| /(A*A + B*B)^1/2 where (m,n) are x,y of mouse drag event
			var m = (pointB.y - pointA.y) / (pointB.x - pointA.x); //slope of the line
			var b = pointA.y - (m * pointA.x); //y intercept
			var B = -1 / m; //convert to line of Ax + By + C = 0
			var C = b / m;
			//pixelWidth is the pixel distance from mouse event to the cross-section line 
			var pixelWidth = parseInt(((widthPoint.x + B * widthPoint.y + C)) / (Math.sqrt(1 + B * B)), 0);
			var phirad = Math.atan(((pointB.y - pointA.y) / (pointB.x - pointA.x))); //output in radians
			var phideg = Math.abs(180 / (Math.PI) * phirad);
			var dely = Math.abs(Math.abs(pixelWidth) * Math.sin((Math.PI / 180) * (90 - phideg)));
			var delx = Math.abs(Math.abs(pixelWidth) * Math.cos((Math.PI / 180) * (90 - phideg)));

			//which way to we go George?
			var sign = pixelWidth != 0 ? pixelWidth / Math.abs(pixelWidth) : 0;

			if (m == (1 / 0)) { //infinity or 90
				dely = 0;
				delx = delx * sign;
			} else if (m < 0) {
				delx = delx * sign;
				dely = dely * sign;
			} else if (m > 0) {
				if (sign > 0) {
					dely = -1 * dely;
				} else {
					delx = delx * sign;
				}
			} else { //m == 0
				delx = 0;
				dely = -1 * widthPoint * sign;
			}

			var pointSw = new L.point(pointA.x - delx, pointA.y - dely);
			var pointSe = new L.point(pointB.x - delx, pointB.y - dely);
			var pointNe = new L.point(pointB.x + delx, pointB.y + dely);
			var pointNw = new L.point(pointA.x + delx, pointA.y + dely);
			var pointN = new L.point(
				parseInt((pointNw.x + pointNe.x) / 2, 0),
				parseInt((pointNw.y + pointNe.y) / 2, 0)
			);
			overlays.xSectMarkers[1].marker.setLatLng(eqMap.containerPointToLatLng(pointSw));
			overlays.xSectMarkers[1].pixelPoint = pointSw;
			overlays.xSectMarkers[2].marker.setLatLng(eqMap.containerPointToLatLng(pointSe));
			overlays.xSectMarkers[2].pixelPoint = pointSe;
			overlays.xSectMarkers[4].marker.setLatLng(eqMap.containerPointToLatLng(pointNe));
			overlays.xSectMarkers[4].pixelPoint = pointNe;
			overlays.xSectMarkers[6].marker.setLatLng(eqMap.containerPointToLatLng(pointNw));
			overlays.xSectMarkers[6].pixelPoint = pointNw;
			overlays.xSectMarkers[5].marker.setLatLng(eqMap.containerPointToLatLng(pointN));
			overlays.xSectMarkers[5].pixelPoint = pointN;
			createPolygon();
			plotSteps(5);
		}

		//found at http://www.devcomments.com/Re-Polygon-contains-LatLng-at228409.htm
		function polyContainsPoint(obj, latLng) {
			var polyLatLngs = obj.getLatLngs()[0];
			var j = 0;
			var oddNodes = false;
			var x = latLng.lng;
			var y = latLng.lat;
			for (var i = 0; i < polyLatLngs.length; i++) {
				j++;
				if (j == polyLatLngs.length) {
					j = 0;
				}
				if (((polyLatLngs[i].lat < y) && (polyLatLngs[j].lat >= y)) ||
					((polyLatLngs[j].lat < y) && (polyLatLngs[i].lat >= y))) {
					if (polyLatLngs[i].lng + (y - polyLatLngs[i].lat) /
						(polyLatLngs[j].lat - polyLatLngs[i].lat) *
						(polyLatLngs[j].lng - polyLatLngs[i].lng) < x) {
						oddNodes = !oddNodes;
					}
				}
			}
			return oddNodes;
		}
	}
})(jQuery);