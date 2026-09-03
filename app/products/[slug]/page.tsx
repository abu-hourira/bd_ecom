// app/products/[slug]/page.tsx - Server-rendered Product Detail Page with 0ms Instant Load & Rich SEO
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontProductBySlug } from "@/lib/server/storefront-data";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";
import { getProductImages, getSafeImageUrl } from "@/lib/utils";

export const revalidate = 60; // ISR revalidate every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getStorefrontProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | ENMAR",
      description: "Organic product not found",
    };
  }

  const images = getProductImages(product.images);
  const mainImage = images[0] ? getSafeImageUrl(images[0]) : "/assets/logo/logo.png";
  const desc =
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    `${product.name} - ১০০% বিশুদ্ধ ও অর্গানিক। ক্যাশ অন ডেলিভারিতে সারাদেশে ডেলিভারি।`;

  return {
    title: `${product.name} | ১০০% খাঁটি অর্গানিক ফুড - ENMAR`,
    description: desc,
    openGraph: {
      title: `${product.name} | ENMAR Organic Food`,
      description: desc,
      images: [{ url: mainImage, width: 800, height: 600, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ENMAR Organic Food`,
      description: desc,
      images: [mainImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { product, related } = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      initialProduct={product}
      initialRelated={related}
      slug={slug}
    />
  );
}
