import { ApodData } from '../types/apod';

const BACKEND_APOD_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/apod';

export async function fetchApod(date?: string, lang?: string): Promise<ApodData> {
  const url = new URL(BACKEND_APOD_URL);
  if (date) url.searchParams.append('date', date);
  if (lang) url.searchParams.append('lang', lang);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend API error (${response.status}) at ${url.toString()}: ${errorText}`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchRandomApod(lang?: string): Promise<ApodData> {
  const url = new URL(`${BACKEND_APOD_URL}/random`);
  if (lang) url.searchParams.append('lang', lang);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch random discovery');
  const result = await response.json();
  return result.data;
}

export async function fetchApodRange(
  start_date: string,
  end_date: string,
  lang?: string,
): Promise<ApodData[]> {
  const url = new URL(`${BACKEND_APOD_URL}/range`);
  url.searchParams.append('start_date', start_date);
  url.searchParams.append('end_date', end_date);
  if (lang) url.searchParams.append('lang', lang);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch weekly APODs');
  const result = await response.json();
  return result.data;
}
