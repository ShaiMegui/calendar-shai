import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllIntegrationQueryFn } from "@/lib/api";
import { toast } from "sonner";
import PageTitle from "@/components/PageTitle";
import IntegrationCard from "./_components/integration-card";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";
import { IntegrationAppType } from "@/lib/types";

const DEFAULT_INTEGRATIONS = [
  {
    app_type: "GOOGLE_MEET_AND_CALENDAR",
    title: "Google Meet & Calendar",
    isConnected: false
  },
  {
    app_type: "ZOOM_MEETING",
    title: "Zoom",
    isConnected: false,
    isDisabled: true
  },
  {
    app_type: "OUTLOOK_CALENDAR",
    title: "Outlook Calendar",
    isConnected: false,
    isDisabled: true
  }
] as const;

const Integrations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const { 
    data, 
    isFetching, 
    isError, 
    error: queryError, 
    refetch 
  } = useQuery({
    queryKey: ["integration_list"],
    queryFn: getAllIntegrationQueryFn,
  });

  useEffect(() => {
    if (success === "true") {
      toast.success("Integration connected successfully!");
      refetch();
      setSearchParams({});
    } else if (error) {
      toast.error(decodeURIComponent(error));
      setSearchParams({});
    }
  }, [success, error, refetch, setSearchParams]);

  const connectedIntegrations = data?.integrations?.reduce((acc, integration) => {
    acc[integration.app_type] = integration.is_connected;
    return acc;
  }, {} as Record<string, boolean>) || {};

  const integrations = DEFAULT_INTEGRATIONS.map(integration => ({
    ...integration,
    isConnected: connectedIntegrations[integration.app_type] || false,
    isDisabled: integration.isDisabled || false
  }));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <PageTitle
          title="Integrations & Apps"
          subtitle="Connect your favorite apps to enhance your scheduling experience"
          className="text-center sm:text-left"
        />
      </div>

      <ErrorAlert isError={isError} error={queryError} />

      {isFetching ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader size="lg" color="black" className="text-primary opacity-70" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.app_type}
              appType={integration.app_type as IntegrationAppType}
              title={integration.title}
              isConnected={integration.isConnected}
              isDisabled={integration.isDisabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Integrations;