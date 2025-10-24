'use client';

import React, { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  {/* Button Code */ }
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleClick = (): void => {
    setOpen(false);
    router.push("/login");
  }

  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">ProofOfWork</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className={`text-lg transition-colors ${isActive('/features') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Features
          </Link>
          <Link
            href="/howitworks"
            className={`text-lg transition-colors ${isActive('/howitworks') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            How It Works
          </Link>
          <Link
            href="/usecases"
            className={`text-lg transition-colors ${isActive('/usecases') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Use Cases
          </Link>

          <button
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            onClick={handleClick}
          >
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sliding panel */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 h-[50vh] max-h-[40vh] bg-white border-t border-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden z-40
          ${open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="px-6 pt-6 pb-5 flex flex-col gap-6 overflow-auto h-full">
          <Link
            href="/features"
            className={`text-2xl font-semibold py-1 transition-colors ${isActive('/features') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
            onClick={() => setOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/howitworks"
            className={`text-2xl font-semibold py-1 transition-colors ${isActive('/howitworks') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
            onClick={() => setOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/usecases"
            className={`text-2xl font-semibold py-1 transition-colors ${isActive('/usecases') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
            onClick={() => setOpen(false)}
          >
            Use Cases
          </Link>

          {/* subtle divider for visual separation */}
          <div className="border-t border-gray-100 my-1" />

          <button
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm focus:outline-none"
            onClick={() => { handleClick(); }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
