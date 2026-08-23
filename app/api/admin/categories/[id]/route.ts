import { revalidatePath } from "next/cache";
// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = Number(id);
    const body = await req.json();
    const { name, icon, image, description, displayOrder, isActive } = body;

    const existing = await prisma.category.findUnique({ where: { id: catId } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
      const duplicate = await prisma.category.findFirst({
        where: { slug, id: { not: catId } },
      });
      if (duplicate) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.category.update({
      where: { id: catId },
      data: {
        name: name !== undefined ? name : existing.name,
        slug,
        icon: icon !== undefined ? icon : existing.icon,
        image: image !== undefined ? image : existing.image,
        description: description !== undefined ? description : existing.description,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/products");
    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = Number(id);

    const existing = await prisma.category.findUnique({ where: { id: catId } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Archive into recycle bin
    await prisma.binItem.create({
      data: {
        entityType: "category",
        entityId: catId,
        title: existing.name,
        subtitle: existing.slug,
        payload: existing as any,
        deletedBy: "Admin",
      },
    });

    await prisma.category.delete({ where: { id: catId } });

    return NextResponse.json({ success: true, message: "Category moved to recycle bin." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
