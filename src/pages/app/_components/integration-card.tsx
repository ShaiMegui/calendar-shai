import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connectAppIntegrationQueryFn } from "@/lib/api";
import {
  IntegrationAppEnum,
  IntegrationAppType,
  IntegrationDescriptions,
  IntegrationLogos,
} from "@/lib/types";
import { PlusIcon, CheckCircle2 } from "lucide-react";

interface IntegrationCardProps {
  appType: IntegrationAppType;
  title: string;
  isConnected?: boolean;
  isDisabled?: boolean;
}

interface ImageWrapperProps {
  src: string;
  alt: string;
  height?: number;
  width?: number;
  className?: string;
}

const SUCCESS_MESSAGES: Record<IntegrationAppType, string> = {
  [IntegrationAppEnum.GOOGLE_MEET_AND_CALENDAR]:
    "Google Calendar connected successfully!",
  [IntegrationAppEnum.ZOOM_MEETING]:
    "Zoom connected successfully!",
  [IntegrationAppEnum.OUTLOOK_CALENDAR]:
    "Outlook Calendar connected successfully!"
};

const ERROR_MESSAGES: Record<IntegrationAppType, string> = {
  [IntegrationAppEnum.GOOGLE_MEET_AND_CALENDAR]:
    "Failed to connect Google Calendar. Please try again.",
  [IntegrationAppEnum.ZOOM_MEETING]:
    "Failed to connect Zoom. Please try again.",
  [IntegrationAppEnum.OUTLOOK_CALENDAR]:
    "Failed to connect Outlook Calendar. Please try again."
};

const IntegrationCard = ({
  appType,
  title,
  isConnected = false,
  isDisabled = false,
}: IntegrationCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationAppType | null>(null);

  const logos = IntegrationLogos[appType];
  const description = IntegrationDescriptions[appType];

  const handleConnect = async (appType: IntegrationAppType) => {
    setSelectedType(appType);
    setIsLoading(true);
    try {
      const { url } = await connectAppIntegrationQueryFn({
        appType,
        origin: window.location.origin
      });
      window.location.href = url;
    } catch (error) {
      setIsLoading(false);
      toast.error(ERROR_MESSAGES[appType]);
    }
  };

  return (
    <Card 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between 
      border border-gray-200 rounded-xl shadow-sm 
      hover:shadow-md transition-all duration-300 overflow-hidden
      w-full"
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center 
      gap-4 sm:gap-6 p-4 sm:p-6 w-full">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {Array.isArray(logos) ? (
              <div className="flex items-center space-x-2">
                <ImageWrapper src={logos[0]} alt="First logo" />
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <ImageWrapper src={logos[1]} alt="Second logo" />
              </div>
            ) : (
              <ImageWrapper src={logos} alt={`${title} logo`} />
            )}
          </div>
          
          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 line-clamp-2">
              {description}
            </CardDescription>
          </div>
        </div>
        
        <div className="w-full sm:w-auto flex justify-start sm:justify-end mt-4 sm:mt-0">
          {isConnected ? (
            <div 
              className="inline-flex items-center gap-2 
              px-3 py-1.5 sm:px-4 sm:py-2 rounded-full 
              bg-green-50 text-green-700 
              border border-green-200"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-sm sm:text-base font-semibold whitespace-nowrap">
                Connected
              </span>
            </div>
          ) : (
            <Button
              onClick={() => handleConnect(appType)}
              className={`
                w-full sm:w-36 rounded-lg transition-all duration-300
                ${
                  isDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }
              `}
              disabled={isLoading || isDisabled}
            >
              {isLoading && selectedType === appType ? (
                <Loader size="sm" color="white" />
              ) : (
                <span className="text-sm sm:text-base">
                  {isDisabled ? "Coming Soon" : "Connect"}
                </span>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export const ImageWrapper: React.FC<ImageWrapperProps> = ({
  src,
  alt,
  height = 30,
  width = 30,
  className = "",
}) => {
  return (
    <div
      className={`
        flex items-center justify-center 
        size-[40px] sm:size-[50px] rounded-full bg-white 
        shadow-md border border-gray-100 
        ${className}
      `}
    >
      <img
        src={src}
        alt={alt}
        height={height}
        width={width}
        className="object-contain p-1.5 sm:p-2"
      />
    </div>
  );
};

export default IntegrationCard;