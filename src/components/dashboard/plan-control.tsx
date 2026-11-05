"use client";

import { useState } from "react";
import { setShopPlan } from "@/app/admin/actions";
import { ActionButton } from "@/components/dashboard/action-button";
import { Select } from "@/components/ui/field";
import { PAID_PLANS, PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { ShopPlan } from "@/lib/types";

const MONTHS = [1, 3, 6, 12];

/** Admin: turn on or extend a shop's package after it has paid. */
export function PlanControl({ shopId, plan }: { shopId: string; plan: ShopPlan }) {
  const [next, setNext] = useState<ShopPlan>(plan === "trial" ? "pro" : plan);
  const [months, setMonths] = useState(1);

  return (
    <div className="flex flex-wrap items-start gap-2">
      <label className="sr-only" htmlFor={`plan-${shopId}`}>Багц</label>
      <Select id={`plan-${shopId}`} value={next} onChange={(e) => setNext(e.target.value as ShopPlan)} className="h-9 w-auto py-1 text-[13px]">
        {PAID_PLANS.map((p) => (
          <option key={p} value={p}>{PLANS[p].label} · {formatPrice(PLANS[p].price)}</option>
        ))}
      </Select>
      <label className="sr-only" htmlFor={`months-${shopId}`}>Хугацаа</label>
      <Select id={`months-${shopId}`} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="h-9 w-auto py-1 text-[13px]">
        {MONTHS.map((m) => <option key={m} value={m}>{m} сар</option>)}
      </Select>
      <ActionButton
        action={() => setShopPlan(shopId, next, months)}
        variant="outline"
        confirm={`${PLANS[next].label} багцыг ${months} сараар идэвхжүүлэх үү?`}
      >
        {next === plan ? "Сунгах" : "Идэвхжүүлэх"}
      </ActionButton>
    </div>
  );
}
