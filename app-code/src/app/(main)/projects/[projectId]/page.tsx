'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Page {
  id: string;
  pageType: string;
  pageNumber: number;
  month: number | null;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
}

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'monthly', 'weekly', 'daily', etc.

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
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load project. Please try again.');
      setIsLoading(false);
    }
  };

  const filteredPages = () => {
    if (!project || !project.pages) return [];
    
    if (activeTab === 'all') {
      return project.pages;
    }
    
    return project.pages.filter((page) => page.pageType === activeTab);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  // Group pages by month
  const pagesByMonth = () => {
    if (!project || !project.pages) return {};
    
    const groupedPages: { [key: number]: Page[] } = {};
    
    project.pages.forEach((page) => {
      if (page.month) {
        if (!groupedPages[page.month]) {
          groupedPages[page.month] = [];
        }
        groupedPages[page.month].push(page);
      }
    });
    
    return groupedPages;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading project...</p>
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
              href="/dashboard"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Return to Dashboard
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            {project.description && <p className="mt-1 text-sm text-gray-500">{project.description}</p>}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:mt-0">
            <Link
              href={`/projects/${project.id}/edit`}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
            >
              Edit Project
            </Link>
            <Link
              href={`/projects/${project.id}/pages/new`}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Add New Page
            </Link>
            <button
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Pages
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`${
              activeTab === 'monthly'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`${
              activeTab === 'weekly'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`${
              activeTab === 'daily'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notes
          </button>
        </nav>
      </div>
      
      {project.pages && project.pages.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="rounded-lg bg-white p-12 shadow-sm border border-gray-200">
            <h3 className="text-xl font-medium text-gray-900">No pages in this project yet</h3>
            <p className="mt-2 text-gray-500">
              Start by adding your first page to your journal or planner.
            </p>
            <div className="mt-6">
              <Link
                href={`/projects/${project.id}/pages/new`}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add your first page
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPages().map((page) => (
                <Link
                  key={page.id}
                  href={`/projects/${project.id}/pages/${page.id}`}
                  className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md focus:outline-none"
                >
                  <div>
                    <span className="inline-flex rounded-lg bg-indigo-50 p-3">
                      {page.pageType === 'monthly' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {page.pageType === 'weekly' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {page.pageType === 'daily' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {page.pageType === 'notes' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </span>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1)} Page {page.pageNumber}
                      </h3>
                      {page.month && (
                        <p className="mt-1 text-sm text-gray-500">{getMonthName(page.month)}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Created: {new Date(page.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="absolute top-6 right-6 flex space-x-1">
                      <Link
                        href={`/projects/${project.id}/pages/${page.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {activeTab === 'monthly' && (
            <div className="space-y-10">
              {Object.entries(pagesByMonth()).map(([month, pages]) => (
                <div key={month} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">{getMonthName(parseInt(month))}</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pages.map((page) => (
                      <Link
                        key={page.id}
                        href={`/projects/${project.id}/pages/${page.id}`}
                        className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md focus:outline-none"
                      >
                        <div>
                          <span className="inline-flex rounded-lg bg-indigo-50 p-3">
                            {page.pageType === 'monthly' && (
                              <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            {page.pageType === 'weekly' && (
                              <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            )}
                            {page.pageType === 'daily' && (
                              <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {page.pageType === 'notes' && (
                              <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            )}
                          </span>
                          <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1)} Page {page.pageNumber}
                            </h3>
                            {page.month && (
                              <p className="mt-1 text-sm text-gray-500">{getMonthName(page.month)}</p>
                            )}
                            <p className="mt-2 text-xs text-gray-400">
                              Created: {new Date(page.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="absolute top-6 right-6 flex space-x-1">
                            <Link
                              href={`/projects/${project.id}/pages/${page.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(activeTab === 'weekly' || activeTab === 'daily' || activeTab === 'notes') && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPages().map((page) => (
                <Link
                  key={page.id}
                  href={`/projects/${project.id}/pages/${page.id}`}
                  className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md focus:outline-none"
                >
                  <div>
                    <span className="inline-flex rounded-lg bg-indigo-50 p-3">
                      {page.pageType === 'monthly' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {page.pageType === 'weekly' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {page.pageType === 'daily' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {page.pageType === 'notes' && (
                        <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </span>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1)} Page {page.pageNumber}
                      </h3>
                      {page.month && (
                        <p className="mt-1 text-sm text-gray-500">{getMonthName(page.month)}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Created: {new Date(page.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="absolute top-6 right-6 flex space-x-1">
                      <Link
                        href={`/projects/${project.id}/pages/${page.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 