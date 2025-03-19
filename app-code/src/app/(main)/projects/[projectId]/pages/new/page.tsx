'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  pages?: Array<{ id: string; pageNumber: number }>;
}

export default function NewPagePage({ params }: { params: { projectId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageType, setPageType] = useState('notes'); // Default to notes page
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetchProject();
    }
  }, [status, router, params.projectId]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${params.projectId}`);
      
      if (response.status === 404) {
        setError('Project not found');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data);
      
      // Get the highest page number from existing pages (if any)
      if (data.pages && data.pages.length > 0) {
        const highestPageNumber = Math.max(...data.pages.map((page: any) => page.pageNumber));
        setPageNumber(highestPageNumber + 1);
      }
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load project. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pageType) {
      setError('Page type is required');
      return;
    }

    // Create empty page data template based on the type
    const pageDataTemplate = {
      type: pageType,
      content: {},
      settings: {
        backgroundColor: "#ffffff",
      },
      objects: [],
    };

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: params.projectId,
          pageType,
          pageData: JSON.stringify(pageDataTemplate),
          month,
          pageNumber,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create page');
      }

      const page = await response.json();
      router.push(`/projects/${params.projectId}/pages/${page.id}/edit`);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">{error}</p>
          <div className="mt-4">
            <Link
              href={`/projects/${params.projectId}`}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Return to Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add New Page to {project.title}</h1>
          <Link
            href={`/projects/${params.projectId}`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="pageType" className="block text-sm font-medium text-gray-700">
                  Page Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="pageType"
                  name="pageType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="notes">Notes</option>
                  <option value="habit">Habit Tracker</option>
                  <option value="goal">Goal Setting</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  id="month"
                  name="month"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  <option value="">Select a month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div>
                <label htmlFor="pageNumber" className="block text-sm font-medium text-gray-700">
                  Page Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="pageNumber"
                  id="pageNumber"
                  min="1"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <Link
                    href={`/projects/${params.projectId}`}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create and Edit Page
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 