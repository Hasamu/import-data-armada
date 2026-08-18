import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const armada = await prisma.armada.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(armada)
  } catch (error: any) {
    console.error('Error fetching armada:', error)
    return NextResponse.json({ error: error.message || 'Internal server error', stack: error.stack }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { idUnit } = await request.json()

    if (!idUnit) {
      return NextResponse.json({ error: 'ID Unit is required' }, { status: 400 })
    }

    const existingArmada = await prisma.armada.findUnique({
      where: { idUnit }
    })

    if (existingArmada) {
      return NextResponse.json({ error: 'ID Unit sudah ada' }, { status: 400 })
    }

    const newArmada = await prisma.armada.create({
      data: {
        idUnit
      }
    })

    return NextResponse.json(newArmada, { status: 201 })
  } catch (error) {
    console.error('Error creating armada:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
