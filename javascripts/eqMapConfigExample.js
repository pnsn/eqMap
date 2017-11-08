///Use this file to config different map types
//common objects userd by map configs
//sprites are used to cut down on # of requests.
$.fn.eqMap.eqIcon = {
  xSpriteOffset: [0, 11, 26, 44, 67, 95, 130],
  ySpriteOffset: [2, 47, 89, 132, 176, 220, 260, 304, 347, 388, 430, 472, 511, 551, 599, 645, 685, 725],
  spriteMask: [10, 15, 19, 23, 28, 37, 41], //size of the icon
  spritePath: "../images/map/eq-icons.png"
};

$.fn.eqMap.staIcon = {
  xSpriteOffset: [0, 20, 40, 60, 80, 99],
  ySpriteOffset: [0, 14],
  spriteMask: [15], //size of the icon
  spritePath: "../images/map/station-icons.png"

};

$.fn.eqMap.eqBubbleHtml = function(eq, marker) {
  if (eq.auth == "nc" || eq.auth == "us" || eq.auth == "mb" || eq.auth == "nn") {
    a = "<a href=https://earthquake.usgs.gov/earthquakes/eventpage/" + eq.auth + eq.evid + "> View Event Page </a>";
  } else {
    a = "<a href='/event/" + eq.evid + "#overview'> View Event Page </a>";
  }
  return a +
    "<table>" +
    "<tr> <td class ='label'> Magnitude: </td><td class = 'content'>" + parseFloat(eq.magnitude).toFixed(1) + "</td> " + "</tr>" +
    "<tr> <td class ='label'> Time(UTC): </td><td class = 'content'>" + eq.event_time_utc + "</td> " + "</tr>" +
    "<tr> <td class ='label'> Time(Local): </td><td class = 'content'>" + eq.event_time_local + "</td> " + "</tr>" +
    "<tr> <td class ='label'> Depth: </td><td class = 'content'>" + parseFloat(eq.depth_km).toFixed(1) + "Km (" + parseFloat(eq.depth_mi).toFixed(1) + "miles)</td> " + "</tr>" +
    "<tr> <td class ='label'> Event Id: </td><td class = 'content'>" + eq.evid + "</td> " + "</tr>" +
    "<tr> <td class ='label'> Network: </td><td class = 'content'>" + eq.auth + "</td> " + "</tr>" +
    "</table>";
};

$.fn.eqMap.staBubbleHtml = function(sta, marker) {
  return "<a href='/seismogram/current/" + sta.sta.toLowerCase() + "'> View Seismogram </a>" +
    "<table>" +
    "<tr> <td class ='label'> Name: </td><td class = 'content'>" + sta.sta + "</td> " + "</tr>" +
    "<tr> <td class ='label'> Network: </td><td class = 'content'>" + sta.auth + "</td> " + "</tr>" +
    "<tr> <td class ='label'> Description: </td><td class = 'content'>" + sta.description + "</td> " + "</tr>" +
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
  return "ehllo";
};


//map configs.
$.fn.eqMap.standardDefaults = {
  evid: null, //used only for historic map
  //These are are all standard GM V3 methods, please refer to the API
  lat: 45.07,
  lng: -120.95,
  zoom: 6,
  fullscreenControl:false,
  navigationControl: true,
  scaleControl: true,
  draggable: true,
  disableDefaultUI: false,
  disableDoubleClickZoom: false,
  mapTypeControl: true,
  streetViewControl:false,
  scrollWheel: true,
  zoomToFit: false,
  //End gmap API calls
  magMin: -2,
  magMax: 7,
  authNetworks: ['uw', 'cc', 'uo'],
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
      urls: ["http://localdocker:3000/events/recent_events.json?callback=?"],// , "http://localdocker:3000/non_net_events/recent_events.json?callback=?"],
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
  xSectionIconA: "../images/map/x-section-a.png",
  xSectionIconB: "../images/map/x-section-b.png",
  xSectionIconDrag: "../images/map/polyEditSquare.png",
  xSectionIconTrans: "../images/map/transparent.png",

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
      url: "https://assets.pnsn.org/kml/pnsn_boundaries.kml",
      displayOnLoad: true
    },
    faults: {
      url: "https://assets.pnsn.org/kml/pnsn_faults2.kml",
      // url: "http://assets.pnsn.org/kml/pnsn_faults.kml?Time=" + Date.now(),
      displayOnLoad: false
    }

  },
  bubbleHtmlSta: $.fn.eqMap.staBubbleHtml,
  listHtmlSta: $.fn.eqMap.staListHtml,
  //add logo to map
  logo: {
    logoHref: "/",
    logoWidth: "75px",
    logoSrc: "../images/pnsn_logo_rev_no_wave.png"
  },
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
  }
};



//clickable thumbnail all gmap events disabled
$.fn.eqMap.thumbDefaults = {
  polygons: null,
  zoom: 6,
  clickable:false,
  navigationControl: true,
  draggable: false,
  disableDefaultUI: true,
  disableDoubleClickZoom: true,
  mapTypeControl: false,
  scrollwheel: false,
  logo: null,
  points: {
    eq: {
      displayOnLoad: true,
      urls: ["/events/recent_events.json", "/non_net_events/recent_events.json"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: null,
      listHtml: null,
      temporalSteps: [2 * 3600, 2 * 86400]
    }
  },
  polygons: {
    boundaries: {
      url: "https://assets.pnsn.org/kml/pnsn_boundaries.kml",
      displayOnLoad: true
    }
  }
};

$.fn.eqMap.notableDefaults = {
  points: {
    eq: {
      displayOnLoad: true,
      displayDepthOnly: true,
      urls: ["/events/notable_events.json"],
      icon: $.fn.eqMap.eqIcon,
      bubbleHtml: $.fn.eqMap.eqBubbleHtml,
      listHtml: $.fn.eqMap.eqListHtml
    }
  },
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
  navigationControl: false,
  draggable: false,
  clickable: true,
  disableDefaultUI: true,
  disableDoubleClickZoom: true,
  scrollwheel: false,
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
      displayDepthOnly: true
    }
  }
};

$.fn.eqMap.stationDefaults = {
  points: {
    sta: {
      displayOnLoad: true,
      urls: ["https://assets.pnsn.org/seismogram_image/stations?callback=?"],
      icon: $.fn.eqMap.staIcon,
      bubbleHtml: $.fn.eqMap.staBubbleHtml,
      listHtml: $.fn.eqMap.staListHtml,
      displayDepthOnly: true,
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
    sta: {
      displayOnLoad: true,
      urls: ["/stations.json?spectrogram_subregions=all"],
      icon: $.fn.eqMap.staIcon,
      bubbleHtml: $.fn.eqMap.staBubbleHtml
        // listHtml: $.fn.eqMap.staListHtml,
        //displayDepthOnly: true
        // cluster:{
        // gridSize: 50,
        // maxZoom: 7
        // }
    }
  },
  polygons: {
    spectrogram_ets: {
      url: "https://assets.pnsn.org/kml/spectrogram_ets.kml",
      displayOnLoad: true
    },
    spectrogram_tectonic: {
      url: "https://assets.pnsn.org/kml/spectrogram_tectonic.kml",
      displayOnLoad: true
    },
    spectrogram_volcanic: {
      url: "https://assets.pnsn.org/kml/spectrogram_volcanic.kml",
      displayOnLoad: true
    }
  }
};