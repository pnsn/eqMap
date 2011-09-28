#eqMap
eqMap is a jQuery plugin for plotting earthquakes and stations on a GoogleMap. eqMap uses GoogleMap V3.

##Usage 
There are a series of defaults for different style of maps. The defaults are currently at the bottom of jquery.eqMap but will eventually be moved into a separate file. The standard defaults are loaded first then the others--if called- will override the standard defaults as needed. Additionally, arguments can be added to the initial call of the plugin and these will override all other defaults.

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

##Disclaimer
This plugin is very beta. I will be refactoring the code to make it more compatible with other networks. 
 


