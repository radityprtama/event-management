import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
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

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: capacity || null,
        price: price || 0,
        status: status || "UPCOMING",
        createdBy: session.user.id
      }
    })

    return NextResponse.json(
      { message: "Event created successfully", event },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}