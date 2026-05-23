import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Filter,
  Gauge,
  Luggage,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import { airports, flightOffers, priceCalendar, savedTrips } from "./data";
import type { Airport, AppView, FlightOffer, SearchState, SortMode, StopFilter } from "./types";

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

function AirportPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Airport;
  onChange: (airport: Airport) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = airports.filter((airport) =>
    `${airport.code} ${airport.city} ${airport.name}`.toLowerCase().includes((query || value.city).toLowerCase()),
  );

  return (
    <div className="field">
      <label>{label}</label>
      <button className="fieldButton" type="button" onClick={() => setOpen(!open)}>
        <span>
          <strong>{value.city}</strong>
          <small>{value.code} - {value.name}</small>
        </span>
        <ChevronDown size={16} />
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
              <b>{airport.code}</b>
              <span>{airport.city}<small>{airport.name}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchBand({
  search,
  setSearch,
  onSearch,
}: {
  search: SearchState;
  setSearch: (search: SearchState) => void;
  onSearch: () => void;
}) {
  return (
    <section className="searchBand">
      <div className="routePill">
        <span><Plane size={17} /></span>
        <div><small>Roundtrip search</small><strong>{search.origin.city} to {search.destination.city}</strong></div>
      </div>
      <button className="lightBtn askBtn" type="button"><Sparkles size={16} />Ask concierge</button>
      <div className="searchGrid">
        <AirportPicker label="From" value={search.origin} onChange={(origin) => setSearch({ ...search, origin })} />
        <AirportPicker label="To" value={search.destination} onChange={(destination) => setSearch({ ...search, destination })} />
        <div className="field"><label>Depart</label><input type="date" value={search.departDate} onChange={(event) => setSearch({ ...search, departDate: event.target.value })} /></div>
        <div className="field"><label>Return</label><input type="date" value={search.returnDate} onChange={(event) => setSearch({ ...search, returnDate: event.target.value })} /></div>
        <div className="field">
          <label>Cabin</label>
          <select value={search.cabin} onChange={(event) => setSearch({ ...search, cabin: event.target.value as SearchState["cabin"] })}>
            <option value="economy">Economy</option>
            <option value="premium">Premium</option>
            <option value="business">Business</option>
          </select>
        </div>
        <div className="field"><label>Travelers</label><input min={1} max={8} type="number" value={search.travelers} onChange={(event) => setSearch({ ...search, travelers: Number(event.target.value) })} /></div>
        <button className="darkBtn searchBtn" type="button" onClick={onSearch}><Search size={18} />Search flights</button>
      </div>
    </section>
  );
}

function FlightCard({
  offer,
  selected,
  watched,
  onSelect,
  onToggleWatch,
}: {
  offer: FlightOffer;
  selected: boolean;
  watched: boolean;
  onSelect: () => void;
  onToggleWatch: () => void;
}) {
  return (
    <article className={`flightCard ${selected ? "selected" : ""}`}>
      <button className="flightMain" type="button" onClick={onSelect}>
        <span className="mark" style={{ "--airline": offer.accent } as React.CSSProperties}>{offer.airlineCode}</span>
        <span className="flightText">
          <strong>{offer.airline}<small>{offer.fareType}</small></strong>
          <span className="timeLine"><b>{offer.departTime}</b><i /><b>{offer.arriveTime}</b></span>
          <small>{duration(offer.durationMinutes)} - {offer.stopLabel} - {offer.baggage}</small>
        </span>
        <span className="price"><b>{money(offer.price)}</b><small>{offer.previousPrice > offer.price ? `was ${money(offer.previousPrice)}` : "stable"}</small></span>
      </button>
      <div className="flightFoot">
        <div>{offer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <button className={watched ? "watch on" : "watch"} type="button" onClick={onToggleWatch}><Bell size={16} />{watched ? "Watching" : "Watch"}</button>
      </div>
    </article>
  );
}

function DetailPanel({ offer, watched, onToggleWatch, onBook }: { offer: FlightOffer; watched: boolean; onToggleWatch: () => void; onBook: () => void }) {
  return (
    <aside className="detail">
      <div className="detailHead">
        <span className="mark big" style={{ "--airline": offer.accent } as React.CSSProperties}>{offer.airlineCode}</span>
        <div><h2>{offer.airline} roundtrip</h2><p>{offer.route} - {offer.stopLabel}</p></div>
        <b>{money(offer.price)}</b>
      </div>
      <div className="metrics">
        <div><Gauge size={18} /><small>Fare confidence</small><b>{offer.confidence}%</b></div>
        <div><Luggage size={18} /><small>Baggage</small><b>{offer.baggage}</b></div>
        <div><ShieldCheck size={18} /><small>Policy</small><b>Review before booking</b></div>
      </div>
      <div className="timeline">
        {offer.segments.map((segment) => (
          <div key={segment.flight}><span /><p><b>{segment.from} to {segment.to}</b>{segment.depart} - {segment.arrive} - {segment.flight}</p></div>
        ))}
      </div>
      <div className="insight"><Sparkles size={18} /><p><b>Concierge read</b>This is the cleanest balance of price and timing. Moving departure one day earlier could save about $42, but adds a connection for most fares.</p></div>
      <div className="group"><Users size={18} /><p><b>Group trip</b>Invite friends to hold this itinerary in their own workspace.</p><button type="button"><Plus size={16} />Add traveler</button></div>
      <div className="actions">
        <button className="lightBtn" type="button" onClick={onToggleWatch}><Bell size={17} />{watched ? "Watching fare" : "Watch fare"}</button>
        <button className="darkBtn" type="button" onClick={onBook}><CreditCard size={17} />Request booking</button>
      </div>
    </aside>
  );
}

function Results({
  offers,
  selected,
  selectedId,
  setSelectedId,
  sort,
  setSort,
  stops,
  setStops,
  watchedIds,
  toggleWatch,
  onBook,
}: {
  offers: FlightOffer[];
  selected: FlightOffer;
  selectedId: string;
  setSelectedId: (id: string) => void;
  sort: SortMode;
  setSort: (sort: SortMode) => void;
  stops: StopFilter;
  setStops: (stops: StopFilter) => void;
  watchedIds: string[];
  toggleWatch: (id: string) => void;
  onBook: () => void;
}) {
  return (
    <section className="workspace">
      <div className="toolbar">
        <div><strong>{offers.length} live fares</strong><small>Updated just now from mock provider</small></div>
        <div className="filters">
          <label><SlidersHorizontal size={16} /><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="best">Best</option><option value="cheapest">Cheapest</option><option value="fastest">Fastest</option></select></label>
          <label><Filter size={16} /><select value={stops} onChange={(event) => setStops(event.target.value as StopFilter)}><option value="any">Any stops</option><option value="nonstop">Nonstop</option><option value="one">1 stop max</option></select></label>
        </div>
      </div>
      <div className="calendar">{priceCalendar.map((day) => <button className={day.tone} key={day.date} type="button"><span>{day.date}</span><b>{money(day.amount)}</b></button>)}</div>
      <div className="resultsGrid">
        <div className="list">
          {offers.map((offer) => (
            <FlightCard key={offer.id} offer={offer} selected={offer.id === selectedId} watched={watchedIds.includes(offer.id)} onSelect={() => setSelectedId(offer.id)} onToggleWatch={() => toggleWatch(offer.id)} />
          ))}
        </div>
        <DetailPanel offer={selected} watched={watchedIds.includes(selected.id)} onToggleWatch={() => toggleWatch(selected.id)} onBook={onBook} />
      </div>
    </section>
  );
}

function ConciergePanel() {
  return (
    <aside className="side">
      <h3><Sparkles size={18} />Concierge</h3>
      <p className="chat">The best move is the nonstop United fare. It costs $42 more than the cheapest option but saves 2h 29m and avoids a tight Atlanta connection.</p>
      <button type="button"><CalendarDays size={16} />Check one-day-earlier fares</button>
      <button type="button"><WalletCards size={16} />Compare bag-inclusive fares</button>
      <button type="button"><Sparkles size={16} />Draft group trip invite</button>
    </aside>
  );
}

function BookingModal({ offer, onClose }: { offer: FlightOffer; onClose: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div>
        {done ? (
          <>
            <span className="success"><Check size={28} /></span>
            <h2>Booking request staged</h2>
            <p>The itinerary, traveler count, fare, and provider/payment handoff are captured. Duffel order creation and Stripe confirmation connect here in production.</p>
            <button className="darkBtn full" type="button" onClick={onClose}>Back to workspace</button>
          </>
        ) : (
          <>
            <h2>Request booking</h2>
            <p>Review the selected fare before turning this mock request into a live provider booking.</p>
            <div className="summary"><span>{offer.airline}</span><b>{money(offer.price)}</b><span>{offer.route}</span><b>{offer.stopLabel}</b></div>
            <p className="checks"><Check size={15} /> Fare selected<br /><Check size={15} /> Payment boundary ready<br /><Check size={15} /> Provider order step mocked</p>
            <div className="actions"><button className="lightBtn" type="button" onClick={onClose}>Cancel</button><button className="darkBtn" type="button" onClick={() => setDone(true)}>Stage request</button></div>
          </>
        )}
      </div>
    </div>
  );
}

function Header({ view, setView }: { view: AppView; setView: (view: AppView) => void }) {
  const items: { id: AppView; label: string }[] = [
    { id: "search", label: "Search" },
    { id: "trips", label: "Trips" },
    { id: "watchlist", label: "Watchlist" },
    { id: "concierge", label: "Concierge" },
  ];
  return (
    <header>
      <button className="brand" type="button" onClick={() => setView("search")}><span><Plane size={18} /></span>Flight Concierge</button>
      <nav>{items.map((item) => <button className={view === item.id ? "active" : ""} key={item.id} type="button" onClick={() => setView(item.id)}>{item.label}</button>)}</nav>
      <button className="profile" type="button"><span>SO</span>Profile</button>
    </header>
  );
}

export function App() {
  const [view, setView] = useState<AppView>("search");
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<SortMode>("best");
  const [stops, setStops] = useState<StopFilter>("any");
  const [selectedId, setSelectedId] = useState(flightOffers[0].id);
  const [watchedIds, setWatchedIds] = useState<string[]>([flightOffers[0].id]);
  const [booking, setBooking] = useState(false);
  const offers = useMemo(() => {
    const filtered = flightOffers.filter((offer) => stops === "any" || offer.stops === 0 || stops === "one");
    return filtered.sort((a, b) => sort === "cheapest" ? a.price - b.price : sort === "fastest" ? a.durationMinutes - b.durationMinutes : b.confidence - a.confidence);
  }, [sort, stops]);
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0] ?? flightOffers[0];
  const toggleWatch = (id: string) => setWatchedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const watched = flightOffers.filter((offer) => watchedIds.includes(offer.id));

  return (
    <div>
      <Header view={view} setView={setView} />
      <main>
        {view === "search" && (
          <>
            <SearchBand search={search} setSearch={setSearch} onSearch={() => setSelectedId(flightOffers[0].id)} />
            <div className="layout"><Results offers={offers} selected={selected} selectedId={selected.id} setSelectedId={setSelectedId} sort={sort} setSort={setSort} stops={stops} setStops={setStops} watchedIds={watchedIds} toggleWatch={toggleWatch} onBook={() => setBooking(true)} /><ConciergePanel /></div>
          </>
        )}
        {view === "trips" && <section className="page"><h1>Trips</h1><p>Your saved searches and booking pipeline.</p>{savedTrips.map((trip) => <article className="trip" key={trip.route}><b>{trip.route}</b><span>{trip.date}</span><em>{trip.status}</em><strong>{trip.price}</strong></article>)}</section>}
        {view === "watchlist" && <section className="page"><h1>Watchlist</h1><p>Fares you are tracking from the search workspace.</p>{watched.length ? watched.map((offer) => <FlightCard key={offer.id} offer={offer} selected={false} watched onSelect={() => { setView("search"); setSelectedId(offer.id); }} onToggleWatch={() => toggleWatch(offer.id)} />) : <div className="empty"><Star size={22} /><b>No watched fares yet</b><p>Save a fare from search to monitor price movement.</p></div>}</section>}
        {view === "concierge" && <section className="page"><h1>AI Concierge</h1><p>Natural-language planning surface for the next build phase.</p><div className="prompt"><Sparkles size={22} /><textarea defaultValue="Find me the cleanest roundtrip from Cleveland to Los Angeles for May 21 to May 30. Avoid red-eyes, prefer nonstop, and tell me if moving by one day saves money." /><button className="darkBtn" type="button">Generate trip plan<ArrowRight size={17} /></button></div></section>}
      </main>
      {booking && <BookingModal offer={selected} onClose={() => setBooking(false)} />}
    </div>
  );
}
