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

import type { Notification, NotificationType, Role } from "@/lib/api/types";

/**
 * Icon and chip per notification type.
 *
 * The backend emits a wider vocabulary than API_SPEC §6 lists — travel events,
 * booking events and reimbursement events are distinct types — so the maps are
 * keyed on the real set and fall back to the system treatment.
 */
const TYPE_ICON: Record<NotificationType, string> = {
  APPROVAL_REQUIRED: "verified_user",
  TRAVEL_SUBMITTED: "outgoing_mail",
  TRAVEL_APPROVED: "task_alt",
  TRAVEL_REJECTED: "cancel",
  TRAVEL_CANCELLED: "event_busy",
  BOOKING_CREATED: "confirmation_number",
  BOOKING_CONFIRMED: "luggage",
  REIMBURSEMENT_SUBMITTED: "receipt_long",
  REIMBURSEMENT_APPROVED: "account_balance_wallet",
  REIMBURSEMENT_REJECTED: "report",
  REIMBURSEMENT_PAID: "paid",
  SYSTEM: "campaign",
};

const TYPE_TONE: Record<NotificationType, string> = {
  APPROVAL_REQUIRED: "bg-primary-fixed text-on-primary-fixed",
  TRAVEL_SUBMITTED: "bg-surface-container-high text-tertiary",
  TRAVEL_APPROVED: "bg-success-container text-success",
  TRAVEL_REJECTED: "bg-error-container text-on-error-container",
  TRAVEL_CANCELLED: "bg-surface-container-high text-tertiary",
  BOOKING_CREATED: "bg-secondary-fixed text-on-secondary-fixed",
  BOOKING_CONFIRMED: "bg-secondary-fixed text-on-secondary-fixed",
  REIMBURSEMENT_SUBMITTED: "bg-surface-container-high text-tertiary",
  REIMBURSEMENT_APPROVED: "bg-success-container text-success",
  REIMBURSEMENT_REJECTED: "bg-error-container text-on-error-container",
  REIMBURSEMENT_PAID: "bg-primary-fixed text-on-primary-fixed",
  SYSTEM: "bg-surface-container-high text-tertiary",
};

/**
 * Where each type leads, for the role reading it. The backend sends no `link`,
 * so the destination is derived here rather than followed from the payload.
 */
function targetFor(notification: Notification, role: Role) {
  switch (notification.type) {
    case "APPROVAL_REQUIRED":
      return role === "MANAGER" || role === "DEPARTMENT_HEAD" || role === "HRD"
        ? "/approver/approvals"
        : role === "EMPLOYEE"
          ? "/employee/travel"
          : null;
    case "TRAVEL_SUBMITTED":
    case "TRAVEL_APPROVED":
    case "TRAVEL_REJECTED":
    case "TRAVEL_CANCELLED":
      return role === "EMPLOYEE" ? "/employee/travel" : "/travel-admin/requests";
    case "BOOKING_CREATED":
    case "BOOKING_CONFIRMED":
      return "/travel-admin/bookings";
    case "REIMBURSEMENT_SUBMITTED":
    case "REIMBURSEMENT_APPROVED":
    case "REIMBURSEMENT_REJECTED":
    case "REIMBURSEMENT_PAID":
      return role === "FINANCE" ? "/finance/reimbursements" : "/employee/reimbursements";
    default:
      return null;
  }
}

/**
 * Records the read, then navigates — so an alert both clears its badge and
 * lands on the right screen.
 */
function NotificationItem({
  notification,
  role,
}: {
  notification: Notification;
  role: Role;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [read, setRead] = useState(notification.isRead);
  const target = targetFor(notification, role);

  function activate() {
    startTransition(async () => {
      if (!read) {
        const result = await markNotificationReadAction(notification.id);
        if (result.ok) setRead(true);
      }
      if (target) router.push(target);
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
          TYPE_TONE[notification.type],
        )}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {TYPE_ICON[notification.type]}
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
        {notification.createdAt ? (
          <p className="mt-1.5 text-caption text-tertiary">
            {formatDateTime(notification.createdAt)}
          </p>
        ) : null}
      </div>
    </div>
  );

  const item = (
    <li className="border-b border-outline-variant/10 last:border-b-0">
      {target ? (
        <Link
          href={target}
          onClick={(event) => {
            event.preventDefault();
            activate();
          }}
          aria-disabled={pending || undefined}
          className="block"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );

  return item;
}

export function NotificationList({
  notifications,
  role,
}: {
  notifications: Notification[];
  /** The signed-in role, which decides where each type leads. */
  role: Role;
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
          <NotificationItem
            key={notification.id}
            notification={notification}
            role={role}
          />
        ))}
      </ul>
    </div>
  );
}