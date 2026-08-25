// app/api/admin/staff/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = Number(id);

    if (isNaN(staffId)) {
      return NextResponse.json({ error: "Invalid staff ID" }, { status: 400 });
    }

    const staffMember = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staffMember) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Safeguard from AGENTS.md: Cannot delete the last remaining Super Admin
    if (staffMember.role === Role.SUPER_ADMIN) {
      const superAdminCount = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Action Blocked: The last remaining Super Admin account cannot be deleted or demoted to prevent complete lockout.",
          },
          { status: 403 }
        );
      }
    }

    // Record in Recycle Bin / Audit Trail
    await prisma.binItem.create({
      data: {
        entityType: "staff",
        entityId: staffId,
        title: `${staffMember.name} (${staffMember.role})`,
        subtitle: staffMember.email,
        payload: {
          id: staffMember.id,
          name: staffMember.name,
          email: staffMember.email,
          role: staffMember.role,
          phone: staffMember.phone,
        },
        deletedBy: "Super Admin",
      },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      success: true,
      message: `Staff account '${staffMember.name}' (${staffMember.email}) was permanently removed.`,
    });
  } catch (error: any) {
    console.error("[Staff DELETE Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = Number(id);
    const body = await req.json();
    const { isDeactivated, role, name, phone, email, password } = body;

    const staffMember = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staffMember) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Safeguard: Cannot deactivate or demote the last Super Admin
    if ((isDeactivated || (role && role !== Role.SUPER_ADMIN)) && staffMember.role === Role.SUPER_ADMIN) {
      const superAdminCount = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Action Blocked: The last remaining Super Admin account cannot be deactivated or demoted.",
          },
          { status: 403 }
        );
      }
    }

    // If isDeactivated is true, set lockedUntil to a distant future date, or null if reactivated
    const lockedUntil = isDeactivated !== undefined
      ? isDeactivated ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) : null
      : staffMember.lockedUntil;

    let passwordHash = staffMember.passwordHash;
    if (password && password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: {
        lockedUntil,
        failedAttempts: isDeactivated ? 99 : 0,
        role: role !== undefined ? role : staffMember.role,
        name: name !== undefined ? name.trim() : staffMember.name,
        phone: phone !== undefined ? phone.trim() : staffMember.phone,
        email: email !== undefined ? email.trim().toLowerCase() : staffMember.email,
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Staff account '${updated.name}' (${updated.role}) updated successfully.`,
      staff: updated,
    });
  } catch (error: any) {
    console.error("[Staff PATCH Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
