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

    // Check if user is registered for the event
    const participation = await prisma.participant.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      },
      include: {
        event: true
      }
    })

    if (!participation) {
      return NextResponse.json(
        { message: "You are not registered for this event" },
        { status: 400 }
      )
    }

    // Check if event hasn't started yet (allow unregistration)
    if (participation.event.date < new Date()) {
      return NextResponse.json(
        { message: "Cannot unregister from past events" },
        { status: 400 }
      )
    }

    // Delete participation
    await prisma.participant.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      }
    })

    return NextResponse.json(
      { message: "Successfully unregistered from the event" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unregistration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}