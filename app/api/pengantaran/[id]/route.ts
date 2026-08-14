import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.pengantaranReport.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Pengantaran:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
