import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react";
import { locationOptions } from "@/lib/types";
import { useBookingState } from "@/hooks/use-booking-state";
import { formatSelectedSlot } from "@/lib/helper";
import { UserType } from "@/types/api.type";

const EventDetails = (props: {
  eventTitle: string;
  description: string;
  user?: UserType;
  username: string;
  duration: number;
  eventLocationType: string;
}) => {
  const {
    eventTitle,
    description,
    duration,
    username,
    user,
    eventLocationType,
  } = props;

  const navigate = useNavigate();
  const { timezone, hourType, next, isSuccess, selectedSlot, handleBack } =
    useBookingState();

  const handleClick = () => {
    if (isSuccess) {
      navigate(`/${username}`);
    }
    if (next) {
      handleBack();
      return;
    }
    navigate(`/${username}`);
  };

  const locationOption = locationOptions.find(
    (option) => option.value === eventLocationType
  );

  return (
    <div className="bg-white lg:w-[400px] p-6 space-y-6 rounded-2xl shadow-xl">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handleClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        
        <div>
          <p className="text-sm text-gray-500 capitalize">
            {user?.name}
          </p>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          {eventTitle}
        </h1>
        <p className="text-gray-600 max-w-sm mx-auto">
          {description}
        </p>
      </div>

      <div className="space-y-4 bg-gray-50 rounded-xl p-5">
        {next && selectedSlot && (
          <div className="flex items-center gap-3 text-gray-700">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <span className="font-medium">
              {formatSelectedSlot(
                selectedSlot,
                duration,
                timezone,
                hourType
              )}
            </span>
          </div>
        )}

        {duration && (
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="font-medium">
              {duration} Minutes
            </span>
          </div>
        )}

        {locationOption && (
          <div className="flex items-center gap-3 text-gray-700">
            <img
              src={locationOption?.logo as string}
              alt={locationOption?.label}
              className="w-5 h-5"
            />
            <span>{locationOption?.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;