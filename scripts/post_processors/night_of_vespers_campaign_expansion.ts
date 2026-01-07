import type { Data } from "../lib/post_process_helpers";

const ENCOUNTER_CODE_MAPPINGS = {
  "f565e2b2-97df-420c-ae07-7586fb74c7d7-seasons":
    "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_ahind_desktop_gangster_project_icons_seasons",
  "f565e2b2-97df-420c-ae07-7586fb74c7d7-f_gangster_project_icons_seasons":
    "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_ahind_desktop_gangster_project_icons_seasons",
  "f565e2b2-97df-420c-ae07-7586fb74c7d7-f_gangster_project_icons_treble2":
    "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_ahind_desktop_gangster_project_icons_treble2",
  "f565e2b2-97df-420c-ae07-7586fb74c7d7-f_gangster_project_icons_icon_aradia_s_symbol_by_joycrux_dejq4tq-fullview":
    "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_ahind_desktop_gangster_project_icons_icon_aradia_s_symbol_by_joycrux_dejq4tq-fullview",
  "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_dan_onedrive_desktop_night_of_vespers_v2_07_images_trolley":
    "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_ahind_desktop_gangster_project_icons_trolley",
  "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_dan_onedrive_desktop_night_of_vespers_v2_07_images_mercy":
    "f565e2b2-97df-420c-ae07-7586fb74c7d7-c_users_ahind_desktop_gangster_project_icons_mercy",
};

const ENCOUNTER_NAME_MAPPING = {
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\Vivat Regina":
    "Vivat Regina",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\trolley":
    "The City of Fog",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\treble2":
    "A Chorus of Suffering",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\tears": "Trauma",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\suspiria 3":
    "Dancing with Death",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\seasons":
    "The End of Seasons",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\raven":
    "Agents of Tears",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\phenomena": "Phenomena",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\paranormal":
    "Paranormal Activity",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\nyctophobia":
    "Nyctophobia",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\moth":
    "Agents of Darkness",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\mercy": "Mother's Mercy",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\liminal":
    "Liminal Spaces",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\lastdance": "Last Dance",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\infernoposter":
    "Tenebrae",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\inferno2": "Inferno",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\icon__aradia_s_symbol_by_joycrux_dejq4tq-fullview":
    "The Teachings of Aradia",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\hildegard":
    "The Garden of Bones",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\hekate wheel":
    "Three-Fold Evils",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\glass":
    "Hostile Architecture",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\giallo": "Giallo!",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\conies":
    "Behind Closed Doors",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\column":
    "Unhallowed Land",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\city": "Megapolisomancy",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\chalk": "Habeas Corpus",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\cat": "Agents of Sighs",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\camorra (2)":
    "The Commission",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\camorra": "The Family",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\astralcrossroads":
    "Astral Crossroads",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\astral requital":
    "Astral Requital",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\astral justice":
    "Astral Justice",
  "C:\\Users\\ahind\\Desktop\\gangster project\\icons\\3moon": "Sacred Triad",
};

export default function mapper(data: Data) {
  for (const set of data.encounter_sets) {
    if (ENCOUNTER_NAME_MAPPING[set.name]) {
      set.name = ENCOUNTER_NAME_MAPPING[set.name];
    }
  }

  data.encounter_sets = data.encounter_sets
    .filter((set) => !ENCOUNTER_CODE_MAPPINGS[set.code])
    .map((set) => {
      set.code = set.code.replace(
        "c_users_ahind_desktop_gangster_project_icons_",
        "",
      );
      return set;
    });

  for (const card of data.cards) {
    if (card.encounter_code) {
      if (ENCOUNTER_CODE_MAPPINGS[card.encounter_code]) {
        card.encounter_code = ENCOUNTER_CODE_MAPPINGS[card.encounter_code];
      }

      card.encounter_code = card.encounter_code.replace(
        "c_users_ahind_desktop_gangster_project_icons_",
        "",
      );
    }
  }

  return data;
}
