import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventActions } from "@/components/admin/event-actions"
import Link from "next/link"
import { Plus, Calendar, MapPin, Users } from "lucide-react"

async function getEvents() {
  return await prisma.event.findMany({
    include: {
      creator: {
        select: { name: true }
      },
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export default async function AdminEventsPage() {
  const events = await getEvents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all events
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge variant={
                        event.status === "UPCOMING" ? "default" :
                        event.status === "ONGOING" ? "secondary" :
                        event.status === "COMPLETED" ? "outline" :
                        "destructive"
                      }>
                        {event.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </div>
                  <EventActions eventId={event.id} eventTitle={event.title} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event._count.participants} registered
                      {event.capacity && ` / ${event.capacity}`}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-medium">
                      {event.price && Number(event.price) > 0 ? `$${event.price}` : "Free"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Created by {event.creator.name} on {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first event
              </p>
              <Button asChild>
                <Link href="/admin/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}