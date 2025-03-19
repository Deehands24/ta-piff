import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// POST /api/pages - Create a new page in a project
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, pageType, pageData, month, pageNumber } = body;

    if (!projectId || !pageType || !pageData) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the project exists and belongs to the user
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Determine the page number if not provided
    let newPageNumber = pageNumber;
    if (!newPageNumber) {
      // Get the highest page number in the project
      const highestPageNumber = await prisma.page.findFirst({
        where: {
          projectId,
        },
        orderBy: {
          pageNumber: 'desc',
        },
        select: {
          pageNumber: true,
        },
      });

      newPageNumber = highestPageNumber ? highestPageNumber.pageNumber + 1 : 1;
    }

    // Create the new page
    const page = await prisma.page.create({
      data: {
        pageType,
        pageData,
        pageNumber: newPageNumber,
        month,
        projectId,
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

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { message: 'Failed to create page' },
      { status: 500 }
    );
  }
} 