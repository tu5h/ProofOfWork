import { MapPin, Lock, CheckCircle, Shield, Clock, Globe } from 'lucide-react';

export default function Features() {
    return (
        <div className="pt-24 pb-20">
            {/* Hero */}
            <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Powerful Features for Modern Businesses
                    </h1>
                    <p className="text-xl text-gray-600">
                        Everything you need to implement secure, location-based payment verification
                    </p>
                </div>
            </section>

            {/* Main Features */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-blue-100">
                            <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <MapPin className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Real-time Location Verification
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Verify user location before payment authorization with GPS and blockchain-based proof.
                                Instant verification with tamper-proof records.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-cyan-100">
                            <div className="bg-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <CheckCircle className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Custom Business Rules
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Set geo-fenced payment rules and conditions tailored to your business needs.
                                Define radius, time windows, and approval workflows.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-blue-100">
                            <div className="bg-blue-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <Lock className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Blockchain Security
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Tamper-proof verification on the Concordium network. Immutable audit trails
                                and enterprise-grade security for every transaction.
                            </p>
                        </div>
                    </div>

                    {/* Additional Features */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex gap-4">
                            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    Time-Based Rules
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Set specific time windows for when payments can be authorized
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-cyan-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    Multi-Region Support
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Operate globally with support for multiple geographic regions
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    Fraud Prevention
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Advanced algorithms detect and prevent location spoofing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
