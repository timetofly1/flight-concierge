# Flight Concierge

A premium flight search and booking assistant inspired by modern consumer travel products.

The first build target is a working MVP:

- Search flights from a dark aviation command-center workspace
- Show a live map-style route canvas with selectable fare cards
- Open itinerary details in a focused concierge panel
- Prepare the backend boundary for live flight APIs
- Add booking, payments, accounts, and AI trip planning in later phases

## Product Direction

This is not just a flight search clone. The long-term product is a lightweight travel concierge that can help users compare options, invite friends, monitor prices, and eventually book trips with less manual work.

## MVP Scope

1. Build the visual search experience
2. Use mock flight data locally
3. Add a clean API layer shaped like a real provider integration
4. Swap mock data for Duffel or another flight API later
5. Add saved trips, booking, Stripe, and AI planning after the core experience feels good

## Implemented Stack

- React
- Vite
- TypeScript
- Carefully scoped CSS
- Postgres/Supabase later for users, searches, and bookings
- Duffel later for flight search and booking
- Stripe later for payments
- OpenAI later for natural-language trip planning

## Local Development

```bash
npm install
npm run dev
```

The MVP currently runs with mock flight data. This keeps the product experience usable while the provider integrations are still being selected and credentialed.

## Current Product Surface

- Dark aviation command-center UI inspired by modern flight tracking tools
- Map-style route canvas with plane markers and route arc
- Left-side product navigation for search, trips, watchlist, concierge, payments, and settings
- Airport autocomplete
- Date, cabin, and traveler controls
- Compact search dock with airport swap
- Bottom fare rail with selectable offers
- Selected itinerary detail panel
- Fare watchlist
- Trips view
- AI concierge prompt view
- Group trip invite boundary
- Booking request modal with provider/payment handoff notes

## Development Phases

### Phase 1: Interactive Prototype

- Search shell
- Airport autocomplete
- Date picker
- Results list
- Filters and sorting
- Flight detail drawer

### Phase 2: Real Search

- Provider abstraction
- Duffel search integration
- Streaming/progressive results
- Price calendar endpoint

### Phase 3: Accounts and Trips

- User profiles
- Saved travelers
- Saved searches
- Booking history
- Trip watchlists

### Phase 4: Booking and Payments

- Stripe payment methods
- Booking confirmation flow
- Provider order creation
- Booking status tracking
- Cancellation/change support boundaries

### Phase 5: AI Concierge

- Natural-language trip requests
- Preference memory
- Price monitoring
- Group trip coordination
- Proactive recommendations
