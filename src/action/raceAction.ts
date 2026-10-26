'use server';

import { createRaceEvent } from '../lib/bcApi';
import { revalidatePath } from 'next/cache';

export async function handleCreateRace(formData: FormData) {
  const number = formData.get('number') as string;
  const name = formData.get('name') as string;
  const circuit = formData.get('circuit') as string;
  const raceDate = formData.get('raceDate') as string;
  const status = formData.get('status') as string || 'Upcoming';

  try {
    await createRaceEvent({
      number,
      name,
      circuit,
      raceDate,
      status,
    });

    // Revalidate the home route so Next.js fetches the new list from BC immediately
    revalidatePath('/');
  } catch (error: any) {
    console.error('Error creating race:', error);
    throw new Error(error.message || 'Failed to create race event');
  }
}