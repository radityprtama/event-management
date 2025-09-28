import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"

async function getUpcomingEvents() {
  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date()
      },
      status: "UPCOMING"
    },
    include: {
      creator: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          participants: true
        }
      }
    },
    orderBy: {
      date: "asc"
    },
    take: 6
  })
  return events
}

export default async function Home() {
  const upcomingEvents = await getUpcomingEvents()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover & Create
          <span className="text-primary"> Amazing Events</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join exciting events in your community or create your own. Connect with like-minded people and make unforgettable memories.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#events">Browse Events</Link>
          </Button>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground">
            Don't miss out on these exciting upcoming events
          </p>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Badge>
                    <Badge variant="outline">
                      ${event.price?.toString() || "Free"}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event._count.participants} registered
                      {event.capacity && ` / ${event.capacity} max`}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" asChild>
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No upcoming events at the moment.
            </p>
            <Button asChild>
              <Link href="/auth/signup">Be the first to create an event!</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground">
              Everything you need to manage events successfully
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Event Creation</h3>
              <p className="text-muted-foreground">
                Create and manage events with our intuitive interface
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Participant Management</h3>
              <p className="text-muted-foreground">
                Track registrations and manage attendees effortlessly
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location Discovery</h3>
              <p className="text-muted-foreground">
                Find events near you or discover new locations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 EventPlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
