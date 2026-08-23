import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, module, canRead, canCreate, canEdit, canDelete } = body;

    if (role === Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Super Admin permissions cannot be restricted." }, { status: 400 });
    }

    const updated = await prisma.rolePermission.upsert({
      where: {
        role_module: {
          role: role as Role,
          module,
        },
      },
      update: {
        canRead: Boolean(canRead),
        canCreate: Boolean(canCreate),
        canEdit: Boolean(canEdit),
        canDelete: Boolean(canDelete),
      },
      create: {
        role: role as Role,
        module,
        canRead: Boolean(canRead),
        canCreate: Boolean(canCreate),
        canEdit: Boolean(canEdit),
        canDelete: Boolean(canDelete),
      },
    });

    return NextResponse.json({ success: true, permission: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
