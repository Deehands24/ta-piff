import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

// GET /api/projects/[id]
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

    const projectId = params.id;

    // Fetch the project with its pages
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc',
          },
        },
      },
    });

    // Check if project exists
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Check if the project belongs to the authenticated user
    if (project.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]
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

    const projectId = params.id;
    const body = await request.json();
    const { title, description, coverImage } = body;

    // Check if the project exists and belongs to the user
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        title: title || existingProject.title,
        description: description !== undefined ? description : existingProject.description,
        coverImage: coverImage !== undefined ? coverImage : existingProject.coverImage,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { message: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
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

    const projectId = params.id;

    // Check if the project exists and belongs to the user
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Delete the project (including all associated pages due to cascade delete)
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 