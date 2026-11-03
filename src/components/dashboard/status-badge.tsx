import { Badge } from "@/components/ui/misc";
import { SHOP_STATUS_LABELS } from "@/lib/constants";
import type { ShopStatus } from "@/lib/types";

const TONE = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
  suspended: "danger",
} as const;

export function ShopStatusBadge({ status, className }: { status: ShopStatus; className?: string }) {
  return <Badge tone={TONE[status]} className={className}>{SHOP_STATUS_LABELS[status]}</Badge>;
}
