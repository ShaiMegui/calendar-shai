import { CalendarDays, Video } from "lucide-react";

export enum IntegrationAppEnum {
  GOOGLE_MEET_AND_CALENDAR = "GOOGLE_MEET_AND_CALENDAR",
  ZOOM_MEETING = "ZOOM_MEETING",
  OUTLOOK_CALENDAR = "OUTLOOK_CALENDAR"
}

export type IntegrationAppType = keyof typeof IntegrationAppEnum;

export const IntegrationLogos: Record<IntegrationAppType, string | string[]> = {
  GOOGLE_MEET_AND_CALENDAR: [
    "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
  ],
  ZOOM_MEETING: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/512px-Zoom_Communications_Logo.svg.png",
  OUTLOOK_CALENDAR: "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
};

export const IntegrationDescriptions: Record<IntegrationAppType, string> = {
  GOOGLE_MEET_AND_CALENDAR: "Connect your Google Calendar to automatically add and manage events, and create Google Meet links for your meetings.",
  ZOOM_MEETING: "Create Zoom meetings automatically when events are scheduled.",
  OUTLOOK_CALENDAR: "Connect your Outlook Calendar to automatically add and manage events."
};

export const locationOptions = [
  {
    value: "GOOGLE_MEET_AND_CALENDAR",
    label: "Google Meet",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg"
  },
  {
    value: "ZOOM_MEETING",
    label: "Zoom Meeting",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/512px-Zoom_Communications_Logo.svg.png"
  }
];