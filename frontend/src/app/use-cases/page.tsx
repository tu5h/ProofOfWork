import { Truck, Users, Calendar, Navigation } from 'lucide-react';

export default function UseCases() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Built for Your Industry
          </h1>
          <p className="text-xl text-gray-600">
            Trusted by businesses across multiple sectors
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all border border-blue-100">
              <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Logistics & Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Verify delivery completion and authorize payments at exact delivery locations. Reduce disputes and ensure drivers are where they claim to be.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Proof of delivery location</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Automatic payment release</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Reduce fraudulent delivery claims</span>
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-cyan-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all border border-cyan-100">
              <div className="bg-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Gig Economy & Field Services
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Confirm on-site presence before releasing payments to contractors and workers. Perfect for home services, repairs, and maintenance.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Verify worker arrival at job site</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Time-tracking with location proof</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Automated milestone payments</span>
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all border border-blue-100">
              <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Events & Ticketing
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Prevent ticket fraud by verifying attendee location at venue entry points. Eliminate scalping and unauthorized resales.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Geo-fenced ticket validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Prevent remote check-ins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Real-time attendance verification</span>
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-cyan-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all border border-cyan-100">
              <div className="bg-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ride-sharing & Local Services
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Ensure service providers are at correct locations before payment processing. Build trust between customers and service providers.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Pickup/dropoff verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Route validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Service area enforcement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
