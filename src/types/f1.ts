export interface RaceEvent {
  id: string;
  number: string;   // changed from code
  name: string;
  circuit: string;  // changed from circuitName
  raceDate: string; // changed from eventDate
  status: string;
  location?: string;
  season?: number;
  totalSponsoredRevenue?: number;
}

export interface BCRaceEventsResponse {
  value: RaceEvent[];
}