import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { Calendar, Clock, User, Video, X, AlertTriangle, Ban } from "lucide-react";
import { getMeetingsQueryFn, cancelMeetingMutationFn } from "@/lib/api";
import { Meeting } from "@/types/calendar";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";
import PageTitle from "@/components/PageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

const formatSafeDate = (dateStr: string | null | undefined, formatStr: string): string => {
  if (!dateStr) return "Invalid date";
  
  try {
    const parsedDate = parseISO(dateStr);
    if (isValid(parsedDate)) {
      return format(parsedDate, formatStr);
    }
    
    const date = new Date(dateStr);
    if (isValid(date)) {
      return format(date, formatStr);
    }
    
    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error, dateStr);
    return "Invalid date";
  }
};

const Meetings = () => {
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const { 
    data: meetings = [],
    isLoading,
    isError,
    error
  } = useQuery<Meeting[]>({
    queryKey: ["meetings"],
    queryFn: getMeetingsQueryFn,
  });

  const { mutate: cancelMeeting, isPending: isCancelling } = useMutation({
    mutationFn: cancelMeetingMutationFn,
    onSuccess: () => {
      toast.success("Meeting cancelled successfully");
      setShowCancelDialog(false);
      setSelectedMeeting(null);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      toast.error(`Failed to cancel meeting: ${error.message}`);
      setShowCancelDialog(false);
    },
  });

  const handleCancelClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    if (selectedMeeting) {
      cancelMeeting(selectedMeeting.id);
    }
  };

  return (
    <div className="w-full">
      <PageTitle 
        title="Meetings" 
        subtitle="View and manage your scheduled meetings"
        className="mb-8"
      />

      <ErrorAlert isError={isError} error={error} />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader size="lg" color="black" className="text-primary opacity-70" />
        </div>
      ) : meetings.length === 0 ? (
        <Card className="text-center py-12 shadow-lg border border-gray-200">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No meetings scheduled
            </h3>
            <p className="text-gray-500">
              Share your event link with others to schedule meetings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                        {meeting.event?.title}
                      </h3>
                      {meeting.event?.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {meeting.event.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span className="truncate">
                          {formatSafeDate(meeting.start_time, "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span className="truncate">
                          {formatSafeDate(meeting.start_time, "h:mm a")} -{" "}
                          {formatSafeDate(meeting.end_time, "h:mm a")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span className="truncate">
                          {meeting.guest_name || "Guest"} ({meeting.guest_email || "No email"})
                        </span>
                      </div>

                      {meeting.meet_link && meeting.status === "SCHEDULED" ? (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 flex-shrink-0 text-primary" />
                          <a
                            href={meeting.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 hover:underline transition-colors truncate"
                          >
                            Join meeting
                          </a>
                        </div>
                      ) : meeting.meet_link && meeting.status === "CANCELLED" ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Ban className="w-4 h-4 flex-shrink-0" />
                          <span className="line-through truncate">Meeting link disabled (cancelled)</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                    <div
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
                        ${
                          meeting.status === "SCHEDULED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      `}
                    >
                      {meeting.status}
                    </div>

                    {meeting.status === "SCHEDULED" && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancelClick(meeting)}
                        className="whitespace-nowrap"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Cancel Meeting
            </DialogTitle>
            <DialogDescription>
              This will cancel your meeting with {selectedMeeting?.guest_name || "the guest"} 
              scheduled for {selectedMeeting?.start_time ? formatSafeDate(selectedMeeting.start_time, "EEEE, MMMM d, yyyy 'at' h:mm a") : "the specified time"}. 
              <p className="mt-2 font-medium text-amber-600">
                The Google Meet link will be disabled and participants won't be able to join.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Keep Meeting
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader size="sm" color="white" className="mr-2" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Yes, Cancel Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Meetings;