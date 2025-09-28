import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ParticipantActions } from "@/components/admin/participant-actions"
import { Calendar, Users, Mail, Clock } from "lucide-react"

async function getParticipants() {
  return await prisma.participant.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      },
      event: {
        select: { title: true, date: true, location: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

async function getParticipantStats() {
  const [total, confirmed, attended, cancelled] = await Promise.all([
    prisma.participant.count(),
    prisma.participant.count({ where: { status: "CONFIRMED" } }),
    prisma.participant.count({ where: { status: "ATTENDED" } }),
    prisma.participant.count({ where: { status: "CANCELLED" } })
  ])

  return { total, confirmed, attended, cancelled }
}

export default async function AdminParticipantsPage() {
  const [participants, stats] = await Promise.all([
    getParticipants(),
    getParticipantStats()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Participant Management</h1>
        <p className="text-muted-foreground">
          Manage event participants and their registration status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attended</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attended}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>All Participants</CardTitle>
          <CardDescription>
            Manage participant registrations and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participants.length > 0 ? (
            <div className="space-y-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{participant.user.name}</h4>
                      <Badge variant={
                        participant.status === "CONFIRMED" ? "default" :
                        participant.status === "ATTENDED" ? "secondary" :
                        participant.status === "CANCELLED" ? "destructive" :
                        "outline"
                      }>
                        {participant.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {participant.user.email}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">{participant.event.title}</span>
                      <span>•</span>
                      <span>{new Date(participant.event.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{participant.event.location}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registered: {new Date(participant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ParticipantActions
                    participantId={participant.id}
                    currentStatus={participant.status}
                    userName={participant.user.name}
                    eventTitle={participant.event.title}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
              <p className="text-muted-foreground">
                Participants will appear here when users register for events
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}