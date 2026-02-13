import { z } from 'zod';

export const GeocodeSchema = z.object({
  name: z.string(),
  country: z.string(),
  state: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
});

export const GeocodeListSchema = z.array(GeocodeSchema);

export type Location = z.infer<typeof GeocodeSchema>;
export type LocationList = z.infer<typeof GeocodeListSchema>;

export interface CacheEntry {
  data: LocationList;
  expiresAt: number;
}
