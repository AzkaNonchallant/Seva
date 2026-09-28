"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";

import type { Notification } from "@/lib/api/types";

const TYPE_ICON: Record<NonNullable<Notification["type"]>, string> = {
  APPROVAL: "verified_user",
  BOOKING: "confirmation_number",
  REIMBURSEMENT: "account_balance_wallet",
  SYSTEM: "campaign",
};

const TYPE_TONE: Record<NonNullable<Notification["type"]>, string> = {
  APPROVAL: "bg-primary-fixed text-on-primary-fixed",
  BOOKING: "bg-secondary-fixed text-on-secondary-fixed",
  REIMBURSEMENT: "bg-success-container text-success",
  SYSTEM: "bg-surface-container-high text-tertiary",
};

/**
 * Records the read, then follows the link — so an Admin Travel alert about
 * `TR-2026-041` both clears its badge and lands on the right screen.
 */
function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [read, setRead] = useState(notification.isRead);

  function activate() {
    startTransition(async () => {
      if (!read) {
        const result = await markNotificationReadAction(notification.id);
        if (result.ok) setRead(true);
      }
      if (notification.link) router.push(notification.link);
      else router.refresh();
    });
  }

  const body = (
    <div
      className={cn(
        "flex items-start gap-3 p-md transition-colors",
        read
          ? "bg-surface-container-lowest hover:bg-surface-container-low"
          : "bg-primary-fixed/20 hover:bg-primary-fixed/40",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          TYPE_TONE[notification.type ?? "SYSTEM"],
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {TYPE_ICON[notification.type ?? "SYSTEM"]}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-label-md",
              read
                ? "font-medium text-on-surface-variant"
                : "font-bold text-on-surface",
            )}
          >
            {notification.title}
          </p>
          {!read ? (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary-container"
              aria-label="Belum dibaca"
            />
          ) : null}
        </div>
        <p className="mt-0.5 text-caption leading-relaxed text-on-surface-variant">
          {notification.message}
        </p>
        <p className="mt-1.5 text-caption text-tertiary">
          {formatDateTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (!notification.link) {
    return (
      <li className="border-b border-outline-variant/10 last:border-b-0">
        {body}
      </li>
    );
  }

  return (
    <li className="border-b border-outline-variant/10 last:border-b-0">
      <Link
        href={notification.link}
        onClick={(event) => {
          event.preventDefault();
          activate();
        }}
        aria-disabled={pending || undefined}
        className="block"
      >
        {body}
      </Link>
    </li>
  );
}

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [, startTransition] = useTransition();
  const [showRead, setShowRead] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const rows = showRead ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/15 p-md">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showRead ? "outline" : "ghost"}
            onClick={() => setShowRead(true)}
          >
            Semua ({notifications.length})
          </Button>
          <Button
            size="sm"
            variant={showRead ? "ghost" : "outline"}
            onClick={() => setShowRead(false)}
          >
            Belum dibaca ({unreadCount})
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          icon="done_all"
          disabled={!unreadCount}
          onClick={() =>
            startTransition(async () => {
              await markAllNotificationsReadAction();
            })
          }
        >
          Tandai semua dibaca
        </Button>
      </div>

      <ul>
        {rows.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </ul>
    </div>
  );
}
