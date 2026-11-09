# 도쿄 여행 · 2026.11.29–12.01

## Current sharing model
The owner explicitly requested a PUBLIC, anonymously editable shared trip prototype on 2026-10-06. All visitors read and edit the same existing D1 trip record, `tokyo-2026-11-29`. No account or ChatGPT sign-in is required after the Site audience is set to public.

The non-secret entry phrase `TOKYO1129` is a cosmetic presentation gate. It is deliberately bypassable and does not protect the API. The entry preference stores `tokyo-trip-entry:v1 = entered`, never the phrase. A separate versioned cache stores the last confirmed travel snapshot for up to seven days. “입장 화면으로” clears both the entry preference and the travel cache. No device fingerprint, account, credential, session token or device authorization is created.

Travel records remain in Cloudflare D1. Schema validation, bounded payloads, same-origin mutation checks and atomic version conflicts remain active; these do not restrict direct anonymous editing. Public warnings tell visitors not to enter sensitive information.

## Crawler preferences
- robots.txt: `User-agent: *` and `Disallow: /`
- Generic entry-page metadata, robots noindex/nofollow/noarchive
- X-Robots-Tag on dynamic HTML/API and static assets
- No trip record rendered into initial entry-screen HTML; no sitemap
These are cooperative crawler opt-out signals, not security or guaranteed bot blocking.

## Features retained
- Three dated itinerary views with live flight anchors and time sorting
- Add, edit, delete and move schedule/wishlist records without losing fields
- Original wishlist plus 27 nearby/corrected venue candidates and 11 extra recommendations; geographic walking estimates remain separately labeled
- Flight/hotel details and preparation checklist
- D1 version conflict checks and explicit confirmation before overwriting changed/deleted entities
- iPhone form-width fixes, bounded scrolling dialog and keyboard visual-viewport support
- Native iOS Google Maps place/walking/transit links with explicit HTTPS alternatives; desktop/Android HTTPS unchanged
- Airport menu with arrival/departure directions and three verified options each
- Airport bus C7 stop placement, separate C4 approach instructions, direction-specific Tokyo Station stops, T2/T3 walk and rail-transfer cautions

## Verification
The built local Worker/D1 anonymous API suite passes 19 checks: anonymous read/edit of the existing shared record, reload durability, edits, day moves, checklist/booking changes, conflict rejection, input validation, same-origin guard, delete, data restoration, account-free entry HTML and crawler signals. Entry-flag logic, Maps URL schemes/encoding, airport data, catalogue integrity, mobile structural checks, TypeScript and production build also pass.

Cloud-browser QA confirms the published café filter shows seven cards. Actual iPhone/Safari performance and native Google Maps app launch remain untested. No user computer is used.

## Development
`npm run build` creates the Worker build. `npm run db:generate` generates schema migrations. Existing production migrations are immutable. This public-entry update does not change schema, seed existing rows, reset data or create a different anonymous namespace.

Official Maps scheme reference: https://developers.google.com/maps/documentation/urls/ios-urlscheme
Recommendation and transport sources are linked in the app. Checked 2026-10-06; future travel-date operation, traffic, availability, fares and stock require reconfirmation.


## Destination audit and additional tips (2026-10-06)
- Audited original 26 map searches, all 26 saved-title variants, 11 additional destinations, the official Acne Studios linked building, the live shared record's 23 wishlist items, hotel and 10 airport route inputs
- Store identity now survives saving and title edits through an optional catalogue reference and exact-address recovery for older records; displayed user text is preserved. Address edits invalidate the fixed reference
- Place links use observed canonical Google place URLs/Place IDs. App directions use observed endpoint coordinates; web directions use exact Place IDs where available
- 38 recommendation records: 33 place pins, four explicitly labeled building pins (two DSM brands, Kimuraya 2F and Acne Mitsukoshi), one withheld Monkichi main-branch link because map/official branch details conflict. Monkichi links to the official branch page and has no automatic route
- Fixed actual T3 airport-terminal building vs bus stop, the real Ginza airport-bus stop vs unresolvable C7 query, Nihombashi arrival bus stop vs Nihombashi subway station, and direction-specific Tokyo bus terminals
- Hotels are pinned only when both known name and known address match; custom locations are clearly search/unverified
- Six additional dining venues and five shopping destinations have collapsible reservation/visit notes. Tax/refund guidance applies to the 2026-11-01 regime: gross payment, export confirmation before checked baggage, then seller refund. Discounts and fees are qualified and sourced
- Source checks cover all 38 targets, 23 live records and ten airport routes. TypeScript, build, public-entry, Maps/airport/catalogue/mobile and anonymous CRUD tests pass
- LIMIT: repeated browser security-check availability errors prevented opening the corrected URLs again. The corrected destinations are cross-checked against earlier actual Google Maps observations; post-fix routed UI and native iOS app execution are not claimed as runtime-verified
- Public entry, remembered browser flag, crawler opt-outs, D1 row/key and access policy remain unchanged

## Faster repeat viewing
The Planner shows a schema-checked, size-bounded browser snapshot while its authoritative GET is pending. A visible timestamp and cached/read-only label distinguish it from fresh data. All mutation controls and their handlers remain locked until that GET succeeds. No offline edits are queued or sent; the accepted server version and full server document always replace the cached preview before editing. Existing CAS and changed-entity confirmation remain active. Only accepted GET/PUT responses populate the cache; errors retain the previous preview for reading, reset/unmount ignore late responses, and storage failures do not affect D1 saving.

Unit and DOM tests cover corrupt/oversized/expired cache, blocked storage, cache-first rendering with an unresolved GET, offline retry, a higher cached version yielding to the server, co-editor conflicts with preserved drafts and unrelated edits, and reset during loading. This improves repeat viewing only; it does not remove first-visit or hosting/network latency and does not provide a full offline app.

## App code updates
The normal build command generates one public build identifier shared by the browser bundle and `/api/version`. HTML and the version response use `Cache-Control: no-store`. The app checks on mount and foreground/pageshow/focus, coalesces rapid events, and checks every five minutes only while visible. This is app-code detection, not a trip-data polling service.

A newer build reloads the document only when no editor, checklist draft or save is active. Checks do not reset the travel cache or D1. Open drafts show a pending update notice and resume once saved or cancelled. Session-scoped attempt timestamps and a five-minute cooldown prevent reload loops, including alternating version responses; unavailable session storage falls back to an explicit update button. Offline/invalid responses never trigger an update. The More page and footer include a manual update check.

Versions from before this feature need one ordinary document refresh to receive it. Future UI/code updates do not require adding the home-screen shortcut again; installed icon bitmap refresh is still controlled by the operating system. No service worker was added. The two public-sharing/map-help banners were removed at the owner's request; entry-screen public-access disclosure and the map fallback buttons remain.

## Compact travel UI and safe areas
Removed decorative English section overlines, repeated instructions and duplicate phrase counts while preserving dates, user notes, uncertainty, closure/payment warnings and error/update states. Map identity and walking methodology are in expandable per-place details; unverified/building-only locations remain labeled in the summary. Airport fares/steps/cautions stay visible, with source links grouped in details. The recommendation origin still explicitly names Hotel Monterey Ginza.

Mobile titles/actions use aligned spacing. The viewport uses cover with an opaque header and safe-area top spacing; standalone mode gets8px extra clearance. Long edit dialogs exclude top/bottom safe areas in their visual-viewport bounds, including keyboard offsets. Narrow Chrome rendering can check layout, but actual iPhone status-bar blur needs device confirmation.

## Place readability and detail return
Place cards now use concise introductions and labeled distance/payment/caution rows with stronger contrast. Full descriptions, addresses, verification notes and source links remain in details. Only an exact auto-generated `사진 위시리스트` note is hidden in cards; combined or user-authored notes and all D1 records remain unchanged. Header branding uses the selected coral suitcase. The More menu separates update settings with a24px gap, and the checklist input uses16px text on phones.

The official merchant-association main-store page supplies Monkichi's restored Google CID link. It remains an official-linked map of the nearby main/new-store area, not a verified individual entrance or route. The card tells visitors to check the main-store sign/phone03-3531-2380. No unverified automatic walking route was added, and payment/hours records were not changed by this map repair.

A left-edge horizontal swipe returns from weather/More detail pages to their origin, date and scroll. Root tab choices reset the app-only stack. Japanese full-screen cards use the same gesture for their existing close action. Interactive controls, vertical/multitouch/short gestures, open editors, active composition and saving are guarded; checklist text survives a return and reentry. There is no new Back button or use of browser history navigation. Native Safari gesture arbitration remains a physical-device validation limit.

## Shared shopping list and purchase references (2026-10-07)
The fourth phone tab is Shopping; all34 Japanese phrases remain in More. Shopping rows contain a stable ID, free-text store, item and purchased checkbox. The optional `shopping` array defaults to an empty UI for old records and stays in the same D1 trip document. Old-client PUTs omitting it preserve the array from the exact expected version before the atomic CAS update. Drafts survive tab changes and conflict reloads, and prevent app-code reloads. A retained attempt ID avoids duplicate additions after a saved response is lost, including the200-item limit.

The two added product/brand wishes retain their names, notes and independent hearts. Static, source-linked purchase references show MUJI Ginza (reused), Donki Ginza main and LUSH Yurakucho Marui as unselected branch candidates. Each has travel-date hours, qualified payment and map information. Donki uses its official linked Google CID without an invented route; LUSH uses a clearly labeled Marui building coordinate, not an independent store entrance. No production trip records are migrated or overwritten by catalog enrichment.

## Routed itinerary and schedule membership (2026-10-15)
- Place cards retain dated saved venues and show independent all/included/excluded filters alongside source, category, search and hearts. Membership derives from exact saved identity or explicitly selected branch, not an incidental generic wish alias. Unselected purchase candidates do not count as visits. No schema, auth, sharing, D1 key or cache changes.
- The requested plan preserves all original wishes, notes, shopping items and travel details, with optional clustered shopping rather than separate simultaneous reservations. New saved branches retain official address, hours, payment uncertainty and reservation caveats. No restaurant or rail booking was made. Disneyland was excluded.
- Return plan: hotel luggage11:30, taxi11:45, Tokyo Station12:00, N’EX25 12:33 to T2/3station13:23 and T3around13:45; N’EX27 13:03 backup. Four-hour arrival allowance is a voluntary plan, not an official requirement or guarantee. Refund export confirmation precedes checked baggage and security. Airport/tax panels use the same plan and official sources.
- New unit/DOM tests cover identity isolation, day membership, combined filters, original-data preservation, full planned snapshot rendering and airport timing. Source/HTML structural checks do not claim real iPhone gesture or native Maps validation.

## Longer evenings and one-way day-two route (2026-10-15 follow-up)
The requested revision removes hotel rest (15-minute check-in only), moves LUSH and liquor shopping into the Ginza retail loop, adds a light Ginten izakaya finish and a 22:35 hotel return. Day two follows Harajuku/Cat Street → PARCO PORTER → Scramble Square → Roppongi → Tokyo Tower → Ginza, with a 22:15 return target. All times are plans rather than bookings; no tickets, meals or trains were purchased. Existing store branches and user records remain intact. Day-three airport entries and all shopping/favorites/flight/hotel data are byte-for-byte preserved in the planned data update. New catalog records retain sourced hours and explicit uncertainty rather than invented Google ratings or map pins.

### 2026-10-15 Visit Japan beginner guide
- Added a lazy-loaded, read-only `더보기 → 비짓재팬 등록 안내` screen with ten detailed disclosure steps, official Korean/start links, public hotel-field copying and transient reading checks.
- The guide never collects passport, birth date, credentials, declaration answers or QR data. Reading checks do not indicate registration completion. Clipboard failures provide a manual-copy fallback.
- Official guidance and manuals inform the text; authenticated current VJW screens were not verified. The registration app returned 404 in the research browser, so the official Korean information page is the primary entry and direct login remains a secondary link. Standard external links cannot force Safari over the user's browser settings.
- DOM QA covers repeated entry/back/disclosure interactions, clipboard success/failure, reading checks, airport navigation and zero shared-trip writes; narrow-width layout is structurally tested, not a physical iPhone/Safari validation.
- Follow-up itinerary revision uses sushi on the final lunch, Ginza wagyu/whisky bar on day 1, and Human Made → Danton → Moheji → KALDI → PARCO → mont-bell → MeatMan → Akabanebashi photo point → Tokyo Tower on day 2. Original wishes/notes and inactive venue candidates are preserved in shared data.
- Return airport guidance now targets hotel 13:15, Tokyo N’EX31 14:03, T2/3 station 14:54, T3 about 15:15 (three hours before departure). The earlier N’EX29 option explicitly requires lunch by noon or skipping it.
- Scheduled food/bar cards show structured reservation-policy and card-payment facts. They do not claim available seats, completed bookings or that a card guarantee proves in-store acceptance. The bookings screen summarizes the six selected restaurants/bars.
- Fourteen verified/transit or estimated/walking route descriptions have mode-specific directions links. Bound title/place/day/time/duration checks hide stale instructions if a user edits those fields.

### 2026-10-15 Ichiran follow-up
The existing generic Ichiran wish is assigned to Harajuku on day 2 at 09:30, preserving its ID/title/original note. Pain Maison becomes 08:30–08:45 takeaway for later, with 08:45 transit to Meiji-jingumae exit 7. The 11:00 Human Made and later required meals/shops remain unchanged. Harajuku-specific official hours, card support and morning walk-in policy are separate from the preserved Shimbashi candidate. Source/DOM tests verify correct branch/map/exit, four changed records only, all IDs and nonitinerary data retained, and no planned overlaps; actual queuing and travel time remain uncertain.
