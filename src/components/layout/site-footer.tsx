import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { THRIFTUB_INSTAGRAM } from "@/lib/constants";

const CONTACT = {
  email: "uitumenm1023@gmail.com",
  phone: "8827 2822",
  instagram: THRIFTUB_INSTAGRAM,
};

export function SiteFooter() {
  return (
    <footer className="grain mt-auto overflow-hidden border-t border-line bg-night text-ink">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-2xl font-bold tracking-tight">
              thrift<span className="text-glow">ub</span>
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              Улаанбаатарын second hand, vintage дэлгүүрүүдийг нэг дор цуглуулсан платформ. Бид
              бараа зардаггүй — харин танд тохирох дэлгүүрийг олоход тусалдаг.
            </p>
            <div className="mt-6 flex gap-2">
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="ThriftUB Instagram"
                className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-glow hover:text-glow">
                <InstagramIcon className="size-[18px]" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            <div>
              <p className="eyebrow !text-muted">Цэс</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-ink-soft">
                <li><Link className="hover:text-glow" href="/products">Бүх бараа</Link></li>
                <li><Link className="hover:text-glow" href="/shops">Дэлгүүрүүд</Link></li>
                <li><Link className="hover:text-glow" href="/categories">Ангилал</Link></li>
                <li><Link className="hover:text-glow" href="/login">Нэвтрэх</Link></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow !text-muted">Холбоо барих</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-ink-soft">
                <li>
                  <a className="inline-flex items-center gap-2 hover:text-glow" href={`mailto:${CONTACT.email}`}>
                    <Mail className="size-4" strokeWidth={1.5} /> {CONTACT.email}
                  </a>
                </li>
                <li>
                  <a className="inline-flex items-center gap-2 hover:text-glow" href={`tel:+976${CONTACT.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-4" strokeWidth={1.5} /> {CONTACT.phone}
                  </a>
                </li>
                <li className="text-muted">Улаанбаатар хот</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="eyebrow !text-muted">Дэлгүүр эзэмшигчдэд</p>
            <p className="mt-4 font-serif font-semibold tracking-tight text-xl leading-snug">Барааныхаа үзэгчдийг өргөжүүлээрэй.</p>
            <Link href="/register-shop" className={buttonClasses("primary", "md", "mt-6")}>
              Дэлгүүрээ бүртгүүлэх <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <p aria-hidden="true" className="mt-16 -mb-2 font-display text-[19vw] leading-[0.8] font-extrabold tracking-tighter text-sand/70 select-none lg:text-[15.5rem]">
          thrift<span className="text-moss">ub</span>
        </p>

        <div className="flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-muted sm:flex-row sm:justify-between">
          <p>© 2026 ThriftUB. Бүх эрх хуулиар хамгаалагдсан.</p>
          <p>Төлбөр, хүргэлтийг дэлгүүр тус бүр өөрөө зохицуулна.</p>
        </div>
      </Container>
    </footer>
  );
}
