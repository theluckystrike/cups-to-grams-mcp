# Data sources

All numbers were fetched on 2026-10-30. Nothing comes from model memory.

## Ingredient densities

- King Arthur Baking, Ingredient weight chart, https://www.kingarthurbaking.com/learn/ingredient-weight-chart (fetched 2026-10-30, 325 rows). Saved as `data/king-arthur-chart-2026-10-30.json`. Rows with a range, a count unit (1 large egg) or a King Arthur branded blend are left out.
- USDA FoodData Central, SR Legacy CSV download, https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip (fetched 2026-10-30, keyless). Portion weights from `food_portion.csv`. Each USDA row cites this file as `url` plus its `fdc_id` and `fdc_page` (https://fdc.nal.usda.gov/food-details/<fdc_id>/measures). The FDC page is a browser app and returns HTTP 404 to curl, so the verified download is the primary citation.
- ingredientcalculator.com cups-to-grams table (35 rows, site source in the ingredientcalculator repo). Used to choose between the two published values: when the site value equals one cited value, that source is used.

`scripts/build_data.py` builds `data/ingredients.json` from these files. Rule for the value used: liquids, fats and USDA-matched staples use USDA; dry baking staples use King Arthur (spoon-and-level), unless the site value equals the USDA value. Every row keeps the other published value under `alternates`.

Result: 271 ingredients, 59 from USDA and 212 from King Arthur.

## USDA rows (FDC ids)

| id | g per US cup | FDC id | USDA portion |
| --- | --- | --- | --- |
| water | 237.0 | 174158 | 1 cup = 237.0 g |
| milk-whole | 244.0 | 171265 | 1 cup = 244.0 g |
| milk-2-percent | 244.0 | 171267 | 1 cup = 244.0 g |
| milk-skim | 245.0 | 171269 | 1 cup = 245.0 g |
| buttermilk | 245.0 | 170874 | 1 cup = 245.0 g |
| heavy-cream | 238.0 | 170859 | 1 cup, fluid (yields 2 cups whipped) = 238.0 g |
| light-cream | 240.0 | 170857 | 1 cup = 240.0 g |
| half-and-half | 242.0 | 171255 | 1 cup = 242.0 g |
| sour-cream | 230.0 | 171257 | 1 cup = 230.0 g |
| yogurt | 245.0 | 171284 | 1 cup (8 fl oz) = 245.0 g |
| vegetable-oil | 218.0 | 171411 | 1 cup = 218.0 g |
| canola-oil | 218.0 | 172336 | 1 cup = 218.0 g |
| olive-oil | 216.0 | 171413 | 1 cup = 216.0 g |
| coconut-oil | 218.0 | 171412 | 1 cup = 218.0 g |
| honey | 339.0 | 169640 | 1 cup = 339.0 g |
| maple-syrup | 315.0 (alternate) | 169661 | 1 cup = 315.0 g |
| corn-syrup | 341.0 | 168837 | 1 cup = 341.0 g |
| molasses | 337.0 | 168820 | 1 cup = 337.0 g |
| butter | 227.0 | 173430 | 1 cup = 227.0 g |
| margarine | 227.0 | 172346 | 1 cup = 227.0 g |
| granulated-sugar | 200.0 | 169655 | 1 cup = 200.0 g |
| brown-sugar-packed | 220.0 | 168833 | 1 cup packed = 220.0 g |
| powdered-sugar | 120.0 | 169656 | 1 cup unsifted = 120.0 g |
| all-purpose-flour | 125.0 (alternate) | 168894 | 1 cup = 125.0 g |
| bread-flour | 137.0 (alternate) | 168896 | 1 cup = 137.0 g |
| cake-flour | 137.0 (alternate) | 169723 | 1 cup unsifted, dipped = 137.0 g |
| whole-wheat-flour | 120.0 | 168893 | 1 cup = 120.0 g |
| cocoa-powder | 86.0 | 169593 | 1 cup = 86.0 g |
| cornstarch | 128.0 | 169698 | 1 cup = 128.0 g |
| white-rice | 185.0 | 168877 | 1 cup = 185.0 g |
| short-grain-rice | 200.0 | 168931 | 1 cup = 200.0 g |
| brown-rice | 185.0 | 169703 | 1 cup = 185.0 g |
| rolled-oats | 81.0 (alternate) | 173904 | 1 cup = 81.0 g |
| peanut-butter | 258.0 | 172470 | 1 cup = 258.0 g |
| salt-table | 288.0 (alternate) | 173468 | 1 tbsp = 18.0 g |
| baking-powder | 220.8 | 172803 | 1 tsp = 4.6 g |
| baking-soda | 220.8 | 175040 | 1 tsp = 4.6 g |
| cream-cheese | 232.0 | 173418 | 1 cup = 232.0 g |
| ricotta | 246.0 | 170851 | 1 cup = 246.0 g |
| parmesan-grated | 100.0 | 171247 | 1 cup = 100.0 g |
| chocolate-chips | 168.0 (alternate) | 167976 | 1 cup chips (6 oz package) = 168.0 g |
| almonds-sliced | 92.0 | 170567 | 1 cup, sliced = 92.0 g |
| almonds-whole | 143.0 | 170567 | 1 cup, whole = 143.0 g |
| walnuts-chopped | 117.0 (alternate) | 170187 | 1 cup, chopped = 117.0 g |
| pecans-chopped | 109.0 | 170182 | 1 cup, chopped = 109.0 g |
| raisins | 165.0 | 168165 | 1 cup, packed = 165.0 g |
| cornmeal | 157.0 | 168867 | 1 cup = 157.0 g |
| cornmeal-whole-grain | 122.0 (alternate) | 169697 | 1 cup = 122.0 g |
| lemon-juice | 244.0 | 167747 | 1 cup = 244.0 g |
| orange-juice | 248.0 | 169098 | 1 cup = 248.0 g |
| vanilla-extract | 208.0 | 173471 | 1 cup = 208.0 g |
| applesauce | 244.0 | 171695 | 1 cup = 244.0 g |
| sweetened-condensed-milk | 306.0 | 171275 | 1 cup = 306.0 g |
| mayonnaise | 220.0 | 171009 | 1 cup = 220.0 g |
| shortening | 205.0 | 173584 | 1 cup = 205.0 g |
| lard | 205.0 | 171401 | 1 cup = 205.0 g |
| tomato-paste | 262.0 | 170459 | 1 cup = 262.0 g |
| tomato-sauce | 245.0 | 170054 | 1 cup = 245.0 g |
| coconut-milk | 226.0 | 170173 | 1 cup = 226.0 g |
| soy-sauce | 255.0 | 174277 | 1 cup = 255.0 g |
| vinegar | 238.0 | 172237 | 1 cup = 238.0 g |
| cider-vinegar | 239.0 | 173469 | 1 cup = 239.0 g |
| chicken-broth | 249.0 | 174536 | 1 cup = 249.0 g |
| ketchup | 240.0 | 168556 | 1 cup = 240.0 g |
| lentils | 192.0 | 172420 | 1 cup = 192.0 g |
| quinoa | 170.0 | 168874 | 1 cup = 170.0 g |
| chickpeas-dry | 200.0 | 173756 | 1 cup = 200.0 g |
| black-beans-dry | 194.0 | 173734 | 1 cup = 194.0 g |

## Conflicts over 5%

| id | detail | value used (g per US cup) |
| --- | --- | --- |
| bread-flour | site 127 vs king_arthur 120.0 (5.8%) | 120.0 |
| bread-flour | site 127 vs usda_fdc 137.0 (7.3%) | 120.0 |
| cake-flour | site 114 vs usda_fdc 137.0 (16.8%) | 120.0 |
| powdered-sugar | site 120 vs king_arthur 113.0 (6.2%) | 120.0 |
| milk-whole | site 244 vs king_arthur 227.0 (7.5%) | 244.0 |
| vegetable-oil | site 218 vs king_arthur 198.0 (10.1%) | 218.0 |
| olive-oil | site 216 vs king_arthur 200.0 (8.0%) | 216.0 |
| cornstarch | site 128 vs king_arthur 112.0 (14.3%) | 128.0 |
| white-rice | site 185 vs king_arthur 198.0 (6.6%) | 185.0 |
| rolled-oats | site 90 vs usda_fdc 81.0 (11.1%) | 89.0 |
| coconut-flour | site 120 vs king_arthur 128.0 (6.2%) | 128.0 |
| yogurt | site 245 vs king_arthur 227.0 (7.9%) | 245.0 |
| walnuts-chopped | site 120 vs king_arthur 113.0 (6.2%) | 113.0 |
| almonds-sliced | site 92 vs king_arthur 86.0 (7.0%) | 92.0 |
| baking-powder | site 230 vs king_arthur 192.0 (19.8%) | 220.8 |
| milk-whole | usda_fdc 244.0 vs king_arthur 227.0 (7.0%) | 244.0 |
| buttermilk | usda_fdc 245.0 vs king_arthur 227.0 (7.3%) | 245.0 |
| yogurt | usda_fdc 245.0 vs king_arthur 227.0 (7.3%) | 245.0 |
| vegetable-oil | usda_fdc 218.0 vs king_arthur 198.0 (9.2%) | 218.0 |
| olive-oil | usda_fdc 216.0 vs king_arthur 200.0 (7.4%) | 216.0 |
| corn-syrup | usda_fdc 341.0 vs king_arthur 312.0 (8.5%) | 341.0 |
| powdered-sugar | usda_fdc 120.0 vs king_arthur 113.0 (5.8%) | 120.0 |
| bread-flour | king_arthur 120.0 vs usda_fdc 137.0 (14.2%) | 120.0 |
| cake-flour | king_arthur 120.0 vs usda_fdc 137.0 (14.2%) | 120.0 |
| cornstarch | usda_fdc 128.0 vs king_arthur 112.0 (12.5%) | 128.0 |
| white-rice | usda_fdc 185.0 vs king_arthur 198.0 (7.0%) | 185.0 |
| rolled-oats | king_arthur 89.0 vs usda_fdc 81.0 (9.0%) | 89.0 |
| baking-powder | usda_fdc 220.8 vs king_arthur 192.0 (13.0%) | 220.8 |
| baking-soda | usda_fdc 220.8 vs king_arthur 288.0 (30.4%) | 220.8 |
| ricotta | usda_fdc 246.0 vs king_arthur 227.0 (7.7%) | 246.0 |
| almonds-sliced | usda_fdc 92.0 vs king_arthur 86.0 (6.5%) | 92.0 |
| cornmeal-whole-grain | king_arthur 138.0 vs usda_fdc 122.0 (11.6%) | 138.0 |
| lemon-juice | usda_fdc 244.0 vs king_arthur 224.0 (8.2%) | 244.0 |
| vanilla-extract | usda_fdc 208.0 vs king_arthur 224.0 (7.7%) | 208.0 |
| shortening | usda_fdc 205.0 vs king_arthur 184.0 (10.2%) | 205.0 |
| lard | usda_fdc 205.0 vs king_arthur 226.0 (10.2%) | 205.0 |
| tomato-paste | usda_fdc 262.0 vs king_arthur 232.0 (11.5%) | 262.0 |
| coconut-milk | usda_fdc 226.0 vs king_arthur 241.0 (6.6%) | 226.0 |

## Units

- NIST SP 811 Appendix B.9, https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9 (fetched 2026-10-30): cup (U.S.) 236.5882 mL, fluid ounce (U.S.) 29.57353 mL, tablespoon 14.78676 mL, teaspoon 4.928922 mL, pound (avoirdupois) 0.45359237 kg exact. The server uses the exact chain: US gallon = 231 cubic inches, inch = 2.54 cm, cup = 1/16 gallon.
- UK Weights and Measures Act 1985, Schedule 1, https://www.legislation.gov.uk/ukpga/1985/72/schedule/1 (fetched 2026-10-30): gallon = 4.54609 cubic decimetres, quart = 1/4 gallon, fluid ounce = 1/20 pint.
- 21 CFR 101.9(b)(5)(viii), https://www.ecfr.gov/current/title-21/part-101/section-101.9 (fetched 2026-10-30 via https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-21?part=101&section=101.9): for nutrition labels a cup means 240 mL, a tablespoon 15 mL, a teaspoon 5 mL.
- Metric cup 250 mL, metric spoons 15 and 5 mL, Australian tablespoon 20 mL and Japanese cup 200 mL are national kitchen conventions. They are not in the files above.

## Oven temperatures

- Gas mark table: Wikipedia, Gas mark, conversion table, https://en.wikipedia.org/wiki/Gas_mark (fetched 2026-10-30).
- Fan oven: Hoover UK service advice, https://service.hoover.co.uk/advice-centre/the-oven-is-burning-the-food/151-use-lower-temperatures-when-cooking-with-fan-ovens/ (fetched 2026-10-30): fan ovens can generally be set lower by 20 C.
