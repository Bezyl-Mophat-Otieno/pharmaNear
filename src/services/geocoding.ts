import axios from 'axios';
import { GeocodeListSchema, type LocationList } from '@/types/geocoding';
import { normalizeInput } from '@/utils/normalizeInput';

interface JsonResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const CACHE_KEY = 'geocode_cache';
const TTL = 24 * 60 * 60 * 1000; // 24 hours
const API_BASE_URL = import.meta.env.VITE_PUBLIC_BEEQ_API_URL;

class GeocodingService {
  private getCache(): Record<string, { data: LocationList; expiresAt: number }> {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  private setCache(cache: Record<string, { data: LocationList; expiresAt: number }>) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  private getCachedData(key: string): LocationList | undefined {
    const cache = this.getCache();
    const entry = cache[key];
    
    if (!entry) return undefined;
    
    if (entry.expiresAt < Date.now()) {
      delete cache[key];
      this.setCache(cache);
      return undefined;
    }
    
    return entry.data;
  }

  private cacheData(key: string, data: LocationList) {
    const cache = this.getCache();
    cache[key] = { data, expiresAt: Date.now() + TTL };
    this.setCache(cache);
  }

  async geocode(searchParam: string): Promise<JsonResponse<LocationList>> {
    try {
      const normalizedInput = normalizeInput(searchParam);
      
      // Check cache first
      const cached = this.getCachedData(normalizedInput);
      if (cached) {
        return {
          success: true,
          message: `Showing recently searched locations for "${searchParam}".`,
          data: cached,
        };
      }

      // Fetch from backend API
      const { data: response } = await axios.get<JsonResponse<LocationList>>(
        `${API_BASE_URL}geocoding/search`,
        {
          params: {
            q: normalizedInput,
            limit: 5
          }
        }
      );

      if (response.success && response.data.length > 0) {
        const parsed = GeocodeListSchema.parse(response.data);
        this.cacheData(normalizedInput, parsed);
        
        return {
          success: true,
          message: `We successfully found locations matching "${searchParam}".`,
          data: parsed,
        };
      }

      return response;
    } catch (error) {
      let userMessage =
        'An unexpected error occurred while searching for locations. Please try again later.';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          userMessage = `No locations found for "${searchParam}".`;
        } else if (error.response?.status === 401) {
          userMessage = 'Invalid API key. Please check your configuration.';
        } else if (error.response?.data?.message) {
          userMessage = error.response.data.message;
        } else {
          userMessage = `Unable to fetch location information for "${searchParam}" at this time.`;
        }
      }

      return { success: false, message: userMessage, data: [] };
    }
  }
}

export default new GeocodingService();
