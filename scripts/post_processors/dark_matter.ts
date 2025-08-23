import type { Card, Data } from "../lib/post_process_helpers";

const scanningStoryIds = [
  "7345f12b-9b9b-4c9e-8cae-bc33282ca5f1-back",
  "483b591b-84a8-4f4d-a459-459dedbbfb6a-back",
  "d120e254-8da1-446e-971d-adeaa89852e2-back",
];

export default function mapper(data: Data) {
  const cards: Card[] = [];

  // 1. Remove card instances for scanning backs and add their images to the front card as back_image.
  // 2. Remove <center>, <right>, and <left> from the card text.
  for (const [i, card] of data.cards.entries()) {
    const isScanningBack =
      scanningStoryIds.includes(card.code) ||
      (card.hidden && !card.text && !card.traits && !card.flavor);

    if (isScanningBack) {
      const front = data.cards[i - 1];
      front.back_link = undefined;
      front.deck_limit = undefined;
      front.back_image_url = card.image_url;
      front.back_thumbnail_url = card.thumbnail_url;
    } else {
      if (card.text) {
        card.text = card.text.replaceAll(/<(center|left|right)>/g, "");
      }

      if (
        card.double_sided &&
        !card.back_text &&
        !card.back_traits &&
        !card.back_flavor
      ) {
        card.double_sided = undefined;
      }

      cards.push(card);
    }
  }

  return {
    ...data,
    cards,
  };
}
