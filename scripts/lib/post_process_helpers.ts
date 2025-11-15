import path from "node:path";
import fs from "node:fs";

export type Card = {
  // biome-ignore lint/suspicious/noExplicitAny: script usage
  [key: string]: any;
};

type Pack = {
  code: string;
  name: string;
  date_release: string;
  icon_url: string;
};

type EncounterSet = {
  code: string;
  name: string;
  icon_url: string;
};

export type Data = {
  cards: Card[];
  packs: Pack[];
  encounter_sets: EncounterSet[];
};

export type Mapper = (data: Data) => Data;

export class Processor {
  constructor(
    private fileName: string,
    private mapper?: Mapper,
  ) {}

  run() {
    const filePath = path.join(
      process.cwd(),
      "projects",
      `${this.fileName}.json`,
    );

    const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (this.mapper) {
      fileContent.data = this.mapper(fileContent.data);
    }

    fileContent.data.cards = fileContent.data.cards.map((card: Card) => {
      if (card.text) card.text = fixCommonTextIssues(card.text);
      if (card.back_text) card.back_text = fixCommonTextIssues(card.back_text);
      if (card.subname) card.subname = fixCommonTextIssues(card.subname);
      //if (card.traits) card.traits = fixTraits(card.traits);
      //if (card.back_traits) card.back_traits = fixTraits(card.back_traits);
      card.name = fixCommonTextIssues(card.name);
      if (card.flavor) card.flavor = fixCommonTextIssues(card.flavor);
      if (card.back_flavor) {
        card.back_flavor = fixCommonTextIssues(card.back_flavor);
      }
      return card;
    });

    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
  }
}

function fixTraits(traits: string) {
  const next = traits
    .split(".")
    .map((trait) => trait.trim())
    .filter((trait) => trait.length > 0)
    .join(". ");

  if (next.endsWith(".") || next.endsWith("?") || next.endsWith("!")) {
    return next;
  }

  return `${next}.`;
}

function fixCommonTextIssues(str: string) {
  return str
    .replaceAll("\n     \n", "\n")
    .replaceAll("<hdr>", "<b>")
    .replaceAll("</hdr>", "</b>")
    .replaceAll("<right>", "")
    .replaceAll("</right>", "")
    .replaceAll("<left>", "")
    .replaceAll("</left>", "")
    .replaceAll("<center>", "")
    .replaceAll("</center>", "")
    .replaceAll("<hdr></hdr>", "")
    .replaceAll("<b></b>", "")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("<res>", "→R")
    .replaceAll("</blockquote><hr>", "</blockquote>\n");
}
