'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 h-full w-full" aria-hidden="true">
          <div className="relative h-full">
            <svg
              className="absolute right-full translate-y-1/3 translate-x-1/4 transform sm:translate-x-1/2 md:translate-y-1/2 lg:translate-x-full"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="e229dbec-10e9-49ee-8ec3-0286ca089edf"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#e229dbec-10e9-49ee-8ec3-0286ca089edf)" />
            </svg>
            <svg
              className="absolute left-full -translate-y-3/4 -translate-x-1/4 transform sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="d2a68204-c383-44b1-b99f-42ccff4e5365"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#d2a68204-c383-44b1-b99f-42ccff4e5365)" />
            </svg>
          </div>
        </div>

        <div className="relative pt-6 pb-16 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav className="relative flex items-center justify-between sm:h-10 md:justify-center" aria-label="Global">
              <div className="flex flex-1 items-center md:absolute md:inset-y-0 md:left-0">
                <div className="flex w-full items-center justify-between md:w-auto">
                  <span className="text-2xl font-bold text-indigo-600">TaPiff</span>
                </div>
              </div>
              <div className="hidden md:absolute md:inset-y-0 md:right-0 md:flex md:items-center md:justify-end">
                <Link href="/login" className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200">
                  Log in
                </Link>
              </div>
            </nav>
          </div>

          <div className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Create Beautiful</span>
                <span className="block text-indigo-600">Digital Journals & Planners</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                Design and customize your own journal or planner with our intuitive tools, then export as a PDF to print or use digitally.
              </p>
              <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
                  >
                    Get started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex flex-col" aria-hidden="true">
            <div className="flex-1" />
            <div className="flex-1 w-full bg-gray-800" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative rounded-lg shadow-lg">
              <div className="relative overflow-hidden rounded-lg bg-indigo-500 px-6 py-8 shadow-xl sm:px-12 sm:py-16">
                <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
                  <svg
                    className="absolute inset-0 h-full w-full"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 1463 360"
                  >
                    <path
                      className="text-indigo-400 text-opacity-40"
                      fill="currentColor"
                      d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
                    />
                    <path
                      className="text-indigo-600 text-opacity-40"
                      fill="currentColor"
                      d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
                    />
                  </svg>
                </div>
                <div className="relative">
                  <div className="sm:text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Ready to create your custom journal?
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-lg text-indigo-100">
                      Join thousands of users who are designing beautiful journals and planners that perfectly fit their style and needs.
                    </p>
                  </div>
                  <div className="mt-8 sm:mx-auto sm:max-w-lg sm:text-center">
                    <div className="mt-4">
                      <Link
                        href="/register"
                        className="block w-full rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 shadow hover:bg-indigo-50 sm:px-10"
                      >
                        Create free account
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800">
          <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-white text-lg font-bold">Premium Quality</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-white text-lg font-bold">Highly Customizable</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-white text-lg font-bold">PDF Export</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-white text-lg font-bold">Beautiful Templates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
