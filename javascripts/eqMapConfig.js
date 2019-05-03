///Use this file to config different map types
//common objects userd by map configs

//Defines shapes of icons
$.fn.eqMap.icons = {
  event : '<svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45"/></svg>', //circle
  nnEvent : '<svg width="100%" height="100%" viewBox="0 0 50 50"><rect x="1" y="1" width="48" height="48"/></svg>', //square
  explosion : '<svg width="100%" height="100%" viewBox="-250 -250 500 500"><polygon points="249,1 40,40 1,249 -40,40 -249,1 -40,-40 1,-249 40,-40"/></svg>', //4 point star
  queried: '<svg width="100%" height="100%" viewBox="-125 0 250 235"><polygon points="0,0 35,82 125,90 55,155 75,235 0,190 -75,235 -55,155 -125,90 -35,82" /></svg>', //star
  nnStation : '<svg width="100%" height="100%" viewBox="-125 0 250 235"><polygon points="0,0 125,90 75,235 -75,235 -125,90" /></svg>',//pentagon
  station : '<svg width="100%" height="100%" viewBox="-125 0 250 235"><polygon points="0,0 125,217 -125,217" /></svg>', //triangle
  // station : '<svg width="100%" height="100%" viewBox="-125 0 250 235"><polygon points="0,0 30,115 125,217 0,175 -125,217 -30,120" /></svg>', //dented triangle
}

$.fn.eqMap.eqBubbleHtml = function(eq) {
  if (eq.auth == "nc" || eq.auth == "us" || eq.auth == "mb" || eq.auth == "nn") {
    a = "<a href=https://earthquake.usgs.gov/earthquakes/eventpage/" + eq.auth + eq.evid + "> View Event Page </a>";
  } else { 
    a = "<a href='/event/" + eq.evid + "#overview'> View Event Page </a>";
  }
  return a +
    "<table>" +
    "<tr> <td class ='popup-label'> Magnitude: </td><td class = 'content'>" + parseFloat(eq.magnitude).toFixed(1) + "</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Time(UTC): </td><td class = 'content'>" + eq.event_time_utc + "</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Time(Local): </td><td class = 'content'>" + eq.event_time_local + "</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Depth: </td><td class = 'content'>" + parseFloat(eq.depth_km).toFixed(1) + " km (" + parseFloat(eq.depth_mi).toFixed(1) + " miles)</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Event Id: </td><td class = 'content'>" + eq.evid + "</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Network: </td><td class = 'content'>" + eq.auth + "</td> " + "</tr>" +
    "</table>";
};

$.fn.eqMap.staBubbleHtml = function(sta, marker) {
  return "<a href='/seismogram/current/" + sta.sta.toLowerCase() + "'> View Seismogram </a>" +
    "<table>" +
    "<tr> <td class ='popup-label'> Name: </td><td class = 'content'>" + sta.sta + "</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Network: </td><td class = 'content'>" + sta.auth + "</td> " + "</tr>" +
    //"<tr> <td class ='popup-label'> Description: </td><td class = 'content'>" + sta.description + "</td> " + "</tr>" +
    "<tr> <td class ='popup-label'> Description: </td><td class = 'content'>" + sta.staname + "</td> " + "</tr>" +
    "</table>";

};

$.fn.eqMap.eqListHtml = function(eq) {
  return "<tr rev='" + eq.evid + "'> <td class='magnitude'>" + parseFloat(eq.magnitude).toFixed(1) 
  +"</td><td data-utc='" + eq.event_time_utc + "' class='time toggleable off'>" + eq.event_time_utc 
  +"</td><td data-local='" + eq.event_time_local + "' class='time toggleable'>" + eq.event_time_local 
  +"</td><td data-miles='" + eq.depth_mi + "' class='depth toggleable off'>" + parseFloat(eq.depth_mi).toFixed(1) 
  +" mi</td><td data-kilometers='" + parseFloat(eq.depth_km).toFixed(1) + "' class='depth toggleable'>"+ parseFloat(eq.depth_km).toFixed(1)
  +" km</td></tr>";
};

$.fn.eqMap.staListHtml = function(sta) {
  return "<tr> <td>" + sta.sta + "</td><td>" +
    sta.auth + "</td><td>" +
    sta.sta_code + "</td></tr>";
};

$.fn.eqMap.polyObjectHtml = function(obj) {
  return "hello";
};

//map configs.
$.fn.eqMap.standardDefaults = {
  evid: null, //used only for historic map
  
  lat: 41.1, //starting center
  lng: -111.34, //starting center
  
  zoom: 6,
  attributionControl:true,
  zoomControl: true, 
  closePopupOnClick: true,
  dragging: true,
  
  scrollWheelZoom: true,

  zoomToFit: false,
  
  drawControl: true,
  //End gmap API calls
  magMin: -2,
  magMax: 7,
  //authNetworks: ['uw', 'cc', 'uo', 'np'],
  authNetworks: ['uu', 'wy', 'np'],
  //Throw warning(alert) when this many events are requested.;
  list_limit: 1000,
  plot_relative_to_evid: false,

  //define collections for points(eqs and stations)
  params: {
    eq: {},
    sta: {}
  }, //these are top level since they may need overwriting on dynamic templates

  //eqs:

  //evid                  should be int for historical map before/after icons
  //auth                  string
  //version               int 
  //lat float             float
  //lng                   float
  //depth_km              float
  //depth_mi              float
  //magnitude,            float
  //event_time_utc        string time stamp (optional for bubble and list only)
  //event_time_local      string time stamp (optional for bubble and list only)
  //event_time_epoch      float
  //events.etype"         string ('re', 'le', 'ex', 'px') regional, local, explosion, probable explosion

  points: {
    eq: {
      displayOnLoad: true,
      //urls: ["https://pnsn.org/events/recent_events.json", "https://pnsn.org/non_net_events/recent_events.json"],
      urls: [ "https://beaker.seis.utah.edu/eqMap/php/json_service.php?callback=?",
              "https://beaker.seis.utah.edu/eqMap/php/json_nonuu.php?callback=?"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml,
      temporalSteps: [3600 * 2, 2 * 86400],
      cluster: null
    }

    //sta: {}
  },

  staIcon: $.fn.eqMap.staIcon,
  //x-section icons
  xSectionIconA: "A", //or really whatever HTML you want
  xSectionIconB: "B",
  xSectionIconDrag: "<div id='x-section-drag-handle'><div>",
  xSectionIconTrans: "",
  //you may add polygons by hosting a kml file on a webserver. 
  //gmaps caches the kml file. Use the following format for testing or if you have a dynamically generated kml file.
  //url: "http://webserver/path/to/file.kml?dummy=" + (new Date()).getTime()

  // you can validate your kml at http://googlemapsapi.blogspot.com/2007/06/validate-your-kml-online-or-offline.html
  //A checkbox event is added to display each polygon file.  Using a checkbox is optional.
  //This Example assumes polygon is called 'boundaries' and displayOnDefault is set to true

  //<div id='boundaries'>
  //  <div class='checkbox'>
  //    <input checked="checked" id="boundaries" name="boundaries" type="checkbox" value="#" />
  //    <label>Display boundaries</label>
  //  </div>
  //</div>

  polygons: {
    boundaries: {
      //url: "https://pnsn.org/assets/json/pnsn_boundaries.geojson",
      url: "https://beaker.seis.utah.edu/eqMap/examples/uuss-boundaries.kml",
      displayOnLoad: true
    },
    faults: {
      //url: "https://pnsn.org/assets/json/pnsn_faults.geojson",
      displayOnLoad: false
    }

  },
  bubbleHtmlSta: $.fn.eqMap.staBubbleHtml,
  listHtmlSta: $.fn.eqMap.staListHtml,
  //add logo to map
  // logo: {
  //   logoHref: "/",
  //   logoWidth: "75px",
  //   logoSrc: "/assets/pnsn_logo_rev_no_wave_outline.png"
  // },
  // map summary html, i.e. Total, Largest, Smallest, Latest, Earliest
  summaryHtmlEq: function(eqs) {
    var minMag = eqs[0];
    var maxMag = eqs[0];
    var minDate = eqs[0];
    var maxDate = eqs[0];
    $.each(eqs, function(i, eq) {
      if (parseFloat(eq.epoch) > parseFloat(maxDate.epoch)) {
        maxDate = eq;
      }
      if (parseFloat(eq.epoch) < parseFloat(minDate.epoch)) {
        minDate = eq;
      }

      if (parseFloat(eq.mag) > parseFloat(maxMag.mag)) {
        maxMag = eq;
      }
      if (parseFloat(eq.mag) < parseFloat(minMag.mag)) {
        minMag = eq;
      }


    });
    var minDateObj = new Date(minDate.epoch * 1000);
    var maxDateObj = new Date(maxDate.epoch * 1000);
    return "<ul>" +
      "<li class='label'>Total:</li>" +
      "<li>" + eqs.length + " | </li>" +
      "<li class='label'><a href='#'  rel='" + maxMag.evid + "'> Largest:</a></li>" +
      "<li>" + maxMag.mag + " |</li>" +
      "<li class='label'><a href='#'  rel='" + minMag.evid + "'>Smallest:</a></li>" +
      "<li>" + minMag.mag + " |</li>" +
      "<li class='label'><a href='#'  rel='" + maxDate.evid + "'>Latest</a></li>" +
      "<li>" + maxDateObj.getUTCFullYear() + "/" + (maxDateObj.getUTCMonth() + 1) + "/" + maxDateObj.getUTCDate() + " |</li>" +
      "<li class='label'><a href='#'  rel='" + minDate.evid + "'>Earliest:</a></li>" +
      "<li>" + minDateObj.getUTCFullYear() + "/" + (minDateObj.getUTCMonth() + 1) + "/" + minDateObj.getUTCDate() + "</li>" +
      "</ul>";
  },
  icons: $.fn.eqMap.icons,
  layerControl: true
};

//clickable thumbnail all gmap events disabled
$.fn.eqMap.thumbDefaults = {
  zoom: 6,
  zoomToFit:true,
  clickable:false,
  attributionControl: false,
  zoomControl: false, 
  closePopupOnClick: false,
  dragging: false,
  scrollWheelZoom: false,
  logo: null,
  points: {
    eq: {
      displayOnLoad: true,
      //urls: ["/events/recent_events.json", "/non_net_events/recent_events.json"],
      url: "https://beaker.seis.utah.edu/eqMap/examples/uuss-boundaries.kml",
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: null,
      listHtml: null,
      temporalSteps: [2 * 3600, 2 * 86400]
    }
  },
  polygons: {
    boundaries: {
      //url: "/assets/json/pnsn_boundaries.geojson",
      displayOnLoad: true
    }
  },
  layerControl: false
};

$.fn.eqMap.notableDefaults = {
  points: {
    eq: {
      displayOnLoad: true,
      urls: ["/events/notable_events.json"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml
    }
  },
  displayDepthOnly:true,
  polygons: null
};

//plot eq with it's old friends and perhaps new friends
$.fn.eqMap.historicDefaults = {
  points: {
    eq: {
      displayOnLoad: true,
      // urls: [ "/events/historic_event.json"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml
    }
  },
  plot_relative_to_evid: true,
  polygons: null,
  zoomToFit: true,
  magMin: 2,
  magMax: 9
};

$.fn.eqMap.customThumbDefaults = {
  points: {
    eq: {
      displayOnLoad: true,
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml
    }
  },
  plot_relative_to_evid: true,
  polygons: null,
  zoomToFit: true,
  magMin: 2,
  magMax: 9,
  clickable:false,
  attributionControl: false,
  zoomControl: false, 
  closePopupOnClick: false,
  dragging: false,
  logo: null
};


//and the volcanoes
$.fn.eqMap.volcanoDefaults = {
  magMin: -2,
  magMax: 5,
  zoom: 11,
  points: {
    sta: {
      displayOnLoad: true,
      urls: ["/station_type_groups.json"],
      icon: $.fn.eqMap.staIcon,
      bubbleHtml: $.fn.eqMap.staBubbleHtml,
      listHtml: null //$.fn.eqMap.staListHtml
    },

    eq: {
      displayOnLoad: true,
      urls: ["/events.json"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml,
      temporalSteps: [86400, 604800]
    }
  },
  polygons: null,
  polyObjects: {
    circle: {
      bubbleHtml: $.fn.eqMap.polyObjectHtml,
      displayOnLoad: true,
      objOptions: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0,
        clickable:false
      }
    }
  }

};

//and custom
$.fn.eqMap.customDefaults = {
  zoomToFit: true,
  points: {
    eq: {
      displayOnLoad: true,
      urls: ["/events.json"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml,
    }
  },
  displayDepthOnly: true
};

$.fn.eqMap.stationDefaults = {
  points: {
    sta: {
      displayOnLoad: true,
      //urls: ["https://assets.pnsn.org/seismogram_image/stations?callback=?"],
      urls: ["https://beaker.seis.utah.edu/eqMap/php/stations2.php?callback=?"],
      icon: $.fn.eqMap.staIcon,
      bubbleHtml: $.fn.eqMap.staBubbleHtml,
      listHtml: $.fn.eqMap.staListHtml,
      cluster: {
        gridSize: 50,
        maxZoom: 7
      }
    }
  },
  regions: ['puget-sound', 'portland'],
  regions_zoom: 10,
  polygons: null
};

$.fn.eqMap.mobileDefaults = {
  lng: -121,
  lat: 45,
  zoom: 5,
  disableDoubleClickZoom: true,
  scrollwheel: false,
  disableDefaultUI: true
};


$.fn.eqMap.spectrogramDefaults = {
  zoom: 6,
  points: {
  //   sta: {
  //     displayOnLoad: true,
  //     urls: ["/stations.json?spectrogram_subregions=all"],
  //     icon: $.fn.eqMap.staIcon,
  //     bubbleHtml: $.fn.eqMap.staBubbleHtml
  //       // listHtml: $.fn.eqMap.staListHtml,
  //       // cluster:{
  //       // gridSize: 50,
  //       // maxZoom: 7
  //       // }
  //   }
  },
  polygons: {
    spectrogram_ets: {
      url: "/assets/json/spectrogram_ets.geojson",
      displayOnLoad: true
    },
    spectrogram_tectonic: {
      url: "/assets/json/spectrogram_tectonic.geojson",
      displayOnLoad: true
    },
    spectrogram_volcanic: {
      url: "/assets/json/spectrogram_volcanic.geojson",
      displayOnLoad: true
    }
  }
};
