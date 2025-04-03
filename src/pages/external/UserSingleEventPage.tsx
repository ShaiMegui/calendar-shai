import { Fragment } from "react";
import { useParams } from "react-router-dom";
import { today } from "@internationalized/date";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "./_components/page-container";
import BookingCalendar from "./_components/booking-calendar";
import BookingForm from "./_components/booking-form";
import { useBookingState } from "@/hooks/use-booking-state";
import EventDetails from "./_components/event-details";
import { getSinglePublicEventBySlugQueryFn } from "@/lib/api";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";

const UserSingleEventPage = () => {
  const param = useParams();
  const username = param.username as string;
  const slug = param.slug as string;

  const { next, timezone, selectedDate } = useBookingState();

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["public_single_event"],
    queryFn: () =>
      getSinglePublicEventBySlugQueryFn({
        username,
        slug,
      }),
  });

  const event = data?.event;

  return (
    <PageContainer isLoading={isLoading}>
      <ErrorAlert isError={isError} error={error} />

      {isFetching || isError ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader 
            size="lg" 
            color="black" 
            className="text-primary opacity-70" 
          />
        </div>
      ) : (
        event && (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid lg:grid-cols-[400px_1fr] gap-8">
              {/* Event Details Section */}
              <EventDetails
                eventTitle={event?.title}
                description={event?.description}
                user={event?.user}
                eventLocationType={event?.locationType}
                username={username || ""}
                duration={event?.duration}
              />

              {/* Calendar & Booking Section */}
              <div className="w-full">
                {next ? (
                  <Fragment>
                    <BookingForm 
                      eventId={event.id} 
                      duration={event.duration} 
                    />
                  </Fragment>
                ) : (
                  <Fragment>
                    <BookingCalendar
                      eventId={event.id}
                      minValue={today(timezone)}
                      defaultValue={today(timezone)}
                    />
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </PageContainer>
  );
};

export default UserSingleEventPage;