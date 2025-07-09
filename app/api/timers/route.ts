import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const timers = await prisma.timer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(timers);
  } catch (error) {
    console.error('Error fetching timers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, startTime, endTime, isActive } = await request.json();
    
    const timer = await prisma.timer.create({
      data: {
        title,
        startTime,
        endTime,
        isActive,
      },
    });
    
    return NextResponse.json(timer);
  } catch (error) {
    console.error('Error creating timer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, startTime, endTime, isActive } = await request.json();
    
    const timer = await prisma.timer.update({
      where: { id },
      data: {
        title,
        startTime,
        endTime,
        isActive,
      },
    });
    
    return NextResponse.json(timer);
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.timer.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}