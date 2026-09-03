// app/page.tsx - Server-rendered Homepage with 0ms Instant Product Delivery
import { getStorefrontHomeData } from "@/lib/server/storefront-data";
import HomePageClient from "@/components/storefront/HomePageClient";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const initialData = await getStorefrontHomeData();

  return <HomePageClient initialData={initialData} />;
}
