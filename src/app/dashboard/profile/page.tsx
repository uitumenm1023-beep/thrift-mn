import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ShopProfileForm } from "@/components/forms/shop-profile-form";
import { PageHeader } from "@/components/dashboard/shell";
import { ShopStatusNotice } from "@/components/dashboard/shop-status-notice";
import { getCurrentUser, getOwnShop } from "@/lib/data/owner";

export const instant = false;

export const metadata = { title: "Дэлгүүрийн мэдээлэл" };

export default async function ShopProfilePage() {
  const [user, shop] = await Promise.all([getCurrentUser(), getOwnShop()]);
  if (!user) return null;
  return (
    <>
      <PageHeader
        title="Дэлгүүрийн мэдээлэл"
        description="Худалдан авагчид энэ мэдээллээр тантай холбогдоно."
        action={
          shop?.status === "approved" && (
            <Link href={`/shops/${shop.id}`} className="inline-flex items-center gap-1 border-b border-ink/30 pb-0.5 text-sm font-medium hover:border-glow hover:text-glow">
              Нийтийн хуудас <ArrowUpRight className="size-3.5" />
            </Link>
          )
        }
      />
      <ShopStatusNotice shop={shop} />
      <ShopProfileForm userId={user.id} shop={shop} />
    </>
  );
}
