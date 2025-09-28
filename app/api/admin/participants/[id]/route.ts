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

    const { status } = await request.json()

    if (!["REGISTERED", "CONFIRMED", "ATTENDED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(
      { message: "Participant status updated successfully", participant },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update participant error:", error)
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

    await prisma.participant.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: "Participant removed successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete participant error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}