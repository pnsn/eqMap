--postgres view that uses aqms station and channel table schema to create query grouped by type. 
--NOTE: postgres table names are pluralized!
-- to run
-- psql -d db_name -f  sql/station_type_groups_view.sqlCREATE OR REPLACE VIEW station_type_groups_view
  AS
    SELECT station_counts.sta, station_counts.net,station_counts.ondate, station_counts.offdate, station_counts.staname, station_counts.geom, station_counts.lat, 
    station_counts.lon,station_types.description, station_types.code, station_counts.elev, station_counts.short_period_channels, station_counts.strong_motion_channels,
    station_counts.broadband_channels, station_counts.id
    FROM station_types
    RIGHT JOIN(
      SELECT s.sta, s.net, s.ondate, s.offdate, s.geom, s.lat, s.lon, s.elev, s.staname, s.id,
        (SELECT count(*) FROM channels AS ch 
          WHERE s.sta = ch.sta AND ch.net = s.net  AND 
          (ch.seedchan LIKE 'EH%' OR ch.seedchan LIKE 'SH%') AND ch.offdate > current_date) AS short_period_channels,
        (SELECT count(*) from channels AS ch
          WHERE s.sta = ch.sta AND ch.net = s.net  AND 
            (ch.seedchan LIKE 'BH%' OR ch.seedchan LIKE 'HH%') AND ch.offdate > current_date) AS broadband_channels,
        (SELECT count(*) from channels AS ch
          WHERE s.sta = ch.sta AND ch.net = s.net AND 
            (ch.seedchan LIKE 'EN%' OR ch.seedchan LIKE 'HN%' OR ch.seedchan LIKE'SN%') AND ch.offdate > current_date) AS strong_motion_channels,
            count(c.sta) AS total
        FROM stations AS s
        JOIN channels AS c on c.sta = s.sta
        WHERE s.offdate > current_date AND c.offdate > current_date AND s.net = c.net
        GROUP BY s.sta, s.net, s.ondate, s.offdate, s.geom, s.lat, s.lon, s.elev, s.staname, s.id) 
    AS station_counts ON station_types.short_period_channels = station_counts.short_period_channels AND
    station_types.broadband_channels = station_counts.broadband_channels AND
    station_types.strong_motion_channels = station_counts.strong_motion_channels
    --end RIGHT JOIN

    GROUP BY station_counts.sta, station_counts.net, station_counts.ondate, station_counts.offdate, station_types.description, station_counts.sta, 
    station_counts.short_period_channels, station_counts.strong_motion_channels,station_counts.broadband_channels, station_types.code,station_counts.geom, 
    station_counts.lat, station_counts.lon, station_counts.elev, station_counts.staname, station_counts.id
    ORDER BY station_types.code ASC, station_counts.net DESC
