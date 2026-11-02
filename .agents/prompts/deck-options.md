---
description: Infer arkham.build deck options from Shoggoth investigator data
argument-hint: "<shoggoth-card-json>"
---

```json
$ARGUMENTS
```

This is [Shoggoth](https://github.com/tokeeto/shoggoth/) data for a fan-made
investigator for _Arkham Horror: The Card Game_. Infer the arkham.build-compatible
`deck_options` attribute from the deckbuilding options and restrictions on the
investigator's back.

Use these resources:

- Official card JSON data: https://api.arkham.build/v1/cache/cards
- Official card images: https://cdn.arkham.build/optimized/{id}.jpg
- Detailed JSON schema: https://github.com/arkham-build/arkham.build/blob/main/shared/src/schemas/card.schema.ts
- BuildQL documentation: https://github.com/arkham-build/arkham.build/blob/main/frontend/src/store/lib/buildql/buildql.md

Guidelines:

- Use regular expressions or BuildQL only when a simple `attribute`- or
  `text`-based option cannot fully encode a deckbuilding rule.
- When you encode restrictions, preserve the implicit option order: any option
  before a `not` is interpreted as an `unless`.
- Put unlimited options before options with a `limit`.
- Check the inferred options against the schema, relevant official cards, and in complex cases, the arkham.build engine.
- Do not invent support for rules that the schema cannot encode.

Return Markdown with a fenced JSON block in this form, with an entry for each
investigator:

```json
{
  "meta": {
    "<card_id>": {
      "deck_options": []
    }
  }
}
```

Replace each empty array with the inferred options. If a rule cannot be encoded,
add an "Unencoded options" Markdown section after the JSON block. List each rule,
its card ID, and the reason it cannot be encoded. Omit this section when all rules
can be encoded.
