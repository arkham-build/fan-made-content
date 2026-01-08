import type { Data } from "../lib/post_process_helpers";

const POSITION_MAPPING = {
  "b3886a93-c808-4180-beea-3b765a743b50": 190,
  "5a5240f2-181a-44a0-930d-99643e1f75d4": 192,
  "5bfc1033-9e6c-43f4-a300-cbed9ca76ca5": 193,
  "1dd09c03-7162-4dcb-968d-01df17401f0f": 194,
  "99182f5b-54c9-416b-8556-7c1de6f0b04d": 195,
  "6129181a-abba-4ac7-95a6-5128b7521e5c": 196,
  "0d6de71b-fd3f-4ce8-a930-d23384976e63": 197,
  "a5b1ff74-ad00-4ae6-8229-37fafb9e2eac": 198,
  "71d07235-a357-41ca-8b2c-e271cdc8b805": 199,
  "8cc7140d-d1ee-4e98-9695-244705daa80d": 200,
  "ef5d07d9-efea-406d-a973-d52327e2e862": 203,
  "0445ed56-6a93-4317-b9f3-d4295972cdf7": 204,
};

export default function mapper(data: Data) {
  const mappings = Object.entries(POSITION_MAPPING);

  for (const card of data.cards) {
    for (const [id, pos] of mappings) {
      if (card.code.startsWith(id)) {
        card.position = pos;
      }
    }
  }

  for (const set of data.encounter_sets) {
    set.name = titleCase(set.name.replaceAll("-", " "));
  }

  return data;
}

function titleCase(str: string) {
  const SMALL_WORDS = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "if",
    "in",
    "nor",
    "of",
    "on",
    "or",
    "per",
    "the",
    "to",
    "vs",
    "via",
  ]);

  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) => {
      if (i !== 0 && SMALL_WORDS.has(word)) {
        return word.toLocaleLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
