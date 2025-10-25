'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/dashboard/personal");
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Set dashboard path based on account type
      if (user) {
        const accountType = user.user_metadata?.account_type || "personal";
        setDashboardPath(`/dashboard/${accountType}`);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const accountType = session.user.user_metadata?.account_type || "personal";
        setDashboardPath(`/dashboard/${accountType}`);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 200); // 200ms delay before closing
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    router.push('/');
    router.refresh();
  };

  const handleGetStarted = (): void => {
    setOpen(false);
    router.push("/login");
  };

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
            href="/home/features"
            className={`text-lg transition-colors ${isActive('/home/features') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Features
          </Link>
          <Link
            href="/home/howitworks"
            className={`text-lg transition-colors ${isActive('/home/howitworks') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            How It Works
          </Link>
          <Link
            href="/home/usecases"
            className={`text-lg transition-colors ${isActive('/home/usecases') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Use Cases
          </Link>

          {user ? (
            // Logged in - show profile dropdown
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Profile menu"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown menu with padding bridge */}
              {showDropdown && (
                <div className="absolute right-0 pt-2 z-50">
                  {/* Invisible bridge to prevent gap issues */}
                  <div className="h-2 w-full" />
                  
                  <div className="w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                    <Link
                      href={dashboardPath}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show Get Started button
            <button
              className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          )}
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
        className={`md:hidden fixed inset-x-0 top-16 bg-white border-t border-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden z-40
          ${open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="px-6 pt-6 pb-5 flex flex-col gap-6 max-h-[calc(100vh-4rem)] overflow-auto">
          <Link
            href="/home/features"
            className={`text-2xl font-semibold py-1 transition-colors ${isActive('/home/features') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
            onClick={() => setOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/home/howitworks"
            className={`text-2xl font-semibold py-1 transition-colors ${isActive('/home/howitworks') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
            onClick={() => setOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/home/usecases"
            className={`text-2xl font-semibold py-1 transition-colors ${isActive('/home/usecases') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
            onClick={() => setOpen(false)}
          >
            Use Cases
          </Link>

          <div className="border-t border-gray-100 my-1" />

          {user ? (
            // Logged in - show dashboard and logout
            <>
              <Link
                href={dashboardPath}
                className="flex items-center gap-3 text-2xl font-semibold py-1 text-gray-700 hover:text-gray-900"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard className="w-6 h-6" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 text-2xl font-semibold py-1 text-red-600 hover:text-red-700 text-left"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>
            </>
          ) : (
            // Not logged in - show Get Started
            <button
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm focus:outline-none"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}