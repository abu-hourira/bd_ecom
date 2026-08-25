import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { verifySessionToken } from "@/lib/authSession";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("enmar_session")?.value;
    let liveRole: string | null = null;

    if (token) {
      const session = verifySessionToken(token);
      if (session?.userId) {
        const liveUser = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true, role: true, name: true, email: true },
        });
        if (liveUser) {
          liveRole = liveUser.role;
        }
      }
    }

    const permissions = await prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { module: "asc" }],
    });

    return NextResponse.json({ success: true, permissions, liveRole });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, module, canRead, canCreate, canEdit, canDelete } = body;

    if (role === Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Super Admin permissions cannot be restricted." }, { status: 400 });
    }

    const updateData: any = {};
    if (canRead !== undefined) updateData.canRead = Boolean(canRead);
    if (canCreate !== undefined) updateData.canCreate = Boolean(canCreate);
    if (canEdit !== undefined) updateData.canEdit = Boolean(canEdit);
    if (canDelete !== undefined) updateData.canDelete = Boolean(canDelete);

    const updated = await prisma.rolePermission.upsert({
      where: {
        role_module: {
          role: role as Role,
          module,
        },
      },
      update: updateData,
      create: {
        role: role as Role,
        module,
        canRead: canRead !== undefined ? Boolean(canRead) : true,
        canCreate: canCreate !== undefined ? Boolean(canCreate) : false,
        canEdit: canEdit !== undefined ? Boolean(canEdit) : false,
        canDelete: canDelete !== undefined ? Boolean(canDelete) : false,
      },
    });

    return NextResponse.json({ success: true, permission: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
