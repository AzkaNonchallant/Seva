/**
 * Re-export of the notification calls, which now live beside the other §6
 * services in `approval.ts`. This module path is kept so existing imports —
 * and the mock removal — do not have to touch every call site.
 */
export {
  getUnreadCount,
  listNotifications,
  markAllAsRead,
  markAsRead,
} from "./approval";