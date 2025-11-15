import type { Data } from "../lib/post_process_helpers";

const CARD_POOL_EXTENSIONS = {
  "70b5bb78-8b12-40e4-a567-85f6996e836f": "card",
  "c0cf9323-5f01-4d19-a967-e09a1b439414": "card",
  "798eba12-1ccb-4a52-87d8-b4fc262e5916": "card",
  "fdd09839-a4cd-4144-82eb-e8232950c31f": "card",
  "0ddf93ab-39ef-4b3d-9e73-fcb300f5fa4b": "card",
  "cefcfe23-7514-42c2-a70e-6e9967796414": "card",
  "0cb1d7a3-56e1-44d3-9373-a5acc2045ada": "card",
  "581e4bf9-2736-4086-8364-93399201a510": "card",
  "676974a0-aada-424f-b1bf-295c20782614": "card",
  "64cad566-0a68-4064-9a7f-7d6c321cdf40": "card",
  "a9cc4297-f55d-48f6-b955-5e30a9e38dfb": "card",
  "90b02ba0-c18c-4d84-9e9a-72e2270697e1": "card",
  "e122e372-8c4c-4a8d-98df-c710c93b3c36": "card",
  "726c3e6f-fcbf-4f3e-9b57-c82897a1f27d": "card",
  "3a6c43c8-79c9-43d8-bdc5-22a52d89a2b4": "card",
  "e499384b-46a9-4663-9e4e-583ffefd8e08": "card",
  "842af37e-2eb0-4c10-8153-2b8535af79fd": "card",
  "0d6ba8a8-b12b-4893-b608-9f3a73e758fb": "card",
  "ec4e75ed-37de-420e-b379-25b3ef22954e": "card",
  "f960b2ab-1198-44ef-a30a-f844db24a3fa": "card",
  "e4323553-6250-4e6a-848d-47030035ccc3": "card",
  "1d87b39b-c1b7-4094-b5bd-43304b72a791": {
    type: "card",
    selections: [
      "10126",
      "10022",
      "10024",
      "10038",
      "10105",
      "10019",
      "07193",
      "07262",
      "10125",
      "10075",
      "07017",
      "07191",
      "07118",
      "07032",
      "07034",
      "07018",
      "07020",
      "07023",
      "07026",
      "07028",
      "07030",
      "07037",
      "07110",
      "07112",
      "07119",
      "07120",
      "07116",
      "07117",
      "07122",
      "07155",
      "07156",
      "07160",
      "07190",
      "07221",
      "07194",
      "07195",
      "07197",
      "07220",
      "07225",
      "07226",
      "07229",
      "07227",
      "07230",
      "07271",
      "07269",
      "07272",
      "07273",
      "07301",
      "07309",
      "07310",
      "10046",
      "07109",
      "07031",
      "07192",
      "07302",
      "07222",
      "07308",
      "10055",
      "10098",
      "10099",
      "07113",
      "07224",
      "10029",
      "10104",
      "07306",
      "07036",
      "07263",
      "07268",
      "10068",
      "10056",
      "07153",
      "07019",
      "10034",
      "10124",
      "10085",
      "10119",
      "10131",
      "07035",
      "07228",
      "10025",
      "10092",
      "10095",
      "10052",
    ],
  },
};

export default function mapper(data: Data) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const encounterSetCache: Record<string, any> = {};

  const cards = data.cards.map((card) => {
    const type = CARD_POOL_EXTENSIONS[card.code];
    if (typeof type === "string") {
      card.card_pool_extension = { type };
    } else if (type) {
      card.card_pool_extension = type;
    }

    if (card.text?.includes("Ultimatum") || card.text?.includes("Permanent.")) {
      card.permanent = true;
    }

    if (!card.encounter_code) {
      const pack = data.packs.find((p) => p.code === card.pack_code);

      const encounterSet = encounterSetCache[card.pack_code] || {
        code: crypto.randomUUID(),
        // biome-ignore lint/style/noNonNullAssertion: script
        name: pack!.name,
        // biome-ignore lint/style/noNonNullAssertion: script
        icon_url: pack!.icon_url,
      };

      encounterSetCache[card.pack_code] = encounterSet;
      card.encounter_code = encounterSet.code;
      card.encounter_position = card.position;
    }

    // biome-ignore lint/performance/noDelete: script usage
    delete card.xp;

    return card;
  });

  const encounter_sets = Object.values(encounterSetCache);

  return {
    cards,
    packs: data.packs,
    encounter_sets: [...data.encounter_sets, ...encounter_sets],
  };
}
