"use client";

import { Shield, MapPin, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter }from 'next/navigation';
import React from "react";

export default function Home() {
  {/* Button Code */}

  const router = useRouter();

  const handleClick = (): void => {
    router.push("/login");
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Lock className="w-4 h-4" />
                Powered by Concordium Blockchain
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Verify Location.<br />
                Authorize Payment.<br />
                <span className="text-blue-600">Prevent Fraud.</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Secure geo-location verification for businesses using blockchain technology.
                Ensure payments happen only where they should.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" onClick={handleClick}>
                  Get Started
                </button>
              <Link href="/home/demovideo">
                  <button className="bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg border-2 border-gray-200 flex items-center justify-center gap-2 w-full">
                    <PlayCircle className="w-5 h-5" />
                    Watch Demo
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-12 shadow-2xl">
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                  <MapPin className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                  <Shield className="w-12 h-12 text-cyan-600" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-lg font-medium">Location Verified</span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-lg font-medium">Payment Authorized</span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex items-center gap-3 text-white">
                      <Lock className="w-6 h-6" />
                      <span className="text-lg font-medium">Blockchain Secured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ProofOfWork?
            </h2>
            <p className="text-xl text-gray-600">
              Enterprise-grade security meets simple implementation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Real-time Verification
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Instant location verification with GPS and blockchain-based proof.
              </p>
              <Link href="/home/features" className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
              <div className="bg-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Custom Rules
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Set geo-fenced payment rules tailored to your business needs.
              </p>
              <Link href="/home/features" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Learn more →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <div className="bg-blue-700 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Blockchain Security
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Tamper-proof verification on the Concordium network.
              </p>
              <Link href="/home/features" className="text-blue-600 hover:text-blue-700 font-medium">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Secure Your Payments?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join businesses worldwide using ProofOfWork to prevent fraud and verify locations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg shadow-xl" onClick={handleClick}>
              Get Started Today
            </button>
            <Link href="/home/demovideo">
              <button className="bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-800 transition-all font-semibold text-lg border-2 border-white/20 flex items-center justify-center gap-2 w-full">
                <PlayCircle className="w-5 h-5" />
                Watch Demo Video
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
