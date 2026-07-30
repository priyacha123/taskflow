const express = require("express");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const auth = require("../middleware/auth");
const workspaceMiddleware = require("../middleware/workspace");
const requireRole = require("../middleware/requireRole");
const resend = require("../config/resend");

const router = express.Router();

router.post(
  "/:slug/invite",
  auth,
  workspaceMiddleware,
  requireRole("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { email, role = "MEMBER" } = req.body;

      if (!email) {
        return res.status(400).json({ error: "email is required" });
      }

      const memberCount = await prisma.workspaceMember.count({
        where: { workspaceId: req.workspace.id },
      });

      if (req.workspace.plan === "FREE" && memberCount >= 10) {
        return res.status(403).json({
          error:
            "FREE plan allows 10 members. Upgrade to PRO for unlimited members.",
        });
      }

      const existingMember = await prisma.user.findUnique({
        where: { email },
        include: {
          workspaceMembers: {
            where: { workspaceId: req.workspace.id },
          },
        },
      });

      if (existingMember?.workspaceMembers.length > 0) {
        return res
          .status(409)
          .json({ error: "user is already a member of this workspace" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.invitation.upsert({
        where: {
          workspaceId_email: {
            workspaceId: req.workspace.id,
            email,
          },
        },
        update: { token, role, expiresAt, status: "PENDING" },
        create: {
          email,
          workspaceId: req.workspace.id,
          role,
          token,
          expiresAt,
          invitedById: req.user.userId,
        },
      });

      const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;

      await resend.emails.send({
        from: "TaskFlow <onboarding@resend.dev>",
        to: email,
        subject: `You've been invited to ${req.workspace.name} on TaskFlow`,
        html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>You're invited to join ${req.workspace.name}</h2>
          <p>${req.user.name} has invited you to join their workspace on TaskFlow as a ${role}.</p>
          <a href="${inviteUrl}" style="display:inline-block;background:#111827;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;">
            Accept invitation
          </a>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">
            This invitation expires in 7 days.
          </p>
        </div>
      `,
      });

      res.status(201).json({ message: "invitation sent", email });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/accept", async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "token is required" });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return res.status(404).json({ error: "invitation not found" });
    }

    if (invitation.status !== "PENDING") {
      return res
        .status(400)
        .json({ error: "invitation has already been used" });
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ error: "invitation has expired" });
    }

    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      return res.json({
        valid: true,
        requiresRegistration: true,
        email: invitation.email,
        workspaceName: invitation.workspace.name,
        workspaceSlug: invitation.workspace.slug,
      });
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
        },
      },
    });

    if (existingMember) {
      return res
        .status(409)
        .json({ error: "already a member of this workspace" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });
    });

    res.json({
      message: "invitation accepted",
      workspaceSlug: invitation.workspace.slug,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
