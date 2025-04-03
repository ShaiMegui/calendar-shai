import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/store";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserSingleEventPage from "@/pages/external/UserSingleEventPage";

const PreviewEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" color="black" className="text-primary opacity-70" />
      </div>
    );
  }

  if (isError) {
    return <ErrorAlert isError={isError} error={error} />;
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(PROTECTED_ROUTES.EVENT_TYPES)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Preview Mode
              </h2>
              <p className="text-gray-500">
                This is how your event type will appear to others
              </p>
            </div>
            <Button
              onClick={() => navigate(`/event/${event.slug}/edit`)}
            >
              Edit Event Type
            </Button>
          </div>
        </div>

        {user?.username && event?.slug && (
          <UserSingleEventPage />
        )}
      </div>
    </div>
  );
};

export default PreviewEventPage;