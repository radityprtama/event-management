import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock } from "lucide-react"

async function getUserEvents(userId: string) {
  return await prisma.participant.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          creator: {
            select: { name: true }
          },
          _count: {
            select: { participants: true }
          }
        }
      }
    },
    orderBy: {
      event: { date: "asc" }
    }
  })
}

async function getUpcomingEvents() {
  return await prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      status: "UPCOMING"
    },
    include: {
      creator: {
        select: { name: true }
      },
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { date: "asc" },
    take: 6
  })
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const [userEvents, upcomingEvents] = await Promise.all([
    getUserEvents(session.user.id),
    getUpcomingEvents()
  ])

  const registeredEvents = userEvents.filter(p => p.event.date >= new Date())
  const pastEvents = userEvents.filter(p => p.event.date < new Date())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session.user.name}!</h1>
        <p className="text-muted-foreground">
          Manage your event participations and discover new events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Events you're registered for
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Events you've attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              All time registrations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* My Events */}
        <Card>
          <CardHeader>
            <CardTitle>My Events</CardTitle>
            <CardDescription>
              Events you're registered for
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registeredEvents.length > 0 ? (
              <div className="space-y-4">
                {registeredEvents.slice(0, 5).map((participation) => (
                  <div
                    key={participation.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold">{participation.event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(participation.event.date).toLocaleDateString()}</span>
                        <MapPin className="h-3 w-3 ml-2" />
                        <span>{participation.event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        participation.status === "CONFIRMED" ? "default" :
                        participation.status === "ATTENDED" ? "secondary" :
                        "outline"
                      }>
                        {participation.status}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/events/${participation.event.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't registered for any upcoming events yet.
                </p>
                <Button asChild>
                  <Link href="/#events">Browse Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discover Events */}
        <Card>
          <CardHeader>
            <CardTitle>Discover Events</CardTitle>
            <CardDescription>
              New events you might be interested in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <Users className="h-3 w-3 ml-2" />
                        <span>{event._count.participants} registered</span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/events/${event.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No upcoming events available at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}