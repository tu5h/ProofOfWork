'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  {/* Button Code */}
  
  const router = useRouter();
  
  const handleClick = (): void => {
    router.push("/login");
  }

  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">ProofOfWork</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/Features"
            className={`transition-colors ${isActive('/Features') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Features
          </Link>
          <Link
            href="/HowItWorks"
            className={`transition-colors ${isActive('/HowItWorks') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            How It Works
          </Link>
          <Link
            href="/UseCases"
            className={`transition-colors ${isActive('/UseCases') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Use Cases
          </Link>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium" onClick={handleClick}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
