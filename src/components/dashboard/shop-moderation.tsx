import { setShopStatus } from "@/app/admin/actions";
import { ActionButton } from "@/components/dashboard/action-button";
import type { ShopStatus } from "@/lib/types";

/** Approve / reject / suspend buttons appropriate for the shop's status. */
export function ShopModeration({ shopId, status }: { shopId: string; status: ShopStatus }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      {status !== "approved" && (
        <ActionButton action={setShopStatus.bind(null, shopId, "approved")} variant="primary">
          {status === "suspended" ? "Дахин нээх" : "Баталгаажуулах"}
        </ActionButton>
      )}
      {status === "pending" && (
        <ActionButton action={setShopStatus.bind(null, shopId, "rejected")} variant="danger" confirm="Татгалзах уу?">
          Татгалзах
        </ActionButton>
      )}
      {status === "approved" && (
        <ActionButton action={setShopStatus.bind(null, shopId, "suspended")} variant="danger" confirm="Түр хаах уу? Бараа нь нуугдана.">
          Түр хаах
        </ActionButton>
      )}
    </div>
  );
}
