--Example select statment for recent event query using postgres.
--note the pnsn events table is based on the aqms table but also duplicates attrs from the origin and netmag tables in order to decrease query times.
--The recent query reconciles with a polymorphic table named recent_events which keeps the state of the recent events by parsing usgs feeds
-- You DO NOT need this query. It is only an example
SELECT events.evid, 
        events.auth, 
        events.version, 
        round(cast(events.lat as numeric), 4) as lat, 
        round(cast(events.lon as numeric), 4) as lng, 
        round(cast(events.depth as numeric),1) as depth_km,
        round(cast((events.depth * 0.62) as numeric), 1) as depth_mi, 
        round(cast(events.magnitude as numeric), 1) as magnitude,
        TO_CHAR(TIMESTAMP 'epoch' + events.datetime * INTERVAL '1 second', 'YYYY/MM/DD HH24:MI:SS') as event_time_utc,
        TO_CHAR(TIMESTAMP 'epoch' + events.datetime * INTERVAL '1 second', 'Dy, DD Mon HH24:MI:SS') as rss_utc,
        TO_CHAR(TIMESTAMP WITH TIME ZONE 'epoch' + events.datetime * INTERVAL '1 second', 'YYYY/MM/DD HH24:MI:SS TZ') as event_time_local,
        events.datetime as event_time_epoch, 
        events.etype 
        FROM "events" 
        INNER JOIN "recent_events" ON "recent_events".shakeable_id = "events".id AND "recent_events".shakeable_type = 'Event' 
        WHERE (((events.selectflag = true) AND (etype in ('le','uk','px','ex','lf','re'))) 
          AND (recent_events.show = TRUE AND events.datetime > (EXTRACT(EPOCH FROM NOW()) -1209600))) 
        ORDER BY events.datetime desc