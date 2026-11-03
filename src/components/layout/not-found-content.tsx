import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, EmptyState } from "@/components/ui/misc";

export function NotFoundContent() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={SearchX}
        title="Хуудас олдсонгүй"
        description="Таны хайсан хуудас устсан, зарагдсан эсвэл хаяг нь буруу байж магадгүй."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/products">Бараа үзэх</ButtonLink>
            <ButtonLink href="/" variant="outline">Нүүр хуудас</ButtonLink>
          </div>
        }
      />
    </Container>
  );
}
