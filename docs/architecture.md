# Architecture Notes

## App Surfaces

- Home/search screen
- Flight results screen
- Flight detail drawer
- Filters: stops, time, cabin, sort
- Traveler/friend selector
- Account dashboard
- Booking confirmation flow
- Mobile install/PWA prompt

## Data Model Draft

### User

- id
- name
- email or phone
- preferred currency
- preferred cabin
- home airport

### Search

- id
- user_id
- origin
- destination
- departure_date
- return_date
- cabin
- passengers
- created_at

### Flight Offer

- id
- provider
- provider_offer_id
- total_amount
- currency
- expires_at
- raw_payload

### Booking

- id
- user_id
- provider
- provider_booking_id
- status
- summary
- created_at

## API Shape

```txt
GET  /api/places?q=
POST /api/search
GET  /api/search/stream
GET  /api/offers/:id
POST /api/book
GET  /api/bookings
GET  /api/price-calendar
```

## Provider Strategy

Start with a mock provider so the product experience can be designed quickly.

Then add a provider adapter:

```txt
FlightProvider
  searchOffers(input)
  getOffer(id)
  createBooking(input)
  getSeatMaps(offerId)
```

This keeps the UI from being tightly coupled to Duffel, Amadeus, or any single travel API.

## Current MVP Implementation

The repo now uses a Vite React frontend with local mock data:

```txt
src/App.tsx       Product UI, state, and workflow composition
src/data.ts      Mock airports, price calendar, flight offers, saved trips
src/types.ts     Shared product/domain types
src/styles.css   Full responsive design system
```

The UI intentionally mirrors the eventual provider boundary:

- Search state is structured like an API request
- Offers use provider-style IDs and itinerary segments
- Booking request flow stops before payment/order creation
- Watchlist and trips views are ready for persistence

## Key Risks

- Flight prices expire quickly
- Booking requires idempotency to avoid duplicate charges/orders
- Payment confirmation can require additional authentication
- Airline rules vary by route, fare, and provider
- Refunds, cancellations, and changes are operationally complex

## Practical First Build

The first version should optimize for speed and product feel:

- Mock data
- Realistic interaction patterns
- Beautiful responsive UI
- Clear API boundaries
- No real payment or booking until the search UX is strong
