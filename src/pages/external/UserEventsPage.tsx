import { Link, useParams } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import PageContainer from "./_components/page-container";
import { useQuery } from "@tanstack/react-query";
import { getAllPublicEventQueryFn } from "@/lib/api";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";

const UserEventsPage = () => {
  const param = useParams();
  const username = param.username as string;

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["public_events", username],
    queryFn: () => getAllPublicEventQueryFn(username),
    retry: 1,
  });

  const events = data?.events || [];
  const user = data?.user;

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" color="black" className="text-primary opacity-70" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorAlert isError={isError} error={error} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 capitalize">
            {user?.name}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Welcome to my scheduling page. Please select an event to book a meeting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {events?.map((event) => (
            <Link
              key={event.id}
              to={`/${username}/${event.slug}`}
              className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl 
              transition-all duration-300 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 capitalize group-hover:text-primary transition-colors">
                    {event.title}
                  </h2>
                  <ArrowRight 
                    className="w-6 h-6 text-gray-400 group-hover:text-primary 
                    group-hover:translate-x-1 transition-all"
                  />
                </div>
                
                <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
                  {event.description || "No description available"}
                </p>
                
                <div className="flex items-center justify-between">
                  <div 
                    className="inline-flex items-center gap-2 
                    bg-primary/10 text-primary px-3 py-1 
                    rounded-full text-sm font-medium"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{event.duration} mins</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center bg-white rounded-2xl shadow-xl p-12">
            <p className="text-gray-600 text-lg">
              No events available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEventsPage;