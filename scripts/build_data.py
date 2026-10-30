"""Build data/ingredients.json from the King Arthur chart and USDA SR Legacy portions.
usage: python3 -I build_data.py <ka_rows.json> <sr_dir> <site_cups_to_grams.html> <out.json>"""
import csv, json, re, sys, unicodedata
from fractions import Fraction

ka_rows, sr_dir, site_html, out_path = sys.argv[1:5]
KA_URL = 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart'
FETCHED = '2026-10-30'
TO_CUP = {'cup': Fraction(1), 'tablespoon': Fraction(1, 16), 'teaspoon': Fraction(1, 48)}

def frac(s):
    return sum((Fraction(p) for p in s.split()), Fraction(0))

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')

# ---- King Arthur rows ----
BRANDED = re.compile(r"Artisan|Baker's|Baking Sugar Alternative|Better Cheddar|Biscuit Flour Blend|Cake Enhancer|Mousse Mix|Cinnamon Sweet Bits|Climate Blend|Easy Roll|Everything Bagel|Formaggio|Fruit Blend|Gluten-Free|Golden Wheat|Harvest Grains|Hi-Maize|Irish-Style|Italian Herb|Italian-Style|French-Style|Jammy Bits|Keto|Lemon Crumbles|French Toast Sugar|Mini Diced Ginger|King Arthur Rolled|Paleo|Pasta Flour Blend|Pastry Flour Blend|Pie Filling Enhancer|Pizza Dough Flavor|Pizza Flour Blend|Pizza Seasoning|Rye Bread Improver|Rye Flour Blend|Six-Grain|Snow White|Sticky Bun|Super 10|The Works|Toasted Almond|Whole Grain Flour Blend|Nutella|Grape Nuts|Rice Krispies|Quaker|Premium 100%|Splenda|Fluff|Sourdough starter|Dried Blueberry Powder")
ka = {}
for name, vol, _oz, grams in json.load(open(ka_rows, encoding='utf8')):
    name = name.replace('\xad', '').strip()
    vol = vol.replace('\xad', '')
    m = re.match(r'^([\d/ ]+?)\s*(cups?|tablespoons?|teaspoons?)\b', vol)
    if not m or ' to ' in grams or BRANDED.search(name):
        continue
    unit = m.group(2).rstrip('s')
    cups = frac(m.group(1)) * TO_CUP[unit]
    g = float(Fraction(int(grams)) / cups)
    prev = ka.get(name)
    if prev and prev['cups'] >= cups:
        continue
    ka[name] = {'name': name, 'volume': vol, 'grams': int(grams), 'cups': cups, 'g_per_cup': round(g, 1)}

# ---- USDA SR Legacy portions ----
units = {r['id']: r['name'] for r in csv.DictReader(open(sr_dir + '/measure_unit.csv', encoding='utf8'))}
desc = {r['fdc_id']: r['description'] for r in csv.DictReader(open(sr_dir + '/food.csv', encoding='utf8'))}
portions = {}
for r in csv.DictReader(open(sr_dir + '/food_portion.csv', encoding='utf8')):
    portions.setdefault(r['fdc_id'], []).append(r)

def usda(fdc, pat):
    for r in sorted(portions.get(fdc, []), key=lambda r: -float(r['amount'])):
        text = f"{units.get(r['measure_unit_id'], '')} {r['modifier']}".strip()
        if re.fullmatch(pat, text):
            mod = r['modifier']
            base = 'cup' if mod.startswith('cup') else 'tablespoon' if mod.startswith('tbsp') else 'teaspoon' if mod.startswith('tsp') else None
            amount = Fraction(r['amount']) * TO_CUP[base]
            return {'fdc_id': int(fdc), 'description': desc[fdc], 'portion': f"{r['amount']} {mod}".strip(),
                    'gram_weight': float(r['gram_weight']), 'g_per_cup': round(float(r['gram_weight']) / float(amount), 1)}
    raise SystemExit(f'no portion {pat} for {fdc}: {[(r["modifier"]) for r in portions.get(fdc, [])]}')

# id, name, fdc, portion pattern, KA row merged into this entry, primary, aliases
U = [
 ('water', 'Water', '174158', r'undetermined cup', 'Water', 'usda', ['tap water']),
 ('milk-whole', 'Milk, whole', '171265', r'undetermined cup', 'Milk (fresh)', 'usda', ['milk', 'whole milk']),
 ('milk-2-percent', 'Milk, 2% reduced fat', '171267', r'undetermined cup', None, 'usda', ['2% milk', 'reduced fat milk']),
 ('milk-skim', 'Milk, nonfat (skim)', '171269', r'undetermined cup', None, 'usda', ['skim milk', 'nonfat milk', 'fat free milk']),
 ('buttermilk', 'Buttermilk', '170874', r'undetermined cup', 'Buttermilk', 'usda', []),
 ('heavy-cream', 'Heavy cream (heavy whipping cream)', '170859', r'undetermined cup, fluid \(yields 2 cups whipped\)', 'Cream (heavy cream, light cream, or half & half)', 'usda', ['heavy whipping cream', 'double cream', 'whipping cream', 'cream']),
 ('light-cream', 'Light cream (coffee cream)', '170857', r'undetermined cup', None, 'usda', ['single cream', 'table cream']),
 ('half-and-half', 'Half and half', '171255', r'undetermined cup', None, 'usda', ['half & half']),
 ('sour-cream', 'Sour cream', '171257', r'undetermined cup', 'Sour cream', 'usda', []),
 ('yogurt', 'Yogurt, plain whole milk', '171284', r'undetermined cup \(8 fl oz\)', 'Yogurt', 'usda', ['plain yogurt', 'yoghurt']),
 ('vegetable-oil', 'Vegetable oil (soybean)', '171411', r'undetermined cup', 'Vegetable oil', 'usda', ['oil', 'soybean oil', 'cooking oil']),
 ('canola-oil', 'Canola oil', '172336', r'undetermined cup', None, 'usda', ['rapeseed oil']),
 ('olive-oil', 'Olive oil', '171413', r'undetermined cup', 'Olive oil', 'usda', ['extra virgin olive oil', 'evoo']),
 ('coconut-oil', 'Coconut oil', '171412', r'undetermined cup', 'Coconut oil', 'usda', []),
 ('honey', 'Honey', '169640', r'undetermined cup', 'Honey', 'usda', []),
 ('maple-syrup', 'Maple syrup', '169661', r'undetermined cup', 'Maple syrup', 'ka', []),
 ('corn-syrup', 'Corn syrup, light', '168837', r'undetermined cup', 'Corn syrup', 'usda', ['light corn syrup']),
 ('molasses', 'Molasses', '168820', r'undetermined cup', 'Molasses', 'usda', []),
 ('butter', 'Butter', '173430', r'undetermined cup', 'Butter', 'usda', ['unsalted butter', 'salted butter']),
 ('margarine', 'Margarine (stick, 80% fat)', '172346', r'undetermined cup', None, 'usda', []),
 ('granulated-sugar', 'Granulated sugar', '169655', r'undetermined cup', 'Sugar (granulated white)', 'usda', ['sugar', 'white sugar', 'caster sugar']),
 ('brown-sugar-packed', 'Brown sugar (packed)', '168833', r'undetermined cup packed', 'Brown sugar (dark or light, packed)', 'usda', ['brown sugar', 'light brown sugar', 'dark brown sugar']),
 ('powdered-sugar', 'Powdered sugar (unsifted)', '169656', r'undetermined cup unsifted', "Confectioners' sugar (unsifted)", 'usda', ["confectioners' sugar", 'confectioners sugar', 'icing sugar', 'powdered sugar']),
 ('all-purpose-flour', 'All-purpose flour', '168894', r'undetermined cup', 'All-Purpose Flour', 'ka', ['flour', 'ap flour', 'plain flour', 'white flour']),
 ('bread-flour', 'Bread flour', '168896', r'undetermined cup', 'Bread Flour', 'ka', ['strong flour']),
 ('cake-flour', 'Cake flour', '169723', r'undetermined cup unsifted, dipped', 'Unbleached Cake Flour', 'ka', []),
 ('whole-wheat-flour', 'Whole wheat flour', '168893', r'undetermined cup', None, 'usda', ['wholemeal flour', 'whole grain flour']),
 ('cocoa-powder', 'Cocoa powder, unsweetened', '169593', r'undetermined cup', 'Cocoa (unsweetened)', 'usda', ['cocoa', 'unsweetened cocoa']),
 ('cornstarch', 'Cornstarch', '169698', r'undetermined cup', 'Cornstarch', 'usda', ['cornflour', 'corn starch']),
 ('white-rice', 'White rice, long grain (uncooked)', '168877', r'undetermined cup', 'Rice (long grain, dry)', 'usda', ['rice', 'long grain rice', 'basmati rice', 'jasmine rice']),
 ('short-grain-rice', 'White rice, short grain (uncooked)', '168931', r'undetermined cup', None, 'usda', ['sushi rice', 'arborio rice']),
 ('brown-rice', 'Brown rice, long grain (uncooked)', '169703', r'undetermined cup', None, 'usda', []),
 ('rolled-oats', 'Rolled oats (old-fashioned or quick)', '173904', r'undetermined cup', 'Oats (old-fashioned or quick-cooking)', 'ka', ['oats', 'oatmeal', 'quick oats', 'old fashioned oats']),
 ('peanut-butter', 'Peanut butter, smooth', '172470', r'undetermined cup', 'Peanut butter', 'usda', []),
 ('salt-table', 'Salt, table', '173468', r'undetermined tbsp', 'Salt (table)', 'ka', ['salt', 'fine salt']),
 ('baking-powder', 'Baking powder', '172803', r'undetermined tsp', 'Baking powder', 'usda', []),
 ('baking-soda', 'Baking soda', '175040', r'undetermined tsp', 'Baking soda', 'usda', ['bicarbonate of soda', 'bicarb', 'sodium bicarbonate']),
 ('cream-cheese', 'Cream cheese', '173418', r'undetermined cup', 'Cream cheese', 'usda', []),
 ('ricotta', 'Ricotta cheese, whole milk', '170851', r'undetermined cup', 'Cheese (Ricotta)', 'usda', ['ricotta']),
 ('parmesan-grated', 'Parmesan cheese, grated', '171247', r'undetermined cup', 'Cheese (grated Parmesan)', 'usda', ['parmesan', 'parmigiano']),
 ('chocolate-chips', 'Chocolate chips (semisweet)', '167976', r'undetermined cup chips \(6 oz package\)', 'Chocolate Chips', 'ka', ['semisweet chocolate chips', 'chocolate chips']),
 ('almonds-sliced', 'Almonds, sliced', '170567', r'undetermined cup, sliced', 'Almonds (sliced)', 'usda', ['sliced almonds', 'flaked almonds']),
 ('almonds-whole', 'Almonds, whole', '170567', r'undetermined cup, whole', 'Almonds, whole (unblanched)', 'usda', ['almonds']),
 ('walnuts-chopped', 'Walnuts, chopped', '170187', r'undetermined cup, chopped', 'Walnuts (chopped)', 'ka', ['walnuts', 'chopped walnuts']),
 ('pecans-chopped', 'Pecans, chopped', '170182', r'undetermined cup, chopped', 'Pecans (diced)', 'usda', ['pecans', 'chopped pecans']),
 ('raisins', 'Raisins (packed)', '168165', r'undetermined cup, packed', 'Raisins (packed)', 'usda', []),
 ('cornmeal', 'Cornmeal, yellow (degermed)', '168867', r'undetermined cup', None, 'usda', ['yellow cornmeal']),
 ('cornmeal-whole-grain', 'Cornmeal, whole grain', '169697', r'undetermined cup', 'Cornmeal (whole)', 'ka', ['whole grain cornmeal', 'stone ground cornmeal']),
 ('lemon-juice', 'Lemon juice', '167747', r'undetermined cup', 'Lemon juice', 'usda', []),
 ('orange-juice', 'Orange juice', '169098', r'undetermined cup', None, 'usda', []),
 ('vanilla-extract', 'Vanilla extract', '173471', r'undetermined cup', 'Vanilla Extract', 'usda', ['vanilla']),
 ('applesauce', 'Applesauce, unsweetened', '171695', r'undetermined cup', 'Applesauce', 'usda', ['apple sauce']),
 ('sweetened-condensed-milk', 'Sweetened condensed milk', '171275', r'undetermined cup', 'Sweetened condensed milk', 'usda', ['condensed milk']),
 ('mayonnaise', 'Mayonnaise', '171009', r'undetermined cup', 'Mayonnaise', 'usda', ['mayo']),
 ('shortening', 'Vegetable shortening', '173584', r'undetermined cup', 'Vegetable shortening', 'usda', ['crisco']),
 ('lard', 'Lard', '171401', r'undetermined cup', 'Lard', 'usda', []),
 ('tomato-paste', 'Tomato paste', '170459', r'undetermined cup', 'Tomato paste', 'usda', []),
 ('tomato-sauce', 'Tomato sauce, canned', '170054', r'undetermined cup', None, 'usda', ['passata']),
 ('coconut-milk', 'Coconut milk, canned', '170173', r'undetermined cup', 'Coconut milk; canned, well shaken', 'usda', []),
 ('soy-sauce', 'Soy sauce', '174277', r'undetermined cup', None, 'usda', ['shoyu']),
 ('vinegar', 'Vinegar, distilled white', '172237', r'undetermined cup', None, 'usda', ['white vinegar', 'distilled vinegar']),
 ('cider-vinegar', 'Apple cider vinegar', '173469', r'undetermined cup', None, 'usda', ['cider vinegar']),
 ('chicken-broth', 'Chicken broth', '174536', r'undetermined cup', None, 'usda', ['chicken stock', 'broth', 'stock']),
 ('ketchup', 'Ketchup', '168556', r'undetermined cup', None, 'usda', ['catsup']),
 ('lentils', 'Lentils (dry)', '172420', r'undetermined cup', None, 'usda', []),
 ('quinoa', 'Quinoa (uncooked)', '168874', r'undetermined cup', 'Quinoa (whole)', 'usda', []),
 ('chickpeas-dry', 'Chickpeas (dry)', '173756', r'undetermined cup', None, 'usda', ['garbanzo beans', 'dried chickpeas']),
 ('black-beans-dry', 'Black beans (dry)', '173734', r'undetermined cup', None, 'usda', ['dried black beans']),
]

site = {}
src = open(site_html, encoding='utf8').read()
for m in re.finditer(r"'([a-z-]+)': \{ name: '([^']+)', gramsPerCup: (\d+) \}", src):
    site[m.group(1)] = (m.group(2), int(m.group(3)))
SITE_MAP = {'whole-wheat-flour': 'whole-wheat-flour', 'salt-table': 'salt-table', 'cocoa-powder': 'cocoa-powder',
            'shredded-coconut': 'coconut-sweetened-shredded', 'raisins': 'raisins', 'heavy-cream': 'heavy-cream',
            'milk': 'milk-whole', 'yogurt': 'yogurt', 'almonds-sliced': 'almonds-sliced', 'walnuts-chopped': 'walnuts-chopped',
            'brown-rice': 'brown-rice', 'white-rice': 'white-rice', 'cornmeal': 'cornmeal', 'semolina': 'semolina-flour'}

def ka_entry(r):
    return {'source': 'king_arthur', 'url': KA_URL, 'row': r['name'], 'volume': r['volume'], 'grams': r['grams'], 'g_per_cup': r['g_per_cup']}

def usda_entry(u):
    return {'source': 'usda_fdc', 'url': f"https://fdc.nal.usda.gov/food-details/{u['fdc_id']}/nutrients", 'fdc_id': u['fdc_id'],
            'description': u['description'], 'portion': u['portion'], 'gram_weight': u['gram_weight'], 'g_per_cup': u['g_per_cup']}

out, used = [], set()
for iid, name, fdc, pat, ka_name, primary, aliases in U:
    u = usda_entry(usda(fdc, pat))
    k = ka_entry(ka[ka_name]) if ka_name else None
    if ka_name:
        used.add(ka_name)
    pri, alt = (k, u) if primary == 'ka' else (u, k)
    out.append({'id': iid, 'name': name, 'aliases': aliases, 'g_per_us_cup': pri['g_per_cup'], 'primary': pri, 'alternates': [a for a in [alt] if a]})
for name, r in sorted(ka.items()):
    if name in used:
        continue
    clean = re.sub(r'\s*\((.*?)\)', r', \1', name).replace(';', ',').replace('\u00ae', '')
    out.append({'id': slug(clean), 'name': clean, 'aliases': [], 'g_per_us_cup': r['g_per_cup'], 'primary': ka_entry(r), 'alternates': []})

ids = [e['id'] for e in out]
assert len(ids) == len(set(ids)), [i for i in ids if ids.count(i) > 1]
# site comparison
by_id = {e['id']: e for e in out}
conflicts = []
for sid, (sname, sg) in site.items():
    eid = SITE_MAP.get(sid, sid)
    e = by_id.get(eid)
    if not e:
        conflicts.append({'site_id': sid, 'site_g_per_cup': sg, 'issue': 'no sourced row matched'}); continue
    e['site_g_per_cup'] = sg
    refs = [e['primary']] + e['alternates']
    for r in refs:
        diff = abs(sg - r['g_per_cup']) / r['g_per_cup']
        if diff > 0.05:
            conflicts.append({'id': eid, 'site_g_per_cup': sg, 'source': r['source'], 'source_g_per_cup': r['g_per_cup'], 'diff_pct': round(diff * 100, 1), 'used': e['g_per_us_cup']})
for e in out:
    if len(e['alternates']) == 1:
        a, p = e['alternates'][0]['g_per_cup'], e['primary']['g_per_cup']
        if abs(a - p) / p > 0.05:
            conflicts.append({'id': e['id'], 'source_conflict': f"{e['primary']['source']} {p} vs {e['alternates'][0]['source']} {a}", 'diff_pct': round(abs(a - p) / p * 100, 1), 'used': p})
json.dump({'fetched': FETCHED, 'count': len(out), 'ingredients': out, 'conflicts': conflicts}, open(out_path, 'w'), indent=1, ensure_ascii=False)
print(len(out), 'ingredients;', len(conflicts), 'conflicts')
for c in conflicts: print(' ', c)
