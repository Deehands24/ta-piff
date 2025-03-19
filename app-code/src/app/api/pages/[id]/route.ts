import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// GET /api/pages/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pageId = params.id;

    // Fetch the page and include the project to check ownership
    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        project: true,
      },
    });

    // Check if page exists
    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    // Check if the page's project belongs to the authenticated user
    if (page.project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Remove the project data to avoid sending unnecessary data
    const { project, ...pageData } = page;

    return NextResponse.json(pageData);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { message: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pageId = params.id;
    const body = await request.json();
    const { pageType, pageData, month, pageNumber } = body;

    // Fetch the page and include the project to check ownership
    const existingPage = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        project: true,
      },
    });

    // Check if page exists
    if (!existingPage) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    // Check if the page's project belongs to the authenticated user
    if (existingPage.project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Update the page
    const updatedPage = await prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        pageType: pageType || existingPage.pageType,
        pageData: pageData || existingPage.pageData,
        month: month !== undefined ? month : existingPage.month,
        pageNumber: pageNumber || existingPage.pageNumber,
      },
    });

    // Update the project's last modified date
    await prisma.project.update({
      where: {
        id: existingPage.projectId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { message: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pageId = params.id;

    // Fetch the page and include the project to check ownership
    const existingPage = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        project: true,
      },
    });

    // Check if page exists
    if (!existingPage) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    // Check if the page's project belongs to the authenticated user
    if (existingPage.project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Store project ID before deleting the page
    const projectId = existingPage.projectId;

    // Delete the page
    await prisma.page.delete({
      where: {
        id: pageId,
      },
    });

    // Update the project's last modified date
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { message: 'Failed to delete page' },
      { status: 500 }
    );
  }
} 