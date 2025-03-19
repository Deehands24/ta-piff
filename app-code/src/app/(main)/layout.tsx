'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'My Projects', href: '/projects', current: pathname.startsWith('/projects') && pathname !== '/projects/new' },
    { name: 'Templates', href: '/templates', current: pathname.startsWith('/templates') },
    { name: 'Settings', href: '/settings', current: pathname === '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-600 pb-32">
        <nav className="bg-indigo-600 border-b border-indigo-500 border-opacity-25 lg:border-none">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="relative h-16 flex items-center justify-between lg:border-b lg:border-indigo-500 lg:border-opacity-25">
              <div className="px-2 flex items-center lg:px-0">
                <div className="flex-shrink-0">
                  <Link href="/dashboard" className="text-white font-bold text-xl">
                    TaPiff
                  </Link>
                </div>
                <div className="hidden lg:block lg:ml-10">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          item.current
                            ? 'bg-indigo-700 text-white'
                            : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'
                        } rounded-md py-2 px-3 text-sm font-medium`}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="bg-indigo-600 p-2 rounded-md inline-flex items-center justify-center text-indigo-200 hover:text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="hidden lg:block lg:ml-4">
                <div className="flex items-center">
                  <div className="ml-3 relative flex-shrink-0">
                    <div>
                      <button
                        type="button"
                        className="bg-indigo-600 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-medium">
                          {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                        </div>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ml-3 bg-indigo-600 flex items-center text-sm text-white rounded-md px-3 py-1 hover:bg-indigo-500"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-indigo-700 text-white'
                        : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'
                    } block rounded-md py-2 px-3 text-base font-medium`}
                    aria-current={item.current ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-white block rounded-md py-2 px-3 text-base font-medium hover:bg-indigo-500 hover:bg-opacity-75"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main className="-mt-32">
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            {status === 'loading' ? (
              <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 