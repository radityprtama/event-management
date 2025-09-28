import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditEventForm } from "@/components/admin/edit-event-form"

async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id }
  })
}

export default async function EditEventPage({
  params,
}: {
  params: { id: string }
}) {
  const event = await getEvent(params.id)

  if (!event) {
    notFound()
  }

  return <EditEventForm event={event} />
}