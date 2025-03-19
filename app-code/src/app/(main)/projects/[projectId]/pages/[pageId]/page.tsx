'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Page {
  id: string;
  pageType: string;
  pageNumber: number;
  month: number | null;
  pageData: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export default function PageViewPage({ 
  params 
}: { 
  params: { projectId: string; pageId: string } 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetchPage();
    }
  }, [status, router, params.pageId]);

  const fetchPage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pages/${params.pageId}`);
      
      if (response.status === 404) {
        setError('Page not found');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }
      
      const data = await response.json();
      setPage(data);
      
      // After setting the page, initialize the canvas with the page data
      setTimeout(() => {
        if (data && canvasRef.current) {
          renderPage(data.pageData);
        }
      }, 100);
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load page. Please try again.');
      setIsLoading(false);
    }
  };

  const renderPage = (pageData: string) => {
    try {
      const parsedData = JSON.parse(pageData);
      // Here we would render using fabric.js or another canvas library
      // For now, just set a background color as a simple example
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = parsedData.settings?.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw a simple text indicator of the page type
          ctx.fillStyle = '#000000';
          ctx.font = '20px Arial';
          ctx.fillText(`${page?.pageType.toUpperCase()} PAGE`, 20, 30);
          
          if (page?.month) {
            ctx.fillText(`MONTH: ${getMonthName(page.month)}`, 20, 60);
          }
          
          ctx.fillText(`PAGE ${page?.pageNumber}`, 20, page?.month ? 90 : 60);
        }
      }
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const handleDeletePage = async () => {
    if (!page) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete page');
      }
      
      router.push(`/projects/${params.projectId}`);
    } catch (error) {
      setError('Failed to delete page. Please try again.');
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading page...</p>
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

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {page?.pageType.charAt(0).toUpperCase() + page?.pageType.slice(1)} Page {page?.pageNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {page?.month && `${getMonthName(page.month)} - `}
            Last modified: {page?.updatedAt ? new Date(page.updatedAt).toLocaleString() : 'Never'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/projects/${params.projectId}`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Back to Project
          </Link>
          <Link
            href={`/projects/${params.projectId}/pages/${params.pageId}/edit`}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Page
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={1200}
            className="border border-gray-200 bg-white shadow-sm"
          >
            Your browser does not support the canvas element.
          </canvas>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Page Information</h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {page?.pageType.charAt(0).toUpperCase() + page?.pageType.slice(1)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Page Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{page?.pageNumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Month</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {page?.month ? getMonthName(page.month) : 'None'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {page?.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">Delete Page</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this page? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePage}
                disabled={isDeleting}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 