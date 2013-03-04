#eqMap
EqMap is a jQuery plugin for plotting earthquakes, stations and polygons on a Google Map. The plugin uses Google Maps API V3 (API V2 is deprecated and will stop working on 5/19/2013). The plugin expects a JSONP objects for the earthquakes and stations, and KML files for all polygons. The JSONP objects can can from a file or a web service; the KML files must be hosted on a public facing web server.  

##Usage 
1. Get an API key at https://developers.google.com/maps/documentation/javascript/tutorial#api_key
2. Copy javascripts/eqMapConfigExample.js to javascripts/eqMapConfig.js (This file is gitignored)
3. Point browser to one of the example html files. 

By default the example files use PNSN event and station webservice, a PNSN boundary KML file and a S. California fault KML file.


The plugin is called by:
<pre><code>
  $("elem").eqMap({args})
</code></pre>

For example to create a volcano map on a div with id ="map":
<pre><code>
  $("#map").eqMap({
    map_type: "volcano"
  })
</code></pre>
##Configuration

The Configuration has the following hierarchy.

1. In eqMapConfig.js all standardDefaults are loaded for every map. These are defaults shared by all maps. The recent eq map only uses the standardDefaults.
2. The individual map types in eqMapConfig.js override the standardDefaults. If you map_type is named 'blar', the plugin will expect a config object of $fn.eqMap.blarDefaults
3. The arguements in the plugin call overide the defaults in eqMapConfig.js. See example files.


##Data Types
###Events
Events need to be in a JSON object with the following attributes. You can see an example object at http://www.pnsn.org/events/recent_events.json
<pre><code>
  Attribute             type
  evid                  Should be int. Required for historic map. Optionally used in bubble text for other maps
  auth                  string
  version               int 
  lat float             float
  lng                   float
  depth_km              float
  depth_mi              float
  magnitude,            float
  event_time_utc        string time stamp (optional for bubble and list only)
  event_time_local      string time stamp (optional for bubble and list only)
  event_time_epoch      float
  events.etype"         string ('re', 'le', 'ex', 'px') regional, local, explosion, probable explosion. Defaults to local events.
</code></pre>

###Stations
Stations need to be a JSON object with the following attributes. Example object can be viewed at http://www.pnsn.org/station_type_groups.json
<pre><code>
  Attributes            type
  sta                   string
  auth                  string
  staname               string 
  description           string
  lat                   float
  lng                   float
  elev                  float
  code                  string (describes station type) used for icon assignment
  
</code></pre>

###Polygons
Polygons are served via a public facing KML file. You can add as many polygon files as you wish. Each must have a unique name. See eqMapConfig.js for examples.


