Frontend (Demo App)

web interface

“Business Dashboard” → create a job with a target location + radius.
“Worker App” → shows assigned job + button to “Confirm Task Done.”

When a worker presses “Confirm Done”, the app then:

Gets the user’s geolocation (via browser API or phone)

Compares with the business’s location rule.

If valid, it triggers a payment release via Concordium (PLT tokens).

Let's build this with React and Next.js---
