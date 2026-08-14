import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.armada.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Armada deleted successfully' })
  } catch (error) {
    console.error('Error deleting armada:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
