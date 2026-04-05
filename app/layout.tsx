import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLAYTV — Votre TV, sans limites",
  description: "La plateforme IPTV streaming pour les Congolais. Des centaines de chaînes africaines et internationales à 20 000 FC pour 2 mois.",
  keywords: ["IPTV", "streaming", "Congo", "chaînes africaines", "Canal+", "alternative"],
  openGraph: {
    title: "PLAYTV — Votre TV, sans limites",
    description: "Regardez tout. Payez moins. Des centaines de chaînes à 20 000 FC / 2 mois.",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
