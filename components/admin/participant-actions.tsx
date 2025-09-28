"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ParticipantActionsProps {
  participantId: string
  currentStatus: string
  userName: string
  eventTitle: string
}

export function ParticipantActions({
  participantId,
  currentStatus,
  userName,
  eventTitle
}: ParticipantActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Participant status updated to ${newStatus}`)
        router.refresh()
      } else {
        toast.error(data.message || "Failed to update status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/participants/${participantId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Participant removed successfully")
        router.refresh()
      } else {
        toast.error(data.message || "Failed to remove participant")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "CONFIRMED" && (
            <DropdownMenuItem onClick={() => updateStatus("CONFIRMED")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Confirmed
            </DropdownMenuItem>
          )}
          {currentStatus !== "ATTENDED" && (
            <DropdownMenuItem onClick={() => updateStatus("ATTENDED")}>
              <Clock className="h-4 w-4 mr-2" />
              Mark as Attended
            </DropdownMenuItem>
          )}
          {currentStatus !== "CANCELLED" && (
            <DropdownMenuItem onClick={() => updateStatus("CANCELLED")}>
              <XCircle className="h-4 w-4 mr-2" />
              Mark as Cancelled
            </DropdownMenuItem>
          )}
          {currentStatus !== "REGISTERED" && (
            <DropdownMenuItem onClick={() => updateStatus("REGISTERED")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Registered
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Participant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userName} from "{eventTitle}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Removing..." : "Remove Participant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}