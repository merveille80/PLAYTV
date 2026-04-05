import { NextResponse } from 'next/server';

interface IPTVOrgChannel {
  id: string;
  name: string;
  categories?: string[];
  country?: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const category = searchParams.get('category');
  const limit = searchParams.get('limit');

  try {
    const res = await fetch('https://iptv-org.github.io/api/channels.json', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('API failed');
    const all: IPTVOrgChannel[] = await res.json();

    let filtered = [...all];

    if (country) filtered = filtered.filter((c) => c.country === country);
    if (category) filtered = filtered.filter((c) => c.categories?.includes(category));

    if (limit && limit !== 'all') {
      const parsedLimit = Number.parseInt(limit, 10);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        filtered = filtered.slice(0, parsedLimit);
      }
    }

    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json([]);
  }
}
