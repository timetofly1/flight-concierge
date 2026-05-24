import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ArrowRightLeft,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Gauge,
  Globe2,
  Luggage,
  Maximize2,
  Plane,
  Plus,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { airports, flightOffers, savedTrips } from "./data";
import type { Airport, AppView, FlightOffer, SearchState, SortMode } from "./types";

const initialSearch: SearchState = {
  origin: airports[0],
  destination: airports[1],
  departDate: "2026-05-21",
  returnDate: "2026-05-30",
  cabin: "economy",
  travelers: 1,
};

const money = (amount: number) => `$${amount.toLocaleString()}`;
const duration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const airportCoordinates: Record<string, [number, number]> = {
  CLE: [-81.8498, 41.4117],
  LAX: [-118.4085, 33.9416],
  JFK: [-73.7781, 40.6413],
  SFO: [-122.379, 37.6213],
  ORD: [-87.9073, 41.9742],
  ATL: [-84.4277, 33.6407],
  MIA: [-80.287, 25.7959],
  SEA: [-122.3088, 47.4502],
};

const displayDateRange = (search: SearchState) => {
  const depart = new Date(`${search.departDate}T00:00:00`);
  const returning = new Date(`${search.returnDate}T00:00:00`);
  return `${depart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}-${returning.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

const routeCurve = (from: [number, number], to: [number, number]) =>
  Array.from({ length: 56 }, (_, index) => {
    const t = index / 55;
    const lon = from[0] + (to[0] - from[0]) * t;
    const lat = from[1] + (to[1] - from[1]) * t + Math.sin(Math.PI * t) * 4.8;
    return [lon, lat];
  });

function makePlaneMarker(className = "") {
  const marker = document.createElement("div");
  marker.className = `mapPlaneMarker ${className}`;
  marker.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 19.2 16 11l3.5-3.5c1-.9 1-2.5 0-3.4-.9-1-2.5-1-3.4 0L12.5 7.6 4.3 5.8 3 7.1l6.6 3.3-3.5 3.5-2.1-.4-1 1 3.7 2.8 2.8 3.7 1-1-.4-2.1 3.5-3.5 3.3 6.6Z"/></svg>';
  return marker;
}

function makeAirportLabel(code: string) {
  const label = document.createElement("div");
  label.className = "mapAirportLabel";
  label.textContent = code;
  return label;
}

function AirportField({ label, value, onChange }: { label: string; value: Airport; onChange: (airport: Airport) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = airports.filter((airport) =>
    `${airport.code} ${airport.city} ${airport.name}`.toLowerCase().includes((query || value.city).toLowerCase()),
  );

  return (
    <div className="dockField">
      <span>{label}</span>
      <button type="button" onClick={() => setOpen(!open)}>
        <b>{value.code}</b> <em>{value.city}</em>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="airportMenu">
          <input autoFocus placeholder="City or airport" value={query} onChange={(event) => setQuery(event.target.value)} />
          {matches.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => {
                onChange(airport);
                setOpen(false);
                setQuery("");
              }}
            >
              <strong>{airport.code}</strong>
              <span>{airport.city}<small>{airport.name}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ view, setView }: { view: AppView; setView: (view: AppView) => void }) {
  const items = [
    { id: "search" as const, label: "Search", icon: Search },
    { id: "trips" as const, label: "Trips", icon: CalendarDays },
    { id: "watchlist" as const, label: "Watchlist", icon: Star },
    { id: "concierge" as const, label: "Concierge", icon: Sparkles },
  ];

  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => setView("search")}>
        <span><Plane size={18} /></span>
        Flight Concierge
      </button>
      <div className="sidebarSearch"><Search size={17} />Search routes</div>
      <nav>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button className={view === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setView(item.id)}>
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebarGroup">
        <button type="button"><Radar size={18} />Price radar</button>
        <button type="button"><WalletCards size={18} />Payments</button>
        <button type="button"><Settings size={18} />Settings</button>
      </div>
      <div className="member">
        <span>SO</span>
        <div><b>Sam Oliver</b><small>Premium member</small></div>
        <ChevronDown size={14} />
      </div>
    </aside>
  );
}

function SearchDock({ search, setSearch }: { search: SearchState; setSearch: (search: SearchState) => void }) {
  return (
    <section className="searchDock">
      <AirportField label="From" value={search.origin} onChange={(origin) => setSearch({ ...search, origin })} />
      <button className="swap" type="button" aria-label="Swap airports" onClick={() => setSearch({ ...search, origin: search.destination, destination: search.origin })}><ArrowRightLeft size={18} /></button>
      <AirportField label="To" value={search.destination} onChange={(destination) => setSearch({ ...search, destination })} />
      <div className="dockField"><span>Dates</span><button type="button"><b>{displayDateRange(search)}</b><ChevronDown size={14} /></button></div>
      <div className="dockField"><span>Cabin</span><button type="button"><b>{search.cabin[0].toUpperCase() + search.cabin.slice(1)}</b><ChevronDown size={14} /></button></div>
      <div className="dockField"><span>Travelers</span><button type="button"><b>{search.travelers} traveler</b><ChevronDown size={14} /></button></div>
      <button className="modify" type="button">Modify search</button>
    </section>
  );
}

function MapCanvas({ selected, search }: { selected: FlightOffer; search: SearchState }) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      attributionControl: false,
      container: mapContainer.current,
      center: [-96.5, 39.2],
      zoom: 3.6,
      minZoom: 2.4,
      maxZoom: 9,
      style: {
        version: 8,
        sources: {
          cartoDark: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "OpenStreetMap contributors, CARTO",
          },
        },
        layers: [{ id: "carto-dark", type: "raster", source: "cartoDark", paint: { "raster-opacity": 0.92 } }],
      },
    });

    return () => {
      markerRef.current.forEach((marker) => marker.remove());
      markerRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const origin = airportCoordinates[search.origin.code] ?? airportCoordinates.CLE;
    const destination = airportCoordinates[search.destination.code] ?? airportCoordinates.LAX;
    const route = routeCurve(origin, destination);
    const routeData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: route },
    };

    const renderRoute = () => {
      markerRef.current.forEach((marker) => marker.remove());
      markerRef.current = [];

      const source = map.getSource("active-route") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(routeData);
      } else {
        map.addSource("active-route", { type: "geojson", data: routeData });
        map.addLayer({
          id: "active-route-halo",
          type: "line",
          source: "active-route",
          paint: { "line-color": "#071321", "line-opacity": 0.75, "line-width": 7 },
        });
        map.addLayer({
          id: "active-route-line",
          type: "line",
          source: "active-route",
          paint: { "line-color": "#4d83ff", "line-opacity": 0.95, "line-width": 3.4 },
        });
      }

      const terminalData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: { code: search.origin.code }, geometry: { type: "Point", coordinates: origin } },
          { type: "Feature", properties: { code: search.destination.code }, geometry: { type: "Point", coordinates: destination } },
        ],
      };
      const terminals = map.getSource("terminals") as maplibregl.GeoJSONSource | undefined;
      if (terminals) {
        terminals.setData(terminalData);
      } else {
        map.addSource("terminals", { type: "geojson", data: terminalData });
        map.addLayer({
          id: "terminal-rings",
          type: "circle",
          source: "terminals",
          paint: {
            "circle-color": "#06101a",
            "circle-radius": 7,
            "circle-stroke-color": "#cfe2ff",
            "circle-stroke-width": 3,
          },
        });
      }

      const originLabel = new maplibregl.Marker({ element: makeAirportLabel(search.origin.code), anchor: "bottom", offset: [0, -12] }).setLngLat(origin).addTo(map);
      const destinationLabel = new maplibregl.Marker({ element: makeAirportLabel(search.destination.code), anchor: "bottom", offset: [0, -12] }).setLngLat(destination).addTo(map);
      const flightPoint = route[Math.round(route.length * 0.6)] as [number, number];
      const activePlane = new maplibregl.Marker({ element: makePlaneMarker("active") }).setLngLat(flightPoint).addTo(map);
      const traffic = [
        new maplibregl.Marker({ element: makePlaneMarker() }).setLngLat([-104.6, 36.4]).addTo(map),
        new maplibregl.Marker({ element: makePlaneMarker("small") }).setLngLat([-96.1, 33.4]).addTo(map),
        new maplibregl.Marker({ element: makePlaneMarker("small") }).setLngLat([-111.8, 39.3]).addTo(map),
        new maplibregl.Marker({ element: makePlaneMarker("dim") }).setLngLat([-88.8, 37.8]).addTo(map),
      ];
      markerRef.current = [originLabel, destinationLabel, activePlane, ...traffic];

      const bounds = new maplibregl.LngLatBounds(origin, origin).extend(destination);
      map.fitBounds(bounds, {
        padding: { left: 420, right: 210, top: 150, bottom: 235 },
        duration: 700,
        maxZoom: 4.8,
      });
    };

    if (map.loaded()) renderRoute();
    else map.once("load", renderRoute);
  }, [search.destination.code, search.origin.code, selected.id]);

  return (
    <section className="mapCanvas" aria-label="Route map">
      <div ref={mapContainer} className="mapRoot" />
      <div className="mapShade" />
      <div className="routeTooltip">{duration(selected.durationMinutes)}<small>{selected.stopLabel}</small></div>
      <div className="viewSelect"><SlidersHorizontal size={17} />Dark satellite<ChevronDown size={16} /></div>
      <div className="mapTools">
        <button type="button"><Plus size={20} /></button>
        <button type="button">-</button>
        <button type="button"><Maximize2 size={18} /></button>
        <button type="button"><Globe2 size={18} /></button>
      </div>
    </section>
  );
}

function ItineraryPanel({ offer, watched, onWatch, onBook }: { offer: FlightOffer; watched: boolean; onWatch: () => void; onBook: () => void }) {
  return (
    <section className="itineraryPanel">
      <div className="panelHead">
        <div><small>Your itinerary</small><h2><span>{offer.airlineCode}</span>{offer.airline}</h2></div>
        <em>Best balance</em>
      </div>
      <div className="priceLine"><strong>{money(offer.price)}</strong><span>per traveler</span><button className={watched ? "watch on" : "watch"} type="button" onClick={onWatch}><Bell size={15} />{watched ? "Watching" : "Watch"}</button></div>
      <div className="miniStats">
        <div><small>Fare confidence</small><b>{offer.confidence}%</b><span>High</span></div>
        <div><small>Price trend</small><b>Stable</b><span>7 days</span></div>
        <div><small>You save</small><b>$42</b><span>vs other options</span></div>
      </div>
      <div className="legList">
        <h3>Departure <span>Wed, May 21</span></h3>
        <div><i /><b>{offer.departTime}<small>CLE</small></b><span>{offer.stopLabel}<small>{duration(offer.durationMinutes)}</small></span><b>{offer.arriveTime}<small>LAX</small></b></div>
        <p>{offer.airline} {offer.segments[0]?.flight.replace(/[A-Z]+ /, "")} - {offer.baggage}</p>
        <h3>Return <span>Fri, May 30</span></h3>
        <div><i /><b>{offer.segments[1]?.depart ?? "2:15 PM"}<small>LAX</small></b><span>Nonstop<small>4h 19m</small></span><b>{offer.segments[1]?.arrive ?? "9:34 PM"}<small>CLE</small></b></div>
      </div>
      <button className="fareRules" type="button">View details and fare rules <ChevronDown size={15} /></button>
      <div className="infoGrid">
        <div><Luggage size={18} /><small>Baggage</small><b>{offer.baggage}</b></div>
        <div><Gauge size={18} /><small>Carbon</small><b>{offer.carbon}</b></div>
        <div><ShieldCheck size={18} /><small>Flexibility</small><b>{offer.changePolicy}</b></div>
      </div>
      <div className="groupBox"><Users size={18} /><p><b>Group trip</b>Invite friends or family to hold this itinerary.</p><button type="button">Invite collaborators</button></div>
      <button className="bookBtn" type="button" onClick={onBook}><Plane size={16} />Request booking</button>
      <p className="holdNote">We'll hold this fare and handle the booking for you.</p>
    </section>
  );
}

function OfferCard({ offer, selected, watched, onSelect, onWatch }: { offer: FlightOffer; selected: boolean; watched: boolean; onSelect: () => void; onWatch: () => void }) {
  return (
    <article className={`offerCard ${selected ? "selected" : ""}`}>
      <button type="button" onClick={onSelect}>
        <div className="offerTop"><span style={{ "--airline": offer.accent } as React.CSSProperties}>{offer.airlineCode}</span><b>{offer.airline}</b><strong>{money(offer.price)}<small>per traveler</small></strong></div>
        <div className="offerRoute"><b>{offer.departTime}<small>CLE</small></b><i /><span>{offer.stopLabel}<small>{duration(offer.durationMinutes)}</small></span><i /><b>{offer.arriveTime}<small>LAX</small></b></div>
        <div className="offerMeta"><em>{offer.confidence}% confidence</em><small>{offer.baggage}</small></div>
      </button>
      <button className={watched ? "selectDot on" : "selectDot"} type="button" onClick={onWatch}>{watched ? <Check size={15} /> : null}</button>
    </article>
  );
}

function FareDeck({ offers, selectedId, watchedIds, setSelectedId, toggleWatch }: { offers: FlightOffer[]; selectedId: string; watchedIds: string[]; setSelectedId: (id: string) => void; toggleWatch: (id: string) => void }) {
  return (
    <section className="fareDeck">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} selected={offer.id === selectedId} watched={watchedIds.includes(offer.id)} onSelect={() => setSelectedId(offer.id)} onWatch={() => toggleWatch(offer.id)} />
      ))}
    </section>
  );
}

function PageOverlay({ view, watched }: { view: AppView; watched: FlightOffer[] }) {
  if (view === "search") return null;
  if (view === "trips") {
    return <section className="pageOverlay"><h1>Trips</h1><p>Your saved searches and booking pipeline.</p>{savedTrips.map((trip) => <article key={trip.route}><b>{trip.route}</b><span>{trip.date}</span><em>{trip.status}</em><strong>{trip.price}</strong></article>)}</section>;
  }
  if (view === "watchlist") {
    return <section className="pageOverlay"><h1>Watchlist</h1><p>Fares you are tracking from the search workspace.</p>{watched.length ? watched.map((offer) => <article key={offer.id}><b>{offer.airline}</b><span>{offer.route}</span><em>{offer.stopLabel}</em><strong>{money(offer.price)}</strong></article>) : <p>No watched fares yet.</p>}</section>;
  }
  return <section className="pageOverlay concierge"><h1>AI Concierge</h1><p>Ask for a cleaner route, cheaper dates, or a group trip summary.</p><textarea defaultValue="Find me the cleanest roundtrip from Cleveland to Los Angeles for May 21 to May 30. Avoid red-eyes, prefer nonstop, and tell me if moving by one day saves money." /><button className="bookBtn" type="button">Generate trip plan</button></section>;
}

function BookingModal({ offer, onClose }: { offer: FlightOffer; onClose: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div>
        <button className="close" type="button" onClick={onClose}><X size={18} /></button>
        {done ? (
          <><span className="success"><Check size={28} /></span><h2>Booking request staged</h2><p>The itinerary, traveler count, fare, and provider/payment handoff are captured. Duffel order creation and Stripe confirmation connect here in production.</p><button className="bookBtn" type="button" onClick={onClose}>Back to map</button></>
        ) : (
          <><h2>Request booking</h2><p>Review the selected fare before turning this mock request into a live provider booking.</p><div className="summary"><span>{offer.airline}</span><b>{money(offer.price)}</b><span>{offer.route}</span><b>{offer.stopLabel}</b></div><button className="bookBtn" type="button" onClick={() => setDone(true)}>Stage request</button></>
        )}
      </div>
    </div>
  );
}

export function App() {
  const [view, setView] = useState<AppView>("search");
  const [search, setSearch] = useState(initialSearch);
  const [sort] = useState<SortMode>("best");
  const [selectedId, setSelectedId] = useState(flightOffers[0].id);
  const [watchedIds, setWatchedIds] = useState<string[]>([flightOffers[0].id]);
  const [booking, setBooking] = useState(false);
  const offers = useMemo(() => [...flightOffers].sort((a, b) => sort === "cheapest" ? a.price - b.price : b.confidence - a.confidence), [sort]);
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0];
  const watched = flightOffers.filter((offer) => watchedIds.includes(offer.id));
  const toggleWatch = (id: string) => setWatchedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <div className="appShell">
      <Sidebar view={view} setView={setView} />
      <main>
        <MapCanvas selected={selected} search={search} />
        <SearchDock search={search} setSearch={setSearch} />
        <ItineraryPanel offer={selected} watched={watchedIds.includes(selected.id)} onWatch={() => toggleWatch(selected.id)} onBook={() => setBooking(true)} />
        <FareDeck offers={offers} selectedId={selected.id} watchedIds={watchedIds} setSelectedId={setSelectedId} toggleWatch={toggleWatch} />
        <PageOverlay view={view} watched={watched} />
      </main>
      {booking && <BookingModal offer={selected} onClose={() => setBooking(false)} />}
    </div>
  );
}
