import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, Globe, Lock, Trash2, Eye } from "lucide-react";
import { getEventsQueryFn } from "@/lib/api";
import { Event } from "@/types/calendar";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";
import { useStore } from "@/store/store";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { ShareLink } from "@/components/events/ShareLink";
import PageTitle from "@/components/PageTitle";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const EventTypes = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const user = useStore((state) => state.user);
  const queryClient = useQueryClient();

  const { 
    data: events = [], 
    isLoading: isLoadingEvents,
    isError,
    error
  } = useQuery<Event[]>({
    queryKey: ["events", user?.id],
    queryFn: getEventsQueryFn,
    enabled: !!user?.id,
  });

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event type deleted successfully");
      setEventToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageTitle 
          title="Event Types" 
          subtitle="Create and manage your event types."
          className="mb-0"
        />
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Event Type</span>
        </button>
      </div>

      <ErrorAlert isError={isError} error={error} />

      {isLoadingEvents ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader size="lg" color="black" className="text-primary opacity-70" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No event types found
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first event type to start scheduling meetings
          </p>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event Type</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {event.isPrivate ? (
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{event.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>One-on-one</span>
                  </div>
                </div>

                <ShareLink 
                  slug={event.slug}
                  username={user?.username}
                  className="mb-4"
                />

                <div className="flex items-center justify-end gap-2 mt-4">
                  <Link
                    to={PROTECTED_ROUTES.EVENT_TYPE_PREVIEW(event.id)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={PROTECTED_ROUTES.EVENT_TYPE_EDIT(event.id)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="sr-only">Edit</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    onClick={() => setEventToDelete(event)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEventDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <AlertDialog 
        open={!!eventToDelete} 
        onOpenChange={() => setEventToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event type? This action cannot be undone.
              All scheduled meetings for this event type will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && deleteEvent(eventToDelete.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader size="sm" color="white" />
              ) : (
                "Delete Event Type"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventTypes;