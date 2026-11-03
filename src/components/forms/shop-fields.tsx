import { errorProps, Field, Input, Select, Textarea } from "@/components/ui/field";
import { DISTRICTS } from "@/lib/constants";
import type { Shop } from "@/lib/types";

type Defaults = Partial<Pick<Shop, "name" | "description" | "phone" | "instagram_url" | "facebook_url" | "address" | "district">>;

/** Shop detail inputs shared by registration and the dashboard profile form. */
export function ShopFields({ defaults = {}, errors = {} }: { defaults?: Defaults; errors?: Record<string, string> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Дэлгүүрийн нэр" htmlFor="name" required error={errors.name} className="sm:col-span-2">
        <Input id="name" name="name" defaultValue={defaults.name ?? ""} required minLength={2} maxLength={80} {...errorProps("name", errors.name)} />
      </Field>
      <Field label="Тайлбар" htmlFor="description" error={errors.description} hint="Ямар төрлийн бараа зардаг, онцлог тань юу вэ?" className="sm:col-span-2">
        <Textarea id="description" name="description" defaultValue={defaults.description ?? ""} maxLength={2000} rows={4} {...errorProps("description", errors.description)} />
      </Field>
      <Field label="Утасны дугаар" htmlFor="phone" required error={errors.phone} hint="8 оронтой. Жишээ нь: 99112233">
        <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={defaults.phone ?? ""} required {...errorProps("phone", errors.phone)} />
      </Field>
      <Field label="Дүүрэг" htmlFor="district" error={errors.district}>
        <Select id="district" name="district" defaultValue={defaults.district ?? ""} {...errorProps("district", errors.district)}>
          <option value="">Сонгох</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </Field>
      <Field label="Instagram" htmlFor="instagram_url" error={errors.instagram_url} hint="@хаяг эсвэл холбоос">
        <Input id="instagram_url" name="instagram_url" defaultValue={defaults.instagram_url ?? ""} placeholder="@tanii_delguur" {...errorProps("instagram_url", errors.instagram_url)} />
      </Field>
      <Field label="Facebook" htmlFor="facebook_url" error={errors.facebook_url} hint="Хуудасны нэр эсвэл холбоос">
        <Input id="facebook_url" name="facebook_url" defaultValue={defaults.facebook_url ?? ""} placeholder="facebook.com/tanii.delguur" {...errorProps("facebook_url", errors.facebook_url)} />
      </Field>
      <Field label="Хаяг" htmlFor="address" required error={errors.address} hint="Байр, давхар, тоот, ойролцоох тэмдэгт газар" className="sm:col-span-2">
        <Input id="address" name="address" defaultValue={defaults.address ?? ""} required minLength={5} maxLength={300} {...errorProps("address", errors.address)} />
      </Field>
    </div>
  );
}
