
import type { PageLoad } from './$types';

type Observation = {
  id: number;
  name: string;
  meteors: number;
  minutes: number;
  rate: number;
  createdAt: string; 
};

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/observations');

  if (!res.ok) {
    return { observations: [] as Observation[], error: true as const };
  }

  const observations = (await res.json()) as Observation[];
  return { observations, error: false as const };
};
