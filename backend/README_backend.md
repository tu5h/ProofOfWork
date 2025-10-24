Smart Contract / Backend

Job creation with:

business ID (Concordium-verified)

worker ID (Concordium-verified)

coordinates + radius

payment amount (PLT)

When both IDs are verified and the worker’s reported location is within range → payment is released automatically from escrow.

Can simulate this logic in JavaScript + Concordium SDK or CLI, or make a mock payment if the full contract integration is too slow to build

-----

Blockchain Integration

Using Concordium features:

Identity layer:
Both business and worker must have a verified Concordium ID.
for demo we can use sample testnet accounts.

PLT stablecoin:
Payment simulation in Concordium testnet
Even a mocked “PLT transaction successful” message is fine for the demo, as long as we show the workflow clearly.