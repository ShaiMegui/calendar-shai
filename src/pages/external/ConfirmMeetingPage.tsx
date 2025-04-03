import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ENV } from "@/lib/env";
import { Loader } from "@/components/loader";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfirmMeetingPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState<any>(null);

  useEffect(() => {
    const confirmMeeting = async () => {
      try {
        const token = searchParams.get("token");
        const eventId = searchParams.get("eventId");

        if (!token || !eventId) {
          throw new Error("Invalid confirmation link");
        }

        const response = await fetch(
          `${ENV.VITE_SUPABASE_URL}/functions/v1/confirm-meeting?token=${token}&eventId=${eventId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to confirm meeting");
        }

        setMeetingData(data.data);
        setStatus("success");
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setStatus("error");
      }
    };

    confirmMeeting();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" color="black" className="text-primary opacity-70" />
          <p className="mt-4 text-gray-600">Confirming your meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === "success" ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Meeting Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Your meeting has been successfully confirmed. You'll receive an email with the meeting details.
            </p>
            {meetingData?.meet_link && (
              <a
                href={meetingData.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full">
                  Join Meeting
                </Button>
              </a>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmation Failed
            </h1>
            <p className="text-gray-600">
              {error || "Unable to confirm meeting. Please try again or contact support."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmMeetingPage;