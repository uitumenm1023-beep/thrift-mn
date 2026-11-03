import Link from "next/link";
import { Clock, EyeOff } from "lucide-react";
import type { Shop } from "@/lib/types";

/** Explains why a shop is not public yet. Renders nothing for approved shops. */
export function ShopStatusNotice({ shop }: { shop: Shop | null }) {
  if (!shop) {
    return (
      <Notice icon={EyeOff} tone="danger" title="Дэлгүүрийн мэдээлэл алга байна">
        <Link href="/dashboard/profile" className="underline underline-offset-2">Дэлгүүрийн мэдээллээ бөглөнө үү</Link>.
      </Notice>
    );
  }
  if (shop.status === "approved") return null;
  if (shop.status === "pending") {
    return (
      <Notice icon={Clock} tone="warning" title="Таны дэлгүүр шалгагдаж байна">
        Админ баталгаажуулсны дараа таны дэлгүүр болон бараа нийтэд харагдана. Энэ хооронд бараагаа нэмж бэлдэж болно.
      </Notice>
    );
  }
  return (
    <Notice icon={EyeOff} tone="danger" title={shop.status === "rejected" ? "Дэлгүүрийн хүсэлт татгалзагдсан" : "Дэлгүүр түр хаагдсан"}>
      Таны дэлгүүр болон бараа одоогоор нийтэд харагдахгүй байна. Дэлгэрэнгүйг Thrift.mn-ийн багаас лавлана уу.
    </Notice>
  );
}

function Notice({ icon: Icon, tone, title, children }: { icon: typeof Clock; tone: "warning" | "danger"; title: string; children: React.ReactNode }) {
  return (
    <div className={`mb-8 flex gap-3 rounded-xl border px-4 py-3.5 text-sm ${tone === "warning" ? "border-warn/30 bg-warn/8 text-warn" : "border-rust/30 bg-rust/5 text-rust"}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 opacity-90">{children}</p>
      </div>
    </div>
  );
}
