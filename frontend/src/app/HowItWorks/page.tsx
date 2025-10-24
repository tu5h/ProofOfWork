export default function HowItWorks() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h1>
          <p className="text-xl text-gray-600">
            Simple, secure, and seamless verification in three steps
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300"></div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  User Requests Payment/Service
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Customer initiates a transaction or requests a service that requires location verification
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-gradient-to-br from-cyan-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Location Verified via Blockchain
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Real-time GPS data is verified and recorded on the Concordium blockchain
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Payment Authorized and Auto-Released
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Based on your custom rules, the payment or service is automatically authorized
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Built on Concordium Blockchain
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Immutable Records</h4>
                <p className="text-gray-600">
                  Every location verification is permanently recorded on the blockchain, creating an unchangeable audit trail.
                </p>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Decentralized Trust</h4>
                <p className="text-gray-600">
                  No single point of failure. Verification happens across a distributed network of nodes.
                </p>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy-Preserving</h4>
                <p className="text-gray-600">
                  Location data is cryptographically secured and only accessible to authorized parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
