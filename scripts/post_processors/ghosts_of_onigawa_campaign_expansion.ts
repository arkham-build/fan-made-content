import type { Data } from "../lib/post_process_helpers";

const ENCOUNTER_NAME_MAPPING: Record<string, string> = {
  "encounter-candle-b": "Half Light",
  "encounter-conductor-b": "Cursed Conductors",
  "encounter-doctrine-b": "Deadly Doctrines",
  "encounter-fire-b": "Fiery Fate",
  "encounter-fire2-b": "Forged in Flames",
  "encounter-fogfatales-b": "Fearsome Fog",
  "encounter-forestfrights-b": "Forest Frights",
  "encounter-gemini-b": "Memories of Miyu",
  "encounter-grudge-b": "Ghostly Grudges",
  "encounter-guardiansofminakami-b": "Guardians of Minakami",
  "encounter-hands-b": "Handy Horrors",
  "encounter-hauntedwoods-b": "Gifts Ungiven",
  "encounter-house-b": "The House on the Hill",
  "encounter-koi-b": "Sunken Kingdom",
  "encounter-moon2-b": "Lunar Lunacy",
  "encounter-moonlightmadness-b": "Moonlit Madness",
  "encounter-mountain-b": "The End of August",
  "encounter-murderofcrows-b": "Cruel Corvids",
  "encounter-shield-b": "Siege of Onigawa",
  "encounter-snake2-b": "Slumbering Serpents",
  "encounter-snow-b": "Winds of Winter",
  "encounter-sword-b": "The War Eternal",
  "encounter-throne-b": "The Black Harvest",
  "encounter-tidalterror-b": "Watery Woes",
  "encounter-twins-b": "Memories of Mayu",
  "encounter-waterywoes-b": "Tidal Terrors",
  "encounter-well-b": "Downwell",
  "s8-icon-b": "The Shepherd's Flock",
  "scenarioset-1-b": "The Hidden Village",
  "scenarioset-2-b": "Darkened Manor",
  "scenarioset-3-b": "The River Delta",
  "scenarioset-7-b": "The Molten Armory",
};

export default function mapper(data: Data) {
  for (const set of data.encounter_sets) {
    if (ENCOUNTER_NAME_MAPPING[set.name]) {
      set.name = ENCOUNTER_NAME_MAPPING[set.name];
    }
  }

  return data;
}
