# Application flow

[Back to README](../README.md) · [High-level design](HLD.md) · [Deployment guide](../DEPLOYMENT.md)

Visitors can browse the catalog without signing in. A verified session is required
to save personal progress, use account pages, or open the admin dashboard. This
diagram follows the implemented routes and services.

```mermaid
flowchart TD
    Start([Open DSA Roadmap]) --> Browse["Browse landing page, roadmap,<br/>companies and practice sheets"]
    Browse --> Action{"What do you want to do?"}
    Action -->|Browse questions| Catalog["View topics, questions and resources"]
    Catalog --> Practice["Open LeetCode, GeeksforGeeks<br/>or another study resource"]
    Action -->|Save progress or open account| Session{"Valid verified session?"}
    Session -->|No| SignIn{"Choose sign-in method"}
    SignIn -->|New email account| Register["Register and receive an email code"]
    Register --> Verify["Verify the single-use email code"]
    SignIn -->|Existing email account| Password["Validate email and password"]
    SignIn -->|Google| Google["Validate Google credential<br/>and verified email on the server"]
    Verify --> Token["Issue session JWT<br/>and return account details"]
    Password --> Token
    Google --> Token
    Token --> Workspace["Dashboard and personal workspace"]
    Session -->|Yes| Workspace
    Workspace --> Save["Mark solved, bookmark,<br/>save notes or last visited question"]
    Save --> Guard["API checks session, account<br/>and request limits"]
    Guard --> Update["Update the user's Progress document<br/>with a version check"]
    Update --> Conflict{"Concurrent write conflict?"}
    Conflict -->|Yes, attempts remain| Retry["Read latest progress<br/>and recompute the change"]
    Retry --> Update
    Conflict -->|Retry limit reached| Error["Return 409<br/>and ask the user to retry"]
    Conflict -->|No| Refresh["Return saved progress<br/>and refresh relevant UI state"]
    Refresh --> Workspace
    Workspace --> Account["Profile, settings<br/>and progress export"]
    Workspace --> Owner{"Verified owner email?"}
    Owner -->|Yes| Admin["Admin dashboard:<br/>manage catalog and users"]
    Owner -->|No| Denied["Admin API access denied"]

    classDef entry fill:#ecfdf5,stroke:#059669,color:#064e3b;
    classDef process fill:#eff6ff,stroke:#2563eb,color:#172554;
    classDef decision fill:#fffbeb,stroke:#d97706,color:#78350f;
    classDef failure fill:#fff1f2,stroke:#e11d48,color:#881337;
    class Start,Workspace,Refresh,Admin entry;
    class Browse,Catalog,Practice,Register,Verify,Password,Google,Token,Save,Guard,Update,Retry,Account process;
    class Action,Session,SignIn,Conflict,Owner decision;
    class Error,Denied failure;
```

## What happens behind each step

| Step | Actual behavior |
| --- | --- |
| Public browsing | Optional authentication adds the current user's solved/bookmarked flags. Guests see the catalog without personal progress. |
| Sign-in | Email/password requires an already verified account. Registration verifies an emailed code first. Google credentials are validated server-side. Invalid credentials or codes do not issue a session. |
| Session validation | The browser sends a bearer JWT. The API checks its signature, session purpose, current account, verification state and token version. |
| Practice | External platforms provide the problem or study material. This app does not execute submissions or automatically import LeetCode acceptance results; users mark completion themselves. |
| Progress save | One unique Progress document belongs to each user. Concurrent creation uses an upsert; conflicting saves retry from fresh state, up to five save attempts. Solved IDs, difficulty counters and activity are saved together. |
| UI refresh | Solved/bookmark changes invalidate progress and dashboard caches and emit `progress:updated`. Mounted listeners reload their data. Notes and last-visited updates invalidate the progress cache. This is request/event-driven, not WebSocket synchronization. |
| Roadmap percentages | Topic totals and the user's solved question IDs determine progress. A guest or a user with no solved questions does not receive simulated progress. |
| Admin access | Only the verified `sainkygurjar12@gmail.com` account is authorized. The API enforces this even if a client or another account claims an admin role. |
| Failures | Protected requests without a valid session return 401; forbidden admin access returns 403; exhausted progress retries return 409; rate limits return 429. Authentication database failures return 503. |

Password recovery uses a separate path: request reset code → verify the code →
receive a short-lived, single-use reset token → set a new password → sign in again.
Reset tokens cannot authenticate normal API requests. Password changes and resets
invalidate existing sessions through the account's token version.

## Code references

- [Page routes](../client/src/routes/AppRoutes.jsx) and [API client](../client/src/services/api.js)
- [Authentication](../server/src/services/auth.service.js) and [session checks](../server/src/middleware/auth.middleware.js)
- [Progress service](../server/src/services/progress.service.js) and [conflict handling](../server/src/utils/progressMutation.js)
- [Client progress refresh](../client/src/services/progressService.js) and [landing progress](../client/src/hooks/useLandingProgress.js)
- [Owner policy](../server/src/config/admin.js)
