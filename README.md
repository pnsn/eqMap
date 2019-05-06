# eqMap

EqMap is a generic mapping utility for plotting, earthquakes, monitoring stations,  and polygons on a Leaflet Map. The plugin uses Leaflet V1.3. The plugin expects a JSON objects for the earthquakes and stations, and KML files for all polygons. The JSON objects need to served via web service; the KML files must be hosted on a public facing web server. 

EqMap was developed by Jon Connolly ([PNSN](https://pnsn.org)) and Kyla Marczewski ([PNSN](https://pnsn.org)).  This fork has customized EqMap for use by the [UUSS](https://quake.utah.edu/).

## Directory Structure

1. _examples_ contains the .html files for station, event, and thumbnail maps.
2. _javascripts_ contains the javascripts used by the html files in _examples_.  By design, the most important file is eqMapConfig.js.
3. _geojson_ contains the authoritaritive boundaries of the UUSS seismic network.
4. _php_ contains some PHP scripts for querying event and station information.
5. _stylesheets_ most interesting facet is controlling the colors.
6. _sql_ 
7. _python_ contains a script to generate a Python script for one week from a USGS feed.

## Usage 

If starting from scratch then follow these directions

1. Copy javascripts/eqMapConfigExample.js to javascripts/eqMapConfig.js (This file is gitignored)
2. Point browser to one of the example html files.
3. If you are using the X-Section Plot, Get an API key for the [Elevation Service](https://developers.google.com/maps/documentation/javascript/elevation).
4. Once you create your own templates add your API key, e.g.,.

    <code> &lt;script src="https://www.google.com/jsapi?key=" type="text/javascript"&gt; </script></code>

The plugin is called by:

    <pre><code>
        $("elem").eqMap({args})
    </code></pre>

For example to create a volcano map on a div with id ="map":

    <pre><code>
        $("#map").eqMap({map_type: "volcano"})
    </code></pre>

## Configuration

The Configuration has the following hierarchy.

1. In eqMapConfig.js standardDefaults($.fn.eqMap.standardDefaults) are loaded for every map. These are defaults shared by all maps. The recent eq map uses the standardDefaults exclusively.
2. The individual map types in eqMapConfig.js override the standardDefaults. If your map\_type is named 'blar', the plugin will expect a config object of $fn.eqMap.blarDefaults
3. The arguments in the plugin call override the defaults in eqMapConfig.js. See example files.


## Data Types
### Events

Events need to be in a JSON object with the following attributes. You can see an example object at <http://www.pnsn.org/events/recent_events.json>

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

### Stations

Stations need to be a JSON object with the following attributes. Example object can be viewed at <http://www.pnsn.org/station_type_groups.json>
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

Polygons are served via a public facing KML file. You can add as many polygon files as you wish. Each must have a unique name. See eqMapConfigExample.js for examples.

##Request types

This plugin expects a JSON object served via a web service or public facing flat file. If the web service is on a different host than the web server(server that is hosting eqMap) you must create a [JSONP request](http://en.wikipedia.org/wiki/JSONP), which allows for cross site scripting. This can be done by appending "?callback=?" to the end of the webservice url. A simple php web service is included. See the  URLs in the eqMapConfigExample.js file for examples. If the JSON file is on the web server, JSONP is not required but the file must be served via http. You must use the web service for testing locally i.e., <http://localhost/your/path/eqMap/php/json_service.php>.

A python script is included to generate a json file from the 1 week usgs all feed.

## Requirements
Bootstrap v3 is used for the UI, but it can be omitted if you have a custom UI. The Bootstrap css must be loaded before main.css. A Google Maps Elevation Service API Key is required for the X-Section Plot. Esri-Leaflet is required for basemaps.

