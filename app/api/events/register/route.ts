import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      )
    }

    // Check if event exists and is upcoming
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    if (event.date < new Date()) {
      return NextResponse.json(
        { message: "Cannot register for past events" },
        { status: 400 }
      )
    }

    if (event.status !== "UPCOMING") {
      return NextResponse.json(
        { message: "Event is not available for registration" },
        { status: 400 }
      )
    }

    // Check if event is full
    if (event.capacity && event._count.participants >= event.capacity) {
      return NextResponse.json(
        { message: "Event is full" },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingParticipation = await prisma.participant.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      }
    })

    if (existingParticipation) {
      return NextResponse.json(
        { message: "You are already registered for this event" },
        { status: 400 }
      )
    }

    // Create participation
    await prisma.participant.create({
      data: {
        userId: session.user.id,
        eventId,
        status: "REGISTERED"
      }
    })

    return NextResponse.json(
      { message: "Successfully registered for the event!" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}