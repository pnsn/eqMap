--Query used for stations/seismograms map. Postgres tables use aqms station and channel tables plus uses seismogram_image table(pnsn) to only show stations with seismograms
--This is only meant to be an example. The joins are only to determine if there are seisomograms available for a given scnl. 
--NOTE: Postgres tables are pluralized!
SELECT DISTINCT ON(station_type_groups_view.sta) 
    station_type_groups_view.sta, 
    station_type_groups_view.net as auth, 
    station_type_groups_view.staname, 
    station_type_groups_view.description, 
    station_type_groups_view.lat, 
    station_type_groups_view.lon as lng, 
    station_type_groups_view.elev,
    station_type_groups_view.code as sta_code, 
    with_images_date.image_date as image_date 
FROM "station_type_groups_view" 
JOIN (
 	SELECT DISTINCT ON (c.sta, c.seedchan, c.net)
 	  c.sta, 
 	  c.seedchan, 
 	  c.net, 
 	  ci.channel_id 
 	FROM channels c
  JOIN channel_images ci ON c.id = ci.channel_id
  WHERE c.offdate > current_date
)  as with_images on with_images.sta = station_type_groups_view.sta
LEFT JOIN (
 	SELECT DISTINCT ON (c.sta, c.seedchan, c.net) 
 	  c.sta, 
 	  c.seedchan, 
 	  c.net, 
 	  ci.channel_id, 
 	  ci.image_date 
 	FROM channels c 
 	JOIN channel_images ci ON c.id = ci.channel_id 
 	WHERE ci.image_date = date '2013-03-04 00:00:00 UTC'
) as with_images_date on with_images_date.channel_id = with_images.channel_id
 WHERE (((station_type_groups_view.offdate > '2013-03-04 10:43:04.007248') AND (code in ('1sp','3bb','3bb3sm','3sm','3sm1sp','3sp'))) 
 AND (station_type_groups_view.net in ('UW','CC','UO','TA','PB') AND station_type_groups_view.net in ('UW','CC','UO','TA','PB')))