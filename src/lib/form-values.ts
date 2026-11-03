/** Text fields of a FormData (passwords and files left out), for refilling a form. */
export function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !/password/i.test(key)) values[key] = value;
  }
  return values;
}
