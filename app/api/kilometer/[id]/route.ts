import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.kilometerReport.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Kilometer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
