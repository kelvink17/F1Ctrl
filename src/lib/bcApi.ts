import { BCRaceEventsResponse, RaceEvent } from '../types/f1';

const BASE_URL = process.env.NEXT_PUBLIC_BC_API_BASE_URL;
const COMPANY_ID = process.env.NEXT_PUBLIC_BC_COMPANY_ID;
const USERNAME = process.env.BC_API_USERNAME;
const PASSWORD = process.env.BC_API_PASSWORD;

export async function getRaceEvents(): Promise<RaceEvent[]> {
  if (!BASE_URL || !COMPANY_ID || !USERNAME || !PASSWORD) {
    throw new Error('Business Central API configuration is incomplete. Set the API URL, company ID, username, and password.');
  }

  const url = `${BASE_URL}/companies(${COMPANY_ID})/raceEvents`;
  const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  const response = await fetch(url, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Disable caching for live data updates
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch race events: ${response.status} ${response.statusText}`);
  }

  const data: BCRaceEventsResponse = await response.json();
  return data.value;
}



// Add this to your existing src/lib/bcApi.ts file

export async function createRaceEvent(
  raceData: Pick<RaceEvent, 'number' | 'name' | 'circuit' | 'raceDate' | 'status'>
    & Pick<Partial<RaceEvent>, 'location' | 'season'>,
): Promise<RaceEvent> {
  const url = `${BASE_URL}/companies(${COMPANY_ID})/raceEvents`;
  const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(raceData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create race event: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function updateRaceEvent(
  id: string,
  raceData: Partial<RaceEvent>,
): Promise<void> {
  if (!BASE_URL || !COMPANY_ID || !USERNAME || !PASSWORD) {
    throw new Error('Business Central API configuration is incomplete. Set the API URL, company ID, username, and password.');
  }

  const url = `${BASE_URL}/companies(${COMPANY_ID})/raceEvents(${id})`;
  const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'If-Match': '*',
    },
    body: JSON.stringify(raceData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update race event: ${response.status} - ${errorText}`);
  }
}

export async function deleteRaceEvent(id: string): Promise<void> {
  if (!BASE_URL || !COMPANY_ID || !USERNAME || !PASSWORD) {
    throw new Error('Business Central API configuration is incomplete. Set the API URL, company ID, username, and password.');
  }

  const url = `${BASE_URL}/companies(${COMPANY_ID})/raceEvents(${id})`;
  const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'If-Match': '*',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete race event: ${response.status} - ${errorText}`);
  }
}