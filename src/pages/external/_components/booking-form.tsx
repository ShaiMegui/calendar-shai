import { z } from "zod";
import { addMinutes, parseISO } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBookingState } from "@/hooks/use-booking-state";
import { ExternalLink, Send } from "lucide-react";
import { scheduleMeetingMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { Loader } from "@/components/loader";
import { useEffect } from "react";

const bookingFormSchema = z.object({
  guestName: z.string().min(1, "Name is required"),
  guestEmail: z.string().email("Invalid email address"),
  additionalInfo: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const BookingForm = (props: { eventId: string; duration: number }) => {
  const { eventId, duration } = props;
  const queryClient = useQueryClient();
  
  const { 
    selectedDate, 
    isSuccess, 
    selectedSlot, 
    handleSuccess, 
    startNewBooking,
    bookingInProgress 
  } = useBookingState();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      additionalInfo: "",
    },
  });

  const { mutate, isPending, data: meetingData } = useMutation({
    mutationFn: scheduleMeetingMutationFn,
    onSuccess: () => {
      handleSuccess(true);
      queryClient.invalidateQueries({ 
        queryKey: ["availbility_single_event", eventId, selectedDate?.toString()]
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to schedule event");
    },
  });

  // Reset form when booking state changes
  useEffect(() => {
    if (!isSuccess && !bookingInProgress) {
      form.reset();
    }
  }, [isSuccess, bookingInProgress, form]);

  const onSubmit = (values: BookingFormData) => {
    if (!eventId || !selectedSlot || !selectedDate) return;
    
    const decodedSlotDate = decodeURIComponent(selectedSlot);
    const startTime = parseISO(decodedSlotDate);
    const endTime = addMinutes(startTime, duration);

    const payload = {
      ...values,
      eventId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    
    if (isPending) return;
    mutate(payload);
  };

  const handleNewBooking = () => {
    startNewBooking();
    form.reset();
    toast.info("Starting a new booking");
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      {isSuccess ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <ExternalLink className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">
              Booking Confirmed!
            </h2>
            
            <p className="text-gray-600 max-w-sm mx-auto">
              Your meeting has been scheduled successfully. You'll receive an email confirmation shortly.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <p className="text-sm text-gray-500">Meeting link:</p>
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-primary font-medium text-sm truncate flex-1">
                {meetingData?.data?.meet_link || "Link will be available soon"}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {meetingData?.data?.meet_link && (
              <a 
                href={meetingData.data.meet_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <Button 
                  variant="default" 
                  className="w-full py-6 rounded-xl group"
                >
                  <ExternalLink className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  <span>Join Google Meet</span>
                </Button>
              </a>
            )}

            <Button
              variant="outline"
              className="w-full py-6 rounded-xl"
              onClick={handleNewBooking}
            >
              Book Another Meeting
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Send className="w-7 h-7 text-primary" />
            Complete Your Booking
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="your@email.com" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                disabled={isPending} 
                type="submit"
                className="w-full py-6 rounded-xl group"
              >
                {isPending ? (
                  <Loader color="white" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default BookingForm;