# Loading performance

Live measurements during the investigation (Render Free, Oregon; one local
Chrome run, not a load test) showed a warm homepage document at about 300–400 ms,
first content at 1.08 s, and largest content at 1.92 s. Some catalog API calls took
1.5–3.2 s. Google's company list took 6.7 s and returned 748 questions / roughly
1 MB of uncompressed JSON. Network and shared-instance timings vary.

## Changes

- Question pages request `/api/progress?summary=true`: IDs and notes, without
  populating every solved/bookmarked question and its related documents.
- Saving the last visited question happens in the background; it cannot hold up
  the question view or turn a history-write failure into “Question not found.”
- Company lists render 40 rows at a time while preserving URL filters and page.
  The API still returns the full company question list for client-side filtering.
- Independent topic/dashboard queries run concurrently. Topic flags reuse the
  progress query instead of fetching it twice. Read-only company/sheet/question
  queries use lean results to avoid Mongoose document hydration.
- Four shared catalog summaries use a 30-second, process-local cache with
  coalesced concurrent loads. Successful catalog/admin writes invalidate it,
  including in-flight loads. Auth, notes, solved flags, and bookmarks are never
  stored in that cache. External imports can take up to 30 seconds to appear.
- Fingerprinted Vite assets have one-year immutable browser caching; local logos
  have one-day caching. HTML remains revalidatable so deployments get fresh URLs.
- Google's authentication script loads on login/signup, not every route.

## Hosting limit

[Render Free](https://render.com/docs/free) sleeps after 15 minutes without
inbound traffic and can take about a minute to wake. The frontend and backend
currently share that service, so code optimizations do not remove this delay.
An always-on service removes idle sleep; a separate static frontend can display
the page immediately but its free backend can still sleep. No hosting plan or
region was changed by this update.

## Validation

Browser tests cover delayed/failed history writes, summary progress, company
pagination, existing list return positions, themes, and mobile layout. Backend
tests cover cache coalescing/expiry/invalidation, static cache headers, and real
MongoDB isolation of per-user progress from shared catalog summaries.
