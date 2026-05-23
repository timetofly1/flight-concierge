export type Cabin = "economy" | "premium" | "business";
export type SortMode = "best" | "cheapest" | "fastest";
export type StopFilter = "any" | "nonstop" | "one";
export type AppView = "search" | "trips" | "watchlist" | "concierge";

export type Airport = {
  code: string;
  city: string;
  name: string;
  region: string;
};

export type Segment = {
  from: string;
  to: string;
  depart: string;
  arrive: string;
  flight: string;
};

export type FlightOffer = {
  id: string;
  airline: string;
  airlineCode: string;
  accent: string;
  price: number;
  previousPrice: number;
  currency: string;
  departTime: string;
  arriveTime: string;
  durationMinutes: number;
  stops: number;
  stopLabel: string;
  route: string;
  confidence: number;
  baggage: string;
  carbon: string;
  fareType: string;
  changePolicy: string;
  tags: string[];
  segments: Segment[];
};

export type SearchState = {
  origin: Airport;
  destination: Airport;
  departDate: string;
  returnDate: string;
  cabin: Cabin;
  travelers: number;
};
