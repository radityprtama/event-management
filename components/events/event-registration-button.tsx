"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface EventRegistrationButtonProps {
  eventId: string
  userParticipation: { id: string; status: string } | null
  isEventFull: boolean
  isEventPast: boolean
  isLoggedIn: boolean
}

export function EventRegistrationButton({
  eventId,
  userParticipation,
  isEventFull,
  isEventPast,
  isLoggedIn
}: EventRegistrationButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegistration = async () => {
    if (!isLoggedIn) {
      router.push("/auth/signin")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        router.refresh()
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/events/unregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        router.refresh()
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <Button className="w-full" asChild>
        <Link href="/auth/signin">Sign in to Register</Link>
      </Button>
    )
  }

  if (isEventPast) {
    return (
      <Button disabled className="w-full">
        Event has ended
      </Button>
    )
  }

  if (userParticipation) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleUnregister}
          disabled={loading}
        >
          {loading ? "Unregistering..." : "Unregister"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Status: {userParticipation.status}
        </p>
      </div>
    )
  }

  if (isEventFull) {
    return (
      <Button disabled className="w-full">
        Event is Full
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      onClick={handleRegistration}
      disabled={loading}
    >
      {loading ? "Registering..." : "Register for Event"}
    </Button>
  )
}