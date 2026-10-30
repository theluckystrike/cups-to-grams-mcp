# Cups to Grams MCP

Ingredient-aware cups to grams for AI assistants, using measured grams per cup from USDA FoodData Central and the King Arthur Baking weight chart instead of guessed densities.

Hosted MCP URL (no sign-in, no token): `https://cups-to-grams-mcp.lipmichal.workers.dev/mcp`

Converters and recipe tools on the web: [ingredientcalculator.com](https://ingredientcalculator.com/cups-to-grams?utm_source=github&utm_medium=cups-to-grams-mcp)

## Tools

| Tool | What it does |
| --- | --- |
| `convert_ingredient` | Converts an amount between volume and weight for a named ingredient (cup, tbsp, tsp, fl oz, mL, L to g, oz, lb and back). Supports US, metric, imperial, US legal and Japanese cups, US, metric and Australian spoons, sticks of butter. Says which cup it used and cites the density source. |
| `search_ingredients` | Fuzzy search over 271 ingredients. Returns canonical names, grams per US cup and per tablespoon, and the source (USDA FDC id or King Arthur chart). |
| `scale_recipe` | Scales ingredient lines by a factor or from one servings count to another. Parses mixed numbers and fraction characters. Optionally gives grams for every line. |
| `convert_oven_temperature` | Fahrenheit, Celsius and gas mark (1/4 to 10), with a 20 C fan oven adjustment. |

Every result has structured JSON, a one-paragraph summary, an `as_of` date, a `source` URL and a `more` link to the matching ingredientcalculator.com page.

## What it knows that your model does not

- Measured weights. A cup of all-purpose flour is 120 g, granulated sugar 200 g, butter 227 g, honey 339 g, water 237 g. Models often apply one density to everything or mix up fluid ounces and weight ounces. Each of the 271 rows carries its source, and USDA rows carry the FDC id.
- Which cup. A US cup is 236.5882365 mL, a metric cup 250 mL, an imperial cup 284.13 mL, the US nutrition-label cup 240 mL and a Japanese cup 200 mL. A 1 cup of flour in an Australian recipe is about 127 g, not 120 g. The server states the cup it used.
- Exact unit constants. US units come from the US gallon of 231 cubic inches (NIST SP 811). Imperial units come from the UK Weights and Measures Act 1985 (gallon = 4.54609 L). The pound is exactly 453.59237 g.
- Where published tables disagree. For 23 ingredients USDA and King Arthur differ by more than 5% (cornstarch, bread flour, oats, baking soda and others). The result names the value used and lists the other published value, so the user can see the spread.

## Install

### Claude.ai custom connector, ChatGPT developer mode

Paste this URL as a custom connector. No token or sign-in.

```
https://cups-to-grams-mcp.lipmichal.workers.dev/mcp
```

### Claude Code

```
claude mcp add --transport http cups-to-grams https://cups-to-grams-mcp.lipmichal.workers.dev/mcp
```

Or run it locally over stdio:

```
claude mcp add cups-to-grams -- npx -y github:theluckystrike/cups-to-grams-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cups-to-grams": {
      "command": "npx",
      "args": ["-y", "github:theluckystrike/cups-to-grams-mcp"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cups-to-grams": { "url": "https://cups-to-grams-mcp.lipmichal.workers.dev/mcp" }
  }
}
```

### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "cups-to-grams": { "type": "http", "url": "https://cups-to-grams-mcp.lipmichal.workers.dev/mcp" }
  }
}
```

### Test with curl

```
curl -s -X POST https://cups-to-grams-mcp.lipmichal.workers.dev/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"convert_ingredient","arguments":{"amount":1,"from_unit":"cup","to_unit":"g","ingredient":"all-purpose flour"}}}'
```

## Example prompts

- "How many grams is 3/4 cup of brown sugar?"
- "Convert 250 g of bread flour to cups."
- "This Australian recipe says 2 cups plain flour. How many grams is that?"
- "Double this recipe and give me grams: 1 1/2 cups flour, 1/2 cup sugar, 2 tbsp honey, 1 stick butter."
- "Scale this recipe from 4 servings to 10."
- "What is gas mark 6 in Fahrenheit, and what should I set a fan oven to?"

## How it converts

- Density in g per mL = grams per US cup / 236.5882365.
- Volume to weight = amount x unit mL x density. Weight to volume is the reverse.
- Volume to volume and weight to weight use the unit constants only.
- A stick of butter is 1/4 lb (113.398 g), which USDA lists as 113 g and 1/2 cup.
- Gas marks follow the standard recipe table (gas mark 4 = 350 F = 180 C). Fan ovens are set 20 C lower, per oven maker guidance.

27 test fixtures check unit constants and table values. The expected values come from `scripts/expected.py`, which works from the unit definitions and the published table values, not from the server code.

## Data sources

See [DATA_SOURCES.md](DATA_SOURCES.md). In short, densities come from USDA FoodData Central SR Legacy portion weights (FDC ids per row) and the King Arthur Baking ingredient weight chart, both fetched on 2026-10-30. The table is rebuilt by `scripts/build_data.py`.

## Limitations

- Volume measures vary with how you fill the cup. Dry values assume spoon-and-level filling. Scooping flour from the bag can add 30 g or more per cup. Weigh when it matters.
- Table values are whole grams per cup, so results carry about plus or minus 0.5 g per cup of rounding. King Arthur rows given per tablespoon or teaspoon are coarser.
- Whole eggs and other count items are not converted by volume. A large egg is about 50 g.
- Ingredient matching is fuzzy. Check the matched name in the result, or use `search_ingredients` first.
- Fan oven guidance is a rule of thumb. Oven calibration varies.

## Development

```
npm install
npm run build
npm test
npx wrangler deploy
```

`src/core.ts` holds the pure conversion logic and `src/data.ts` the generated density table. `src/stdio.ts` and `src/worker.ts` are thin entries over the same tool registry in `src/tools.ts`.

## License

MIT

Part of the Zovo MCP collection: https://mcp.zovo.one
