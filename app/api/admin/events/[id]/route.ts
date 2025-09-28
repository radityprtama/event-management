import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { title, description, date, location, capacity, price, status } = data

    if (!title || !description || !date || !location) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: capacity || null,
        price: price || 0,
        status: status || "UPCOMING"
      }
    })

    return NextResponse.json(
      { message: "Event updated successfully", event },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Delete all participants first
    await prisma.participant.deleteMany({
      where: { eventId: params.id }
    })

    // Then delete the event
    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}