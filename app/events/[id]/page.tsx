import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventRegistrationButton } from "@/components/events/event-registration-button"
import { Calendar, MapPin, Users, Clock, DollarSign, User } from "lucide-react"

async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      creator: {
        select: { name: true, email: true }
      },
      participants: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      },
      _count: {
        select: { participants: true }
      }
    }
  })
}

async function getUserParticipation(eventId: string, userId?: string) {
  if (!userId) return null

  return await prisma.participant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId
      }
    }
  })
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const event = await getEvent(params.id)

  if (!event) {
    notFound()
  }

  const userParticipation = await getUserParticipation(params.id, session?.user?.id)
  const isEventFull = event.capacity ? event._count.participants >= event.capacity : false
  const isEventPast = new Date(event.date) < new Date()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant={event.status === "UPCOMING" ? "default" : "secondary"}>
                      {event.status}
                    </Badge>
                    <CardTitle className="text-3xl">{event.title}</CardTitle>
                  </div>
                  {event.price && Number(event.price) > 0 ? (
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      ${event.price.toString()}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      Free
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {event._count.participants}
                        {event.capacity && ` / ${event.capacity}`} registered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Organizer</p>
                      <p className="text-sm text-muted-foreground">
                        {event.creator.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card>
              <CardHeader>
                <CardTitle>Participants ({event._count.participants})</CardTitle>
                <CardDescription>
                  People who have registered for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.participants.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {event.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{participant.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {participant.user.email}
                          </p>
                        </div>
                        <Badge variant={
                          participant.status === "CONFIRMED" ? "default" :
                          participant.status === "ATTENDED" ? "secondary" :
                          "outline"
                        }>
                          {participant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No participants yet. Be the first to register!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EventRegistrationButton
                  eventId={event.id}
                  userParticipation={userParticipation}
                  isEventFull={isEventFull}
                  isEventPast={isEventPast}
                  isLoggedIn={!!session?.user}
                />

                {isEventFull && (
                  <p className="text-sm text-muted-foreground text-center">
                    This event is full
                  </p>
                )}

                {isEventPast && (
                  <p className="text-sm text-muted-foreground text-center">
                    This event has already occurred
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={event.status === "UPCOMING" ? "default" : "secondary"}>
                    {event.status}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {event.price && Number(event.price) > 0 ? `$${event.price}` : "Free"}
                  </span>
                </div>

                {event.capacity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{event.capacity}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}