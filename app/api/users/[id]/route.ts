import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if the user exists and is a driver
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user || user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Driver deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
