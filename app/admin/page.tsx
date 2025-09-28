import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, Users, TrendingUp, BarChart } from "lucide-react"
import { ParticipantGrowthChart } from "@/components/admin/participant-growth-chart"
import { EventStatusChart } from "@/components/admin/event-status-chart"

async function getDashboardStats() {
  const [totalEvents, totalParticipants, upcomingEvents, recentEvents] = await Promise.all([
    prisma.event.count(),
    prisma.participant.count(),
    prisma.event.count({
      where: {
        date: { gte: new Date() },
        status: "UPCOMING"
      }
    }),
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { name: true }
        },
        _count: {
          select: { participants: true }
        }
      }
    })
  ])

  const participantGrowth = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT
      TO_CHAR("createdAt", 'Mon YYYY') as month,
      COUNT(*)::bigint as count
    FROM "Participant"
    GROUP BY TO_CHAR("createdAt", 'Mon YYYY'), DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt") DESC
    LIMIT 6
  `

  const eventsByStatus = await prisma.event.groupBy({
    by: ['status'],
    _count: true
  })

  return {
    totalEvents,
    totalParticipants,
    upcomingEvents,
    recentEvents,
    participantGrowth: participantGrowth.map(item => ({
      month: item.month,
      count: Number(item.count)
    })).reverse(),
    eventsByStatus
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your event management platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All time events created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Registered participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Participants</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEvents > 0 ? Math.round(stats.totalParticipants / stats.totalEvents) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per event
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Participant Growth</CardTitle>
            <CardDescription>
              Registration trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParticipantGrowthChart data={stats.participantGrowth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Status</CardTitle>
            <CardDescription>
              Current distribution of event statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventStatusChart data={stats.eventsByStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest events created on the platform</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/events">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{event.location}</span>
                    <span>•</span>
                    <span>{event._count.participants} participants</span>
                  </div>
                </div>
                <Badge variant={event.status === "UPCOMING" ? "default" : "secondary"}>
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}