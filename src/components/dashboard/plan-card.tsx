import { InstagramIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { PAID_PLANS, PLANS, THRIFTUB_INSTAGRAM } from "@/lib/constants";
import { cn, formatDate, formatPrice, planState } from "@/lib/format";
import type { Shop } from "@/lib/types";

/** Shop owner's package: limit, usage, end date and how to buy more. */
export function PlanCard({ shop, available }: { shop: Shop; available: number }) {
  const state = planState(shop);
  const info = PLANS[shop.plan];
  const limit = state.expired ? 0 : info.limit;
  const full = limit !== null && available >= limit;
  const pct = limit ? Math.min(100, Math.round((available / limit) * 100)) : 100;

  return (
    <section className="mb-8 rounded-2xl border border-line bg-paper-deep/40 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="eyebrow !text-muted">Таны багц</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">
            {info.label}
            {shop.plan === "trial" && <span className="ml-2 text-base font-medium text-glow">үнэгүй</span>}
          </p>
          <p className={cn("mt-1 text-sm", state.expired ? "text-rust" : "text-muted")}>
            {state.expired
              ? "Багцын хугацаа дууссан. Шинэ бараа нэмэх боломжгүй."
              : state.expiresAt
                ? `${formatDate(shop.plan_expires_at!)} хүртэл · ${state.daysLeft} хоног үлдсэн`
                : "Дэлгүүр баталгаажмагц эхний 1 сар үнэгүй эхэлнэ."}
          </p>

          <div className="mt-4 max-w-md">
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-soft">Худалдаанд байгаа бараа</span>
              <span className={cn("font-medium", full && "text-rust")}>
                {available} / {limit === null ? "∞" : limit}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
              <div className={cn("h-full rounded-full", full ? "bg-rust" : "bg-glow")} style={{ width: `${pct}%` }} />
            </div>
            {full && !state.expired && (
              <p className="mt-2 text-[13px] text-rust">Багцын бараа дүүрсэн. Зарагдсан барааг тэмдэглэх эсвэл багцаа ахиулна уу.</p>
            )}
          </div>
        </div>

        <div className="lg:w-[22rem]">
          <ul className="grid gap-2 text-[13px]">
            {PAID_PLANS.map((p) => (
              <li key={p} className={cn("flex items-center justify-between rounded-xl border px-3 py-2", p === shop.plan && !state.expired ? "border-glow" : "border-line")}>
                <span><b className="font-semibold">{PLANS[p].label}</b> · {PLANS[p].limit ?? "∞"} бараа</span>
                <span className="text-muted">сард {formatPrice(PLANS[p].price)}</span>
              </li>
            ))}
          </ul>
          <a href={THRIFTUB_INSTAGRAM} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "md", "mt-3 w-full")}>
            <InstagramIcon className="size-4" /> Instagram-аар DM бичих
          </a>
          <p className="mt-2 text-center text-[12px] text-muted">Багц авах, сунгах бол @ub_thriftmn руу DM бичээрэй. Том багцын бараа сайт дээр түрүүлж харагдана.</p>
        </div>
      </div>
    </section>
  );
}
