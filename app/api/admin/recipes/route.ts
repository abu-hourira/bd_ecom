// app/api/admin/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, recipes });
  } catch (error: any) {
    console.error("[Admin Recipes GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      imageUrl,
      category,
      prepTimeMinutes,
      servings,
      difficulty,
      healthBenefits,
      instructions,
      linkedProductIds,
      bundleDiscountPercent,
      isFeatured,
      isActive,
    } = body;

    const genSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (id) {
      const updated = await prisma.recipe.update({
        where: { id: Number(id) },
        data: {
          title,
          slug: genSlug,
          imageUrl,
          category: category || "healthy_cooking",
          prepTimeMinutes: Number(prepTimeMinutes || 15),
          servings: Number(servings || 4),
          difficulty: difficulty || "Easy",
          healthBenefits,
          instructions: instructions || [],
          linkedProductIds: linkedProductIds || [],
          bundleDiscountPercent: Number(bundleDiscountPercent || 5),
          isFeatured: Boolean(isFeatured),
          isActive: isActive !== false,
        },
      });
      return NextResponse.json({ success: true, message: "Recipe updated successfully!", recipe: updated });
    } else {
      const created = await prisma.recipe.create({
        data: {
          title,
          slug: genSlug,
          imageUrl: imageUrl || "",
          category: category || "healthy_cooking",
          prepTimeMinutes: Number(prepTimeMinutes || 15),
          servings: Number(servings || 4),
          difficulty: difficulty || "Easy",
          healthBenefits: healthBenefits || "",
          instructions: instructions || [],
          linkedProductIds: linkedProductIds || [],
          bundleDiscountPercent: Number(bundleDiscountPercent || 5),
          isFeatured: Boolean(isFeatured),
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, message: "Recipe created successfully!", recipe: created });
    }
  } catch (error: any) {
    console.error("[Admin Recipes POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Recipe ID required" }, { status: 400 });

    await prisma.recipe.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "Recipe deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
