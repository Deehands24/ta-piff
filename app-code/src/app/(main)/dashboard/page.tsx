'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Page {
  id: string;
  pageType: string;
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      
      // Sort projects by updatedAt in descending order (most recent first)
      const sortedProjects = [...data].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setProjects(sortedProjects);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load projects. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your journals and planners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">{error}</p>
          <button 
            onClick={fetchProjects} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Journals & Planners</h1>
          <Link 
            href="/projects/new" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="rounded-lg bg-white p-12 shadow-lg">
              <h3 className="text-xl font-medium text-gray-900">No journals or planners yet</h3>
              <p className="mt-2 text-gray-500">
                Get started by creating your first journal or planner.
              </p>
              <div className="mt-6">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create your first journal
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="block transition-all hover:shadow-lg"
              >
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {project.coverImage ? (
                      <img 
                        src={project.coverImage} 
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-100">
                        <span className="text-xl text-indigo-500 font-medium">{project.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-indigo-600 text-white text-xs rounded-full px-2 py-1">
                      {project.pages?.length || 0} pages
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{project.title}</h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    )}
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        {new Date(project.updatedAt).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? 'Today' 
                          : new Date(project.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                            ? 'This week'
                            : 'Older'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 