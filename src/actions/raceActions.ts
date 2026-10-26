'use server';

import { revalidatePath } from 'next/cache';
import { deleteRaceEvent, updateRaceEvent } from '../lib/bcApi';
import type { RaceEvent } from '../types/f1';

export async function handleDeleteRace(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error('Race ID is required.');
  }

  await deleteRaceEvent(id);
  revalidatePath('/');
}

export async function handleUpdateRace(id: string, formData: FormData): Promise<void> {
  if (!id.trim()) {
    throw new Error('Race ID is required.');
  }

  const raceData: Partial<RaceEvent> = {};
  const stringFields = ['number', 'name', 'circuit', 'raceDate', 'status', 'location'] as const;

  for (const field of stringFields) {
    const value = formData.get(field);
    if (value !== null) {
      if (typeof value !== 'string') {
        throw new Error(`Invalid value for ${field}.`);
      }
      raceData[field] = value.trim();
    }
  }

  const season = formData.get('season');
  if (season !== null && typeof season !== 'string') {
    throw new Error('Invalid season.');
  }
  if (typeof season === 'string' && season.trim()) {
    const parsedSeason = Number(season);
    if (!Number.isInteger(parsedSeason)) {
      throw new Error('Season must be a whole number.');
    }
    raceData.season = parsedSeason;
  }

  await updateRaceEvent(id, raceData);
  revalidatePath('/');
}
