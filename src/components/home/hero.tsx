import Image from "@/components/ui/smart-image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/misc";
import { HERO_IMAGE, HERO_SECONDARY_IMAGE } from "@/lib/demo-data";

const TICKER = ["Vintage", "Second hand", "Pre-loved", "One of a kind", "Wear it again", "Ulaanbaatar", "ThriftUB"];

export function Hero() {
  return (
    <>
      <section className="glow-bg grain relative -mt-16 overflow-hidden pt-16 sm:-mt-[72px] sm:pt-[72px]">
        <Container className="grid items-center gap-12 pt-10 pb-16 sm:pt-14 lg:min-h-[calc(100svh-72px)] lg:grid-cols-12 lg:gap-10 lg:pb-20">
          <div className="animate-fade-up lg:col-span-7">
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-glow shadow-[0_0_12px_rgb(216_240_106)]" aria-hidden="true" />
              Улаанбаатар · Second hand · Vintage
            </p>
            <h1 className="mt-6 font-display text-[2.15rem] leading-[1.02] font-bold tracking-tight text-balance uppercase sm:text-[3.4rem] xl:text-[4.4rem]">
              Таны хайж байсан хувцас <span className="text-glow">энд</span> байна.
            </h1>
            <p className="mt-7 max-w-lg text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
              Хотын шилдэг second hand, vintage дэлгүүрүүдийн барааг нэг дороос үзээд, таалагдсан
              хувцасныхаа дэлгүүртэй шууд холбогдоорой.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" size="lg">
                Хувцас үзэх <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/shops" variant="outline" size="lg">
                Дэлгүүрүүдтэй танилцах
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            {/* Arch-shaped frames echo the pill shapes of the brand palette */}
            <div className="relative ml-auto aspect-[3/4] w-[82%] overflow-hidden rounded-t-full rounded-b-[2rem] bg-sand ring-1 ring-line">
              <Image
                src={HERO_IMAGE}
                alt="Саарал оверсайз hoodie"
                fill
                priority
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="animate-fade-in object-cover"
              />
            </div>
            <div className="absolute bottom-[-6%] left-0 aspect-[3/4] w-[42%] overflow-hidden rounded-t-full rounded-b-[1.5rem] bg-sand ring-8 ring-paper">
              <Image src={HERO_SECONDARY_IMAGE} alt="" fill sizes="(min-width: 1024px) 16vw, 36vw" className="object-cover" />
            </div>
            <p className="absolute top-[12%] left-[4%] -rotate-6 rounded-full bg-glow px-4 py-2 font-mono text-[11px] font-medium tracking-[0.12em] text-night uppercase shadow-[0_0_30px_-4px_rgb(216_240_106/0.6)]">
              Дахин өмсөх нь загвар
            </p>
          </div>
        </Container>
      </section>

      <div className="overflow-hidden border-y border-line bg-glow py-3 text-night" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((word, i) => (
            <span key={i} className="flex items-center gap-8 font-display text-sm font-bold tracking-tight uppercase sm:text-base">
              {word} <span className="text-moss">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
