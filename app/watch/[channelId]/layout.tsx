import { Metadata } from 'next';
import { fetchChannels } from '@/lib/channels';

export async function generateMetadata({ params }: { params: { channelId: string } }): Promise<Metadata> {
  const channelId = decodeURIComponent(params.channelId);
  const channels = await fetchChannels();
  const channel = channels.find((c) => c.id === channelId);

  if (!channel) {
    return {
      title: 'PLAYTV • Chaîne introuvable',
    };
  }

  return {
    title: `PLAYTV • ${channel.name}`,
    description: `Regardez ${channel.name} en direct sur PLAYTV.`,
    openGraph: {
      title: `PLAYTV • ${channel.name}`,
      description: `Regardez ${channel.name} en direct sur PLAYTV.`,
      images: channel.logo ? [channel.logo] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `PLAYTV • ${channel.name}`,
      description: `Regardez ${channel.name} en direct sur PLAYTV.`,
      images: channel.logo ? [channel.logo] : [],
    },
  };
}

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
