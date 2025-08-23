import type { Data } from "../lib/post_process_helpers";

export default function mapper(data: Data) {
  return {
    ...data,
    cards: data.cards.map((card) => {
      if (card.text.includes("Permanent.")) {
        card.permanent = true;
      }
      return card;
    }),
  };
}
