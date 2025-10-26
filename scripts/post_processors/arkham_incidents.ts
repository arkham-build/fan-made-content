import type { Data } from "../lib/post_process_helpers";

export default function mapper(data: Data) {
  for (const set of data.encounter_sets) {
    set.name = set.name.split("\\").at(-1) ?? set.name;
    set.code = rewriteCode(set.code);
  }

  for (const card of data.cards) {
    if (card.encounter_code) {
      card.encounter_code = rewriteCode(card.encounter_code);
    }
  }

  return data;
}

function rewriteCode(code: string): string {
  const id = code.slice(0, 36);
  const rest = code.slice(36);
  const suffix = rest.includes("_icons_")
    ? `-${rest.split("_icons_").at(-1) ?? ""}`
    : rest;
  return `${id}${suffix}`;
}
