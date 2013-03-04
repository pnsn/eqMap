-- created using pg_dump -s -t events -t  non_net_events -t recent_events -t origins -t netmags -t stations -t channels -t station_type_groups_view -f pnsn_schema.sql pnsn_web_dev
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE channels (
    id integer NOT NULL,
    net character varying(255),
    sta character varying(255),
    seedchan character varying(255),
    location character varying(255),
    ondate date,
    channel character varying(255),
    channelsrc character varying(255),
    inid integer,
    remark character varying(255),
    unit_signal integer,
    unit_calib integer,
    lat double precision,
    lon double precision,
    elev double precision,
    edepth double precision,
    azimuth double precision,
    dip double precision,
    format_id integer,
    record_length integer,
    samplerate double precision,
    clock_drift double precision,
    flags character varying(255),
    offdate date,
    lddate date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    geom geometry,
    CONSTRAINT enforce_dims_geom CHECK ((st_ndims(geom) = 2)),
    CONSTRAINT enforce_geotype_geom CHECK (((geometrytype(geom) = 'POINT'::text) OR (geom IS NULL))),
    CONSTRAINT enforce_srid_geom CHECK ((st_srid(geom) = 32610))
);


ALTER TABLE public.channels OWNER TO user;

--
-- Name: channels_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE channels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.channels_id_seq OWNER TO user;

--
-- Name: channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE channels_id_seq OWNED BY channels.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE events (
    id integer NOT NULL,
    evid integer,
    prefor integer,
    prefmag integer,
    prefmec integer,
    commid integer,
    auth character varying(255),
    subsource character varying(255),
    etype character varying(255),
    selectflag boolean,
    lddate date,
    version integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    datetime double precision,
    lat double precision,
    lon double precision,
    depth double precision,
    magnitude double precision,
    magtype character varying(255),
    geom geometry,
    is_notable boolean,
    num_felts integer,
    CONSTRAINT enforce_dims_geom CHECK ((st_ndims(geom) = 2)),
    CONSTRAINT enforce_geotype_geom CHECK (((geometrytype(geom) = 'POINT'::text) OR (geom IS NULL))),
    CONSTRAINT enforce_srid_geom CHECK ((st_srid(geom) = 32610))
);


ALTER TABLE public.events OWNER TO user;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO user;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE events_id_seq OWNED BY events.id;


--
-- Name: netmags; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE netmags (
    id integer NOT NULL,
    magid integer NOT NULL,
    orid integer NOT NULL,
    commid integer,
    magnitude double precision NOT NULL,
    magtype character varying(255) NOT NULL,
    auth character varying(255) NOT NULL,
    subsource character varying(255),
    magalgo character varying(255),
    nsta integer,
    nobs integer,
    uncertainty double precision,
    gap double precision,
    distance double precision,
    quality double precision,
    rflag character varying(2),
    lddate date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.netmags OWNER TO user;

--
-- Name: netmags_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE netmags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.netmags_id_seq OWNER TO user;

--
-- Name: netmags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE netmags_id_seq OWNED BY netmags.id;


--
-- Name: non_net_events; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE non_net_events (
    id integer NOT NULL,
    evid character varying(255),
    magnitude double precision,
    lat double precision,
    lon double precision,
    depth double precision,
    auth character varying(255),
    version integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    datetime double precision,
    num_felts integer
);


ALTER TABLE public.non_net_events OWNER TO user;

--
-- Name: non_net_events_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE non_net_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.non_net_events_id_seq OWNER TO user;

--
-- Name: non_net_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE non_net_events_id_seq OWNED BY non_net_events.id;


--
-- Name: origins; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE origins (
    id integer NOT NULL,
    orid integer NOT NULL,
    evid integer,
    prefmag integer,
    prefmec integer,
    commid integer,
    bogusflag boolean NOT NULL,
    datetime double precision NOT NULL,
    lat double precision NOT NULL,
    lon double precision NOT NULL,
    depth double precision,
    location_type character varying(2),
    algorithm character varying(255),
    algo_assoc character varying(255),
    auth character varying(255) NOT NULL,
    subsource character varying(255),
    datumhor character varying(255),
    datumver character varying(255),
    gap double precision,
    distance double precision,
    wrms double precision,
    stime double precision,
    erhor double precision,
    sdep double precision,
    erlat double precision,
    erlon double precision,
    totalarr integer,
    totalamp integer,
    ndef integer,
    nbs integer,
    nbfm integer,
    locevid character varying(255),
    quality double precision,
    fdepth character varying(1),
    fepi character varying(1),
    ftime character varying(1),
    vmodelid character varying(2),
    cmodelid character varying(2),
    rflag character varying(2),
    lddate date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    geom geometry,
    CONSTRAINT enforce_dims_geom CHECK ((st_ndims(geom) = 2)),
    CONSTRAINT enforce_geotype_geom CHECK (((geometrytype(geom) = 'POINT'::text) OR (geom IS NULL))),
    CONSTRAINT enforce_srid_geom CHECK ((st_srid(geom) = 32610))
);


ALTER TABLE public.origins OWNER TO user;

--
-- Name: origins_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE origins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.origins_id_seq OWNER TO user;

--
-- Name: origins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE origins_id_seq OWNED BY origins.id;


--
-- Name: recent_events; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE recent_events (
    id integer NOT NULL,
    shakeable_id integer,
    shakeable_type character varying(255),
    show boolean DEFAULT true,
    lock boolean,
    feed_updated_at integer,
    created_by_id integer,
    updated_by_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.recent_events OWNER TO user;

--
-- Name: recent_events_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE recent_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.recent_events_id_seq OWNER TO user;

--
-- Name: recent_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE recent_events_id_seq OWNED BY recent_events.id;


--
-- Name: stations; Type: TABLE; Schema: public; Owner: user; Tablespace: 
--

CREATE TABLE stations (
    id integer NOT NULL,
    net character varying(255),
    sta character varying(255),
    ondate date,
    lat double precision,
    lon double precision,
    elev double precision,
    staname character varying(255),
    net_id integer,
    word_32 integer,
    word_16 integer,
    offdate date,
    lddate date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    geom geometry,
    CONSTRAINT enforce_dims_geom CHECK ((st_ndims(geom) = 2)),
    CONSTRAINT enforce_geotype_geom CHECK (((geometrytype(geom) = 'POINT'::text) OR (geom IS NULL))),
    CONSTRAINT enforce_srid_geom CHECK ((st_srid(geom) = 32610))
);


ALTER TABLE public.stations OWNER TO user;

--
-- Name: station_type_groups_view; Type: VIEW; Schema: public; Owner: user
--

CREATE VIEW station_type_groups_view AS
    SELECT station_counts.sta, station_counts.net, station_counts.ondate, station_counts.offdate, station_counts.staname, station_counts.geom, station_counts.lat, station_counts.lon, station_types.description, station_types.code, station_counts.elev, station_counts.short_period_channels, station_counts.strong_motion_channels, station_counts.broadband_channels, station_counts.id, seismogram_channel_count.seismogram_channel_count FROM ((station_types RIGHT JOIN (SELECT s.sta, s.net, s.ondate, s.offdate, s.geom, s.lat, s.lon, s.elev, s.staname, s.id, (SELECT count(*) AS count FROM channels ch WHERE (((((s.sta)::text = (ch.sta)::text) AND ((ch.net)::text = (s.net)::text)) AND (((ch.seedchan)::text ~~ 'EH%'::text) OR ((ch.seedchan)::text ~~ 'SH%'::text))) AND (ch.offdate > ('now'::text)::date))) AS short_period_channels, (SELECT count(*) AS count FROM channels ch WHERE (((((s.sta)::text = (ch.sta)::text) AND ((ch.net)::text = (s.net)::text)) AND (((ch.seedchan)::text ~~ 'BH%'::text) OR ((ch.seedchan)::text ~~ 'HH%'::text))) AND (ch.offdate > ('now'::text)::date))) AS broadband_channels, (SELECT count(*) AS count FROM channels ch WHERE (((((s.sta)::text = (ch.sta)::text) AND ((ch.net)::text = (s.net)::text)) AND ((((ch.seedchan)::text ~~ 'EN%'::text) OR ((ch.seedchan)::text ~~ 'HN%'::text)) OR ((ch.seedchan)::text ~~ 'SN%'::text))) AND (ch.offdate > ('now'::text)::date))) AS strong_motion_channels, count(c.sta) AS total FROM (stations s JOIN channels c ON (((c.sta)::text = (s.sta)::text))) WHERE (((s.offdate > ('now'::text)::date) AND (c.offdate > ('now'::text)::date)) AND ((s.net)::text = (c.net)::text)) GROUP BY s.sta, s.net, s.ondate, s.offdate, s.geom, s.lat, s.lon, s.elev, s.staname, s.id) station_counts ON ((((station_types.short_period_channels = station_counts.short_period_channels) AND (station_types.broadband_channels = station_counts.broadband_channels)) AND (station_types.strong_motion_channels = station_counts.strong_motion_channels)))) LEFT JOIN (SELECT seismogram_channels.station_id, count(*) AS seismogram_channel_count FROM seismogram_channels GROUP BY seismogram_channels.station_id) seismogram_channel_count ON ((station_counts.id = seismogram_channel_count.station_id))) GROUP BY station_counts.sta, station_counts.net, station_counts.ondate, station_counts.offdate, station_types.description, station_counts.short_period_channels, station_counts.strong_motion_channels, station_counts.broadband_channels, station_types.code, station_counts.geom, station_counts.lat, station_counts.lon, station_counts.elev, station_counts.staname, station_counts.id, seismogram_channel_count.seismogram_channel_count ORDER BY station_types.code, station_counts.net DESC;


ALTER TABLE public.station_type_groups_view OWNER TO user;

--
-- Name: stations_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE stations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUEuser
    CACHE 1;


ALTER TABLE public.stations_id_seq OWNER TO user;

--
-- Name: stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE stations_id_seq OWNED BY stations.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE channels ALTER COLUMN id SET DEFAULT nextval('channels_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE netmags ALTER COLUMN id SET DEFAULT nextval('netmags_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE non_net_events ALTER COLUMN id SET DEFAULT nextval('non_net_events_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE origins ALTER COLUMN id SET DEFAULT nextval('origins_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE recent_events ALTER COLUMN id SET DEFAULT nextval('recent_events_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE stations ALTER COLUMN id SET DEFAULT nextval('stations_id_seq'::regclass);


--
-- Name: channels_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: events_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: netmags_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY netmags
    ADD CONSTRAINT netmags_pkey PRIMARY KEY (id);


--
-- Name: non_net_events_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY non_net_events
    ADD CONSTRAINT non_net_events_pkey PRIMARY KEY (id);


--
-- Name: origins_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY origins
    ADD CONSTRAINT origins_pkey PRIMARY KEY (id);


--
-- Name: recent_events_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY recent_events
    ADD CONSTRAINT recent_events_pkey PRIMARY KEY (id);


--
-- Name: stations_pkey; Type: CONSTRAINT; Schema: public; Owner: user; Tablespace: 
--

ALTER TABLE ONLY stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (id);


--
-- Name: index_channels_on_geom; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_geom ON channels USING gist (geom);


--
-- Name: index_channels_on_lat; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_lat ON channels USING btree (lat);


--
-- Name: index_channels_on_lon; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_lon ON channels USING btree (lon);


--
-- Name: index_channels_on_net; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_net ON channels USING btree (net);


--
-- Name: index_channels_on_offdate; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_offdate ON channels USING btree (offdate);


--
-- Name: index_channels_on_ondate; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_ondate ON channels USING btree (ondate);


--
-- Name: index_channels_on_seedchan; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_seedchan ON channels USING btree (seedchan);


--
-- Name: index_channels_on_sta; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_channels_on_sta ON channels USING btree (sta);


--
-- Name: index_events_on_datetime; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_datetime ON events USING btree (datetime);


--
-- Name: index_events_on_depth; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_depth ON events USING btree (depth);


--
-- Name: index_events_on_evid; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_evid ON events USING btree (evid);


--
-- Name: index_events_on_geom; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_geom ON events USING gist (geom);


--
-- Name: index_events_on_lat; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_lat ON events USING btree (lat);


--
-- Name: index_events_on_lon; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_lon ON events USING btree (lon);


--
-- Name: index_events_on_magnitude; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_magnitude ON events USING btree (magnitude);


--
-- Name: index_events_on_magtype; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_magtype ON events USING btree (magtype);


--
-- Name: index_events_on_prefmag; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_prefmag ON events USING btree (prefmag);


--
-- Name: index_events_on_prefor; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_prefor ON events USING btree (prefor);


--
-- Name: index_events_on_selectflag; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_events_on_selectflag ON events USING btree (selectflag);


--
-- Name: index_netmags_on_magid; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_netmags_on_magid ON netmags USING btree (magid);


--
-- Name: index_netmags_on_magnitude; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_netmags_on_magnitude ON netmags USING btree (magnitude);


--
-- Name: index_netmags_on_orid; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_netmags_on_orid ON netmags USING btree (orid);


--
-- Name: index_origins_on_datetime; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_origins_on_datetime ON origins USING btree (datetime);


--
-- Name: index_origins_on_evid; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_origins_on_evid ON origins USING btree (evid);


--
-- Name: index_origins_on_geom; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_origins_on_geom ON origins USING gist (geom);


--
-- Name: index_origins_on_orid; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_origins_on_orid ON origins USING btree (orid);


--
-- Name: index_origins_on_prefmag; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_origins_on_prefmag ON origins USING btree (prefmag);


--
-- Name: index_stations_on_geom; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_geom ON stations USING gist (geom);


--
-- Name: index_stations_on_lat; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_lat ON stations USING btree (lat);


--
-- Name: index_stations_on_lon; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_lon ON stations USING btree (lon);


--
-- Name: index_stations_on_net; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_net ON stations USING btree (net);


--
-- Name: index_stations_on_offdate; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_offdate ON stations USING btree (offdate);


--
-- Name: index_stations_on_ondate; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_ondate ON stations USING btree (ondate);


--
-- Name: index_stations_on_sta; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_sta ON stations USING btree (sta);


--
-- Name: index_stations_on_staname; Type: INDEX; Schema: public; Owner: user; Tablespace: 
--

CREATE INDEX index_stations_on_staname ON stations USING btree (staname);


--
-- PostgreSQL database dump complete
--

