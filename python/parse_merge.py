#!/usr/bin/python
#simple python script to parse NEIC feeds. Default uses PNSN lat/lon


#example json object from NEIC
    
#{
#  "geometry": 
#    {
#     "type": "Point", 
#     "coordinates": [-122.714, 38.7715, 2.9]
#   }, 
#   "type": "Feature", 
#   "properties": 
#      {
#       "rms": "0.05", 
#       "code": "71945910", 
#       "cdi": null, 
#       "sources": ",nc,", 
#       "nst": null, 
#       "tz": -480, 
#       "sig": "2", 
#       "magnitudeType": "Md", 
#       "net": "nc", 
#       "status": "AUTOMATIC", 
#       "updated": "1362078936013", 
#       "felt": null, 
#       "alert": null, 
#       "dmin": "0", 
#       "mag": 0.4, 
#       "gap": "126", 
#       "types": ",general-link,geoserve,nearby-cities,origin,", 
#       "url": "http://earthquake.usgs.gov/earthquakes/eventpage/nc71945910", 
#       "ids": ",nc71945910,", 
#       "tsunami": null, 
#       "place": "5km S of Cobb, California", 
#       "time": "1362078836200", 
#       "mmi": null
#       },
#   "id": "nc71945910"
# }

#example Event json object for eqMap
#{"event":
#   {
#     "depth_km":"11.8",
#     "auth":"UW",
#     "rss_utc":"Thu, 07 Mar 01:47:06",
#     "evid":60508826,
#     "lng":"-118.5825",
#     "event_time_utc":"2013/03/07 01:47:06",
#     "version":5,
#     "depth_mi":"7.3",
#     "magnitude":1.8,
#     "event_time_epoch":"1362620826.13",
#     "lat":45.7235,
#     "etype":"le",
#     "event_time_local":"2013/03/06 17:47:06 PST"
#   }
#}


import urllib2, json, time
WEEK_URL = "http://earthquake.usgs.gov/earthquakes/feed/geojson/all/week"
MONTH_URL = "http://earthquake.usgs.gov/earthquakes/feed/geojson/all/month"
MAX_LAT = 51.0
MIN_LAT = 41.0
MAX_LNG = -116.0
MIN_LNG = -129.0
AUTH_NETS = ['uw','cc']

response = urllib2.urlopen(WEEK_URL)
json_data = json.load(response)
collection = []
for event in json_data['features']:
    lng =  round(float(event['geometry']['coordinates'][0]),2)
    lat =  round(float(event['geometry']['coordinates'][1]),2)
    net = event['properties']['net']
    #check if event is in lat/lng box and belongs to AUTH_NETS
    if lat <= MAX_LAT and lat >= MIN_LAT and lng <= MAX_LNG and lng >= MIN_LNG and any(net in s for s in AUTH_NETS):
      epoch = float(event['properties']['time'])/1000
      collection.append(
      {'event': {   
      'lat': lat,                     
      'lng': lng,                    
      'auth': net,                    
      'evid':event['properties']['code'], 
      'depth_km': round(event['geometry']['coordinates'][2],2),
      'depth_mi': round(1.61 * float( event['geometry']['coordinates'][2]),2),
      'event_time_epoch': epoch,
      'event_time_utc': time.strftime("%Y/%m/%d %H:%M:%S", time.gmtime(epoch)),
      'event_time_local': time.strftime("%Y/%m/%d %H:%M:%S", time.localtime(epoch)),
      'version' : 'n/a',  #can't ge version from feed
      'magnitude': round(event['properties']['mag'],1), 
      'etype': 'le' #can't get etype from feed 
      }})

with open('../json/recent_events.json', 'w') as outfile:
  json.dump(collection, outfile)
      
      
      
    
    
    
    
    

