// Pure conversion core. No I/O. Densities come from data/ingredients.json (built by
// scripts/build_data.py from the King Arthur Baking chart and USDA FoodData Central).
import { DATA } from './data.js';

export const AS_OF = '2026-10-30';
export const REPO = 'cups-to-grams-mcp';
const SITE = 'https://ingredientcalculator.com';
export const NIST_URL = 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9';
export const UK_URL = 'https://www.legislation.gov.uk/ukpga/1985/72/schedule/1';
export const GAS_URL = 'https://en.wikipedia.org/wiki/Gas_mark';
export const FAN_URL = 'https://service.hoover.co.uk/advice-centre/the-oven-is-burning-the-food/151-use-lower-temperatures-when-cooking-with-fan-ovens/';

export class InputError extends Error {}

export function more(path: string): string {
  return `${SITE}${path}?utm_source=mcp&utm_medium=${REPO}`;
}

export interface SourceRef {
  source: 'king_arthur' | 'usda_fdc';
  url: string;
  g_per_cup: number;
  fdc_id?: number;
  description?: string;
  portion?: string;
  gram_weight?: number;
  row?: string;
  volume?: string;
  grams?: number;
}
export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  g_per_us_cup: number;
  primary: SourceRef;
  alternates: SourceRef[];
  site_g_per_cup?: number;
}
export const INGREDIENTS: Ingredient[] = (DATA as unknown as { ingredients: Ingredient[] }).ingredients;

// ---------- units ----------
// US customary volume from the US gallon (231 cubic inches, inch = 2.54 cm, exact): NIST SP 811.
// Imperial from the UK Weights and Measures Act 1985: gallon = 4.54609 L, fl oz = 1/20 pint.
// Mass: pound = 0.45359237 kg exact (NIST SP 811).
const US_GAL = 3785.411784;
const IMP_GAL = 4546.09;
type Unit = { key: string; kind: 'volume' | 'weight'; factor: number; label: string };
const U = (key: string, kind: 'volume' | 'weight', factor: number, label: string): Unit => ({ key, kind, factor, label });
export const UNITS: Record<string, Unit> = Object.fromEntries([
  U('us_cup', 'volume', US_GAL / 16, 'US cup (236.5882365 mL)'),
  U('metric_cup', 'volume', 250, 'metric cup (250 mL, AU/NZ/CA/UK recipes)'),
  U('imperial_cup', 'volume', IMP_GAL / 16, 'imperial cup (10 imperial fl oz, 284.130625 mL)'),
  U('us_legal_cup', 'volume', 240, 'US legal cup for nutrition labels (240 mL)'),
  U('japanese_cup', 'volume', 200, 'Japanese cup (200 mL)'),
  U('us_tbsp', 'volume', US_GAL / 256, 'US tablespoon (14.786765 mL)'),
  U('us_tsp', 'volume', US_GAL / 768, 'US teaspoon (4.928922 mL)'),
  U('metric_tbsp', 'volume', 15, 'metric tablespoon (15 mL)'),
  U('metric_tsp', 'volume', 5, 'metric teaspoon (5 mL)'),
  U('au_tbsp', 'volume', 20, 'Australian tablespoon (20 mL)'),
  U('us_fl_oz', 'volume', US_GAL / 128, 'US fluid ounce (29.5735295625 mL)'),
  U('imperial_fl_oz', 'volume', IMP_GAL / 160, 'imperial fluid ounce (28.4130625 mL)'),
  U('us_pint', 'volume', US_GAL / 8, 'US pint (473.176473 mL)'),
  U('us_quart', 'volume', US_GAL / 4, 'US quart (946.352946 mL)'),
  U('us_gallon', 'volume', US_GAL, 'US gallon (3785.411784 mL)'),
  U('imperial_pint', 'volume', IMP_GAL / 8, 'imperial pint (568.26125 mL)'),
  U('imperial_quart', 'volume', IMP_GAL / 4, 'imperial quart (1136.5225 mL)'),
  U('imperial_gallon', 'volume', IMP_GAL, 'imperial gallon (4546.09 mL)'),
  U('ml', 'volume', 1, 'milliliter'),
  U('dl', 'volume', 100, 'deciliter'),
  U('l', 'volume', 1000, 'liter'),
  U('g', 'weight', 1, 'gram'),
  U('mg', 'weight', 0.001, 'milligram'),
  U('kg', 'weight', 1000, 'kilogram'),
  U('oz', 'weight', 453.59237 / 16, 'avoirdupois ounce (28.349523125 g)'),
  U('lb', 'weight', 453.59237, 'pound (453.59237 g)'),
  U('stick', 'weight', 453.59237 / 4, 'US stick of butter (1/4 lb, 113.398 g, 1/2 US cup)'),
].map((u) => [u.key, u]));

const ALIASES: Record<string, string> = {
  cup: 'cup', cups: 'cup', c: 'cup', 'us cup': 'us_cup', 'us cups': 'us_cup', 'metric cup': 'metric_cup', 'metric cups': 'metric_cup',
  'imperial cup': 'imperial_cup', 'uk cup': 'imperial_cup', 'japanese cup': 'japanese_cup', 'legal cup': 'us_legal_cup',
  tbsp: 'tbsp', tbs: 'tbsp', tbl: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp', T: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp', t: 'tsp',
  'fl oz': 'fl_oz', 'fl. oz': 'fl_oz', 'fl. oz.': 'fl_oz', floz: 'fl_oz', 'fluid ounce': 'fl_oz', 'fluid ounces': 'fl_oz',
  pint: 'pint', pints: 'pint', pt: 'pint', quart: 'quart', quarts: 'quart', qt: 'quart', gallon: 'gallon', gallons: 'gallon', gal: 'gallon',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml', cc: 'ml',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l', dl: 'dl', deciliter: 'dl', decilitre: 'dl',
  g: 'g', gram: 'g', grams: 'g', gr: 'g', kg: 'kg', kilogram: 'kg', kilograms: 'kg', kilo: 'kg', kilos: 'kg', mg: 'mg',
  oz: 'oz', ounce: 'oz', ounces: 'oz', lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb', stick: 'stick', sticks: 'stick',
};
export type System = 'us' | 'metric' | 'imperial';
const SYSTEM_MAP: Record<System, Record<string, string>> = {
  us: { cup: 'us_cup', tbsp: 'us_tbsp', tsp: 'us_tsp', fl_oz: 'us_fl_oz', pint: 'us_pint', quart: 'us_quart', gallon: 'us_gallon' },
  metric: { cup: 'metric_cup', tbsp: 'metric_tbsp', tsp: 'metric_tsp', fl_oz: 'us_fl_oz', pint: 'imperial_pint', quart: 'imperial_quart', gallon: 'imperial_gallon' },
  imperial: { cup: 'imperial_cup', tbsp: 'metric_tbsp', tsp: 'metric_tsp', fl_oz: 'imperial_fl_oz', pint: 'imperial_pint', quart: 'imperial_quart', gallon: 'imperial_gallon' },
};

export function resolveUnit(raw: string, system: System = 'us'): Unit {
  const t = raw.trim();
  const k = UNITS[t] ? t : (ALIASES[t] ?? ALIASES[t.toLowerCase()] ?? ALIASES[t.toLowerCase().replace(/\.$/, '')]);
  if (!k) throw new InputError(`Unknown unit "${raw}". Use one of: ${Object.keys(UNITS).join(', ')}, or cup, tbsp, tsp, fl oz, pint, quart, gallon (these follow cup_system).`);
  const key = UNITS[k] ? k : SYSTEM_MAP[system][k];
  return UNITS[key];
}

// ---------- ingredient search ----------
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%]+/g, ' ').trim();
const STOP = new Set(['of', 'and', 'or', 'the', 'a', 'fresh', 'cup', 'cups']);
const toks = (s: string) => norm(s).split(' ').filter((w) => w && !STOP.has(w)).map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));

function trigrams(s: string): Set<string> {
  const p = `  ${norm(s)} `;
  const out = new Set<string>();
  for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  return out;
}
function dice(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return (2 * n) / (a.size + b.size || 1);
}

export function scoreIngredient(q: string, ing: Ingredient): number {
  const nq = norm(q);
  const names = [ing.name, ing.id.replace(/-/g, ' '), ...ing.aliases];
  if (names.some((n) => norm(n) === nq)) return 1;
  const qt = toks(q);
  const qg = trigrams(q);
  let best = 0;
  for (const n of names) {
    const nt = toks(n);
    const hit = qt.filter((w) => nt.includes(w)).length;
    const cover = qt.length ? hit / qt.length : 0;
    const extra = nt.length ? hit / nt.length : 0;
    const s = 0.55 * cover + 0.2 * extra + 0.25 * dice(qg, trigrams(n));
    if (s > best) best = s;
  }
  return Math.min(best, 0.99);
}

export function rankIngredients(q: string): { ing: Ingredient; score: number }[] {
  return INGREDIENTS.map((ing) => ({ ing, score: scoreIngredient(q, ing) }))
    .sort((a, b) => b.score - a.score || a.ing.name.length - b.ing.name.length);
}

export function findIngredient(q: string): Ingredient {
  if (!q || !q.trim()) throw new InputError('ingredient is required for volume to weight conversions, e.g. "all-purpose flour".');
  if (/^(large |medium |whole |fresh )?eggs?$/i.test(q.trim())) throw new InputError('Whole eggs are counted, not measured by cup. King Arthur Baking lists 1 large egg at 50 g (white 30 to 35 g, yolk 14 g). For dried egg whites use "egg whites, dried".');
  const r = rankIngredients(q);
  if (r[0].score < 0.5) {
    throw new InputError(`No ingredient matched "${q}". Closest: ${r.slice(0, 5).map((x) => x.ing.name).join('; ')}. Call search_ingredients to pick one.`);
  }
  return r[0].ing;
}

const BUTTERY = new Set(['butter', 'margarine', 'shortening', 'lard', 'ghee']);
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const r1 = (x: number) => Math.round(x * 10) / 10;

function srcSummary(ing: Ingredient): string {
  const p = ing.primary;
  return p.source === 'usda_fdc'
    ? `USDA FoodData Central FDC ${p.fdc_id} (${p.portion} = ${p.gram_weight} g)`
    : `King Arthur Baking ingredient weight chart (${p.volume} = ${p.grams} g)`;
}
export function ingredientCard(ing: Ingredient) {
  return {
    id: ing.id, name: ing.name, g_per_us_cup: ing.g_per_us_cup,
    g_per_us_tbsp: r3(ing.g_per_us_cup / 16), g_per_us_tsp: r3(ing.g_per_us_cup / 48),
    g_per_ml: r3(ing.g_per_us_cup / UNITS.us_cup.factor * 1000) / 1000,
    density_source: ing.primary,
    other_published_values: ing.alternates.map((a) => ({ source: a.source, g_per_cup: a.g_per_cup, fdc_id: a.fdc_id, row: a.row ?? a.description })),
  };
}

function morePath(a: Unit, b: Unit): string {
  const ks = [a.key, b.key];
  const hasCup = ks.some((k) => k.includes('cup'));
  if (hasCup && ks.some((k) => k === 'oz')) return '/cups-to-ounces';
  if (hasCup && ks.some((k) => ['g', 'kg', 'mg'].includes(k))) return '/cups-to-grams';
  if (ks.some((k) => ['ml', 'l', 'dl'].includes(k))) return '/ml-to-cups';
  if (a.kind !== b.kind) return '/cups-to-grams';
  return '/answers/cooking-measurement-converter';
}

// ---------- convert_ingredient ----------
export function convertIngredient(i: Record<string, unknown>) {
  const amount = Number(i.amount);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e6) throw new InputError('amount must be a number from 0 to 1,000,000.');
  const system = (i.cup_system as System) ?? 'us';
  if (!SYSTEM_MAP[system]) throw new InputError('cup_system must be "us", "metric" or "imperial".');
  const from = resolveUnit(String(i.from_unit ?? ''), system);
  const to = resolveUnit(String(i.to_unit ?? ''), system);
  let ing: Ingredient | null = null;
  const needsDensity = from.kind !== to.kind;
  const usesStick = from.key === 'stick' || to.key === 'stick';
  if (needsDensity || usesStick || i.ingredient) ing = i.ingredient ? findIngredient(String(i.ingredient)) : null;
  if (needsDensity && !ing) throw new InputError('ingredient is required to convert between volume and weight, e.g. "granulated sugar".');
  if (usesStick && !(ing && BUTTERY.has(ing.id))) throw new InputError('stick is a butter unit (1/4 lb). Give ingredient "butter", "margarine", "shortening" or "lard", or use oz or g.');
  const gPerMl = ing ? ing.g_per_us_cup / UNITS.us_cup.factor : 0;
  // base quantity: mL for volume, g for weight
  const base = amount * from.factor;
  let out: number;
  if (from.kind === to.kind) out = base / to.factor;
  else if (from.kind === 'volume') out = (base * gPerMl) / to.factor;
  else out = base / gPerMl / to.factor;
  const cupUsed = [from, to].find((u) => u.key.includes('cup'));
  const result = r3(out);
  const summary = `${amount} ${from.key} ${ing ? `of ${ing.name} ` : ''}= ${result} ${to.key}.` +
    (ing && needsDensity ? ` Density ${ing.g_per_us_cup} g per US cup from ${srcSummary(ing)}.` : '') +
    (cupUsed ? ` Cup definition used: ${cupUsed.label}.` : ` Units: ${from.key} = ${from.label}; ${to.key} = ${to.label}.`) +
    (ing && needsDensity && /flour|meal|starch|cocoa|powder|sugar/.test(ing.id) ? ' Dry values assume spoon-and-level filling; scooping packs more in.' : '');
  return {
    summary,
    amount, from_unit: from.key, to_unit: to.key, result, result_exact: out,
    cup_definition_used: cupUsed ? { unit: cupUsed.key, ml: cupUsed.factor, label: cupUsed.label } : null,
    unit_factors: { [from.key]: { kind: from.kind, per_unit: from.factor, base: from.kind === 'volume' ? 'mL' : 'g' }, [to.key]: { kind: to.kind, per_unit: to.factor, base: to.kind === 'volume' ? 'mL' : 'g' } },
    ingredient: ing ? ingredientCard(ing) : null,
    as_of: AS_OF,
    source: ing && needsDensity ? ing.primary.url : (from.key.startsWith('imperial') || to.key.startsWith('imperial') ? UK_URL : NIST_URL),
    more: more(morePath(from, to)),
  };
}

// ---------- search_ingredients ----------
export function searchIngredients(i: Record<string, unknown>) {
  const q = String(i.query ?? '').trim();
  if (!q) throw new InputError('query is required, e.g. "brown sugar" or "flour".');
  const limit = Math.min(Math.max(Number(i.limit ?? 10), 1), 25);
  const ranked = rankIngredients(q).filter((r) => r.score >= 0.3).slice(0, limit);
  const results = ranked.map(({ ing, score }) => ({
    id: ing.id, name: ing.name, g_per_us_cup: ing.g_per_us_cup, g_per_us_tbsp: r3(ing.g_per_us_cup / 16),
    source: ing.primary.source, fdc_id: ing.primary.fdc_id, match: Math.round(score * 100) / 100,
  }));
  const summary = results.length
    ? `${results.length} match${results.length > 1 ? 'es' : ''} for "${q}". Best: ${results[0].name}, ${results[0].g_per_us_cup} g per US cup (${results[0].source === 'usda_fdc' ? `USDA FDC ${results[0].fdc_id}` : 'King Arthur Baking chart'}). Table has ${INGREDIENTS.length} ingredients with measured weights.`
    : `No ingredient matched "${q}". The table has ${INGREDIENTS.length} ingredients; try a simpler name such as "flour", "sugar" or "oil".`;
  return {
    summary, query: q, results, table_size: INGREDIENTS.length, as_of: AS_OF,
    source: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart',
    more: more('/cups-to-grams'),
  };
}

// ---------- recipe line parsing and scaling ----------
const VULGAR: Record<string, number> = { '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4, '⅕': 1 / 5, '⅖': 2 / 5, '⅗': 3 / 5, '⅘': 4 / 5, '⅙': 1 / 6, '⅚': 5 / 6, '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8 };
const UNIT_WORDS = Object.keys(ALIASES).filter((k) => !['c', 't', 'T', 'l', 'g'].includes(k)).sort((a, b) => b.length - a.length);

export function parseLine(line: string): { qty: number | null; unitRaw: string | null; rest: string } {
  let s = line.trim().replace(/^[-*•]\s*/, '');
  for (const [k, v] of Object.entries(VULGAR)) s = s.replace(new RegExp(`(\\d)\\s*${k}`), (_m, d) => `${d} ${v}`).replace(k, String(v));
  const m = s.match(/^(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?)\/(\d+)|\s+(0?\.\d+)|\/(\d+))?/);
  let qty: number | null = null;
  if (m) {
    if (m[5]) qty = Number(m[1]) / Number(m[5]);
    else if (m[2]) qty = Number(m[1]) + Number(m[2]) / Number(m[3]);
    else if (m[4]) qty = Number(m[1]) + Number(m[4]);
    else qty = Number(m[1]);
    s = s.slice(m[0].length).trim();
  }
  let unitRaw: string | null = null;
  const um = s.match(/^([A-Za-z.]+(?:\s(?:oz|oz\.|cups?|ounces?))?)\b\.?/);
  if (um) {
    const cand = [um[1], um[1].split(' ')[0]];
    for (const c of cand) {
      const lc = c.toLowerCase().replace(/\.$/, '');
      const exact = ['c', 't', 'T', 'l', 'g'].includes(c) ? c : null;
      if (exact || UNIT_WORDS.includes(lc) || UNITS[lc]) { unitRaw = exact ?? lc; s = s.slice(c.length).replace(/^\.?\s*(of\s+)?/, ''); break; }
    }
  }
  return { qty, unitRaw, rest: s.replace(/^,\s*/, '').trim() };
}

function fmtQty(x: number): string {
  const whole = Math.floor(x + 1e-9);
  const fr = x - whole;
  const fracs: [number, string][] = [[0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'], [1 / 2, '1/2'], [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [7 / 8, '7/8'], [1, '']];
  for (const [v, t] of fracs) {
    if (Math.abs(fr - v) < 0.01) {
      const w = v === 1 ? whole + 1 : whole;
      return t ? (w ? `${w} ${t}` : t) : String(w);
    }
  }
  return String(r3(x));
}

export function scaleRecipe(i: Record<string, unknown>) {
  const lines = i.lines as string[];
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 60) throw new InputError('lines must be a list of 1 to 60 ingredient lines.');
  let factor: number;
  if (i.factor != null) factor = Number(i.factor);
  else if (i.original_servings != null && i.target_servings != null) factor = Number(i.target_servings) / Number(i.original_servings);
  else throw new InputError('Give factor (e.g. 2 or 0.5), or both original_servings and target_servings.');
  if (!Number.isFinite(factor) || factor <= 0 || factor > 100) throw new InputError('The scale factor must be above 0 and at most 100.');
  const toMetric = Boolean(i.to_metric_weights);
  const system = (i.cup_system as System) ?? 'us';
  const out = lines.map((line) => {
    const p = parseLine(String(line));
    const row: Record<string, unknown> = { original: line, ingredient_text: p.rest };
    if (p.qty == null) return { ...row, scaled: line, note: 'No leading quantity found; left unchanged.' };
    const q = p.qty * factor;
    row.quantity = r3(p.qty); row.scaled_quantity = r3(q); row.unit = p.unitRaw;
    row.scaled = `${fmtQty(q)}${p.unitRaw ? ` ${p.unitRaw}` : ''} ${p.rest}`.trim();
    if (!toMetric) return row;
    let unit: Unit | null = null;
    try { unit = p.unitRaw ? resolveUnit(p.unitRaw, system) : null; } catch { unit = null; }
    if (!unit) return { ...row, metric: null, note: 'No measuring unit (count item such as eggs); left as a count.' };
    if (unit.kind === 'weight') return { ...row, metric: { grams: r1(q * unit.factor) } };
    const r = rankIngredients(p.rest)[0];
    if (r.score < 0.5) return { ...row, metric: { ml: r1(q * unit.factor) }, note: `No density match for "${p.rest}"; gave mL.` };
    const grams = (q * unit.factor * r.ing.g_per_us_cup) / UNITS.us_cup.factor;
    return { ...row, metric: { grams: r1(grams), ml: r1(q * unit.factor), matched: r.ing.name, g_per_us_cup: r.ing.g_per_us_cup, density_source: r.ing.primary.source, fdc_id: r.ing.primary.fdc_id } };
  });
  const converted = out.filter((o) => (o as { metric?: { grams?: number } }).metric?.grams != null).length;
  const summary = `Scaled ${lines.length} line${lines.length > 1 ? 's' : ''} by ${r3(factor)}.` +
    (toMetric ? ` ${converted} converted to grams with measured densities; volumes read as ${system === 'us' ? 'US' : system} cups and spoons.` : '') +
    ' Scale leavening, salt and spices with care; pan size and bake time do not scale linearly.';
  return {
    summary, factor: r3(factor), lines: out, as_of: AS_OF,
    source: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart',
    more: more(toMetric ? '/tools/recipe-converter-metric' : '/tools/recipe-scaling-calculator'),
  };
}

// ---------- oven temperature ----------
// Gas mark table: Wikipedia "Gas mark" conversion table (values used in recipes).
export const GAS: { mark: number; label: string; f: number; c: number; desc: string }[] = [
  { mark: 0.25, label: '1/4', f: 225, c: 110, desc: 'very slow' }, { mark: 0.5, label: '1/2', f: 250, c: 120, desc: 'very slow' },
  { mark: 1, label: '1', f: 275, c: 140, desc: 'slow' }, { mark: 2, label: '2', f: 300, c: 150, desc: 'slow' },
  { mark: 3, label: '3', f: 325, c: 170, desc: 'moderately slow' }, { mark: 4, label: '4', f: 350, c: 180, desc: 'moderate' },
  { mark: 5, label: '5', f: 375, c: 190, desc: 'moderately hot' }, { mark: 6, label: '6', f: 400, c: 200, desc: 'moderately hot' },
  { mark: 7, label: '7', f: 425, c: 220, desc: 'hot' }, { mark: 8, label: '8', f: 450, c: 230, desc: 'very hot' },
  { mark: 9, label: '9', f: 475, c: 240, desc: 'very hot' }, { mark: 10, label: '10', f: 500, c: 260, desc: 'extremely hot' },
];
export const FAN_DELTA_C = 20; // Hoover UK: fan ovens "can generally be set lower by 20C"

export function convertOvenTemperature(i: Record<string, unknown>) {
  const from = String(i.from_scale ?? '').toLowerCase();
  const v = Number(i.value);
  if (!Number.isFinite(v)) throw new InputError('value must be a number, e.g. 350, 180 or 4 (gas mark).');
  const fan = (i.fan as string) ?? 'none';
  if (!['none', 'conventional_to_fan', 'fan_to_conventional'].includes(fan)) throw new InputError('fan must be "none", "conventional_to_fan" or "fan_to_conventional".');
  let c: number;
  let gasExact: (typeof GAS)[number] | undefined;
  if (from === 'f' || from === 'fahrenheit') c = ((v - 32) * 5) / 9;
  else if (from === 'c' || from === 'celsius') c = v;
  else if (from === 'gas' || from === 'gas_mark') {
    gasExact = GAS.find((g) => Math.abs(g.mark - v) < 1e-9);
    if (!gasExact) throw new InputError('Gas mark must be 0.25, 0.5 or a whole number from 1 to 10.');
    c = gasExact.c;
  } else throw new InputError('from_scale must be "F", "C" or "gas".');
  if (c < 50 || c > 300) throw new InputError('Oven temperature must be between 50 C and 300 C (122 F to 572 F).');
  const f = gasExact ? gasExact.f : (c * 9) / 5 + 32;
  const nearest = GAS.reduce((a, b) => (Math.abs(b.f - f) < Math.abs(a.f - f) ? b : a));
  const gasInRange = f >= 212.5 && f <= 512.5;
  let fanOut: { c: number; f: number; direction: string } | null = null;
  if (fan !== 'none') {
    const fc = fan === 'conventional_to_fan' ? c - FAN_DELTA_C : c + FAN_DELTA_C;
    fanOut = { c: r1(fc), f: r1((fc * 9) / 5 + 32), direction: fan };
  }
  const head = gasExact ? `Gas mark ${gasExact.label} = ${gasExact.f} F = ${gasExact.c} C` : from.startsWith('f') ? `${v} F = ${r1(c)} C` : `${v} C = ${r1(f)} F`;
  const summary = head +
    (gasInRange ? `, nearest gas mark ${nearest.label} (${nearest.f} F / ${nearest.c} C, ${nearest.desc}).` : ', outside the gas mark range.') +
    (fanOut ? ` ${fan === 'conventional_to_fan' ? 'Fan (convection) setting' : 'Conventional setting'}: ${fanOut.c} C / ${fanOut.f} F, a ${FAN_DELTA_C} C change.` : '') +
    ' Recipe tables round Celsius to the nearest 10.';
  return {
    summary, input: { value: v, scale: gasExact ? 'gas' : from.slice(0, 1).toUpperCase() },
    fahrenheit: r1(f), celsius: r1(c),
    gas_mark: gasInRange ? { mark: nearest.mark, label: nearest.label, table_f: nearest.f, table_c: nearest.c, exact: Math.abs(nearest.f - f) < 0.5, description: nearest.desc } : null,
    fan_adjusted: fanOut,
    as_of: AS_OF, source: fanOut ? FAN_URL : GAS_URL, sources: [GAS_URL, FAN_URL],
    more: more('/recipe-converter'),
  };
}
