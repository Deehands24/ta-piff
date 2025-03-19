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

export default function PageEditorPage({ 
  params 
}: { 
  params: { projectId: string; pageId: string } 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
          initializeCanvas(data.pageData);
        }
      }, 100);
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load page. Please try again.');
      setIsLoading(false);
    }
  };

  const initializeCanvas = (pageData: string) => {
    try {
      const parsedData = JSON.parse(pageData);
      // Here we would initialize fabric.js or another canvas library
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
      console.error('Error initializing canvas:', error);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const handleSave = async () => {
    if (!page) return;
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // In a real implementation, here we would serialize the canvas state
      // For demonstration, we'll just update the timestamp in the page data
      const currentPageData = JSON.parse(page.pageData);
      currentPageData.lastSaved = new Date().toISOString();
      
      const response = await fetch(`/api/pages/${params.pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageData: JSON.stringify(currentPageData),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save page');
      }
      
      const updatedPage = await response.json();
      setPage(updatedPage);
      setSuccessMessage('Page saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Failed to save page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading page editor...</p>
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
            Exit
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6 grid grid-cols-3 gap-6">
          <div>
            <label htmlFor="pageType" className="block text-sm font-medium text-gray-700">
              Page Type
            </label>
            <select
              id="pageType"
              name="pageType"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={page?.pageType || ''}
              readOnly
              disabled
            >
              <option value={page?.pageType}>
                {page?.pageType.charAt(0).toUpperCase() + page?.pageType.slice(1)}
              </option>
            </select>
          </div>
          
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              id="month"
              name="month"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={page?.month || ''}
              readOnly
              disabled
            >
              <option value={page?.month || ''}>
                {page?.month ? getMonthName(page.month) : 'None'}
              </option>
            </select>
          </div>
          
          <div>
            <label htmlFor="pageNumber" className="block text-sm font-medium text-gray-700">
              Page Number
            </label>
            <input
              type="number"
              name="pageNumber"
              id="pageNumber"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={page?.pageNumber || ''}
              readOnly
              disabled
            />
          </div>
        </div>
        
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
        
        <div className="mt-6 text-center text-gray-500">
          <p>Editor functionality will be implemented in the next development phase.</p>
          <p>This page demonstrates the basic UI for the editor.</p>
        </div>
      </div>
    </div>
  );
} 