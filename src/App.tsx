import { useMemo, useState } from "react";
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
const displayDateRange = (search: SearchState) => {
  const depart = new Date(`${search.departDate}T00:00:00`);
  const returning = new Date(`${search.returnDate}T00:00:00`);
  return `${depart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}-${returning.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

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

function MapCanvas({ selected }: { selected: FlightOffer }) {
  return (
    <section className="mapCanvas" aria-label="Route map">
      <div className="mapLabels">
        <span className="city sf">SAN FRANCISCO</span>
        <span className="city la">LOS ANGELES</span>
        <span className="city vegas">LAS VEGAS</span>
        <span className="city phx">PHOENIX</span>
      </div>
      <svg className="routeSvg" viewBox="0 0 1000 620" preserveAspectRatio="none">
        <path className="routeGhost" d="M300 430 C410 330 585 225 790 140" />
        <path className="routeMain" d="M300 430 C410 330 585 225 790 140" />
        <circle className="pin" cx="300" cy="430" r="8" />
        <circle className="pin" cx="790" cy="140" r="8" />
      </svg>
      <div className="planeMarker primary"><Plane size={30} /></div>
      <div className="planeMarker p1"><Plane size={24} /></div>
      <div className="planeMarker p2"><Plane size={22} /></div>
      <div className="planeMarker p3"><Plane size={26} /></div>
      <div className="planeMarker p4"><Plane size={20} /></div>
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
        <MapCanvas selected={selected} />
        <SearchDock search={search} setSearch={setSearch} />
        <ItineraryPanel offer={selected} watched={watchedIds.includes(selected.id)} onWatch={() => toggleWatch(selected.id)} onBook={() => setBooking(true)} />
        <FareDeck offers={offers} selectedId={selected.id} watchedIds={watchedIds} setSelectedId={setSelectedId} toggleWatch={toggleWatch} />
        <PageOverlay view={view} watched={watched} />
      </main>
      {booking && <BookingModal offer={selected} onClose={() => setBooking(false)} />}
    </div>
  );
}
