import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as core from '../dist/core.js';

// Expected values come from scripts/expected.py (unit definitions and published table values),
// never from the code under test.
const fixtures = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8'));
const fns = {
  convert_ingredient: core.convertIngredient,
  search_ingredients: core.searchIngredients,
  scale_recipe: core.scaleRecipe,
  convert_oven_temperature: core.convertOvenTemperature,
};
const get = (o, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);

for (const fx of fixtures) {
  test(`fixture: ${fx.name}`, () => {
    const out = fns[fx.tool](fx.input);
    for (const [path, want] of Object.entries(fx.expect)) assert.deepEqual(get(out, path), want, `${fx.name} -> ${path}`);
    assert.ok(out.summary.length > 40);
    assert.match(out.more, /^https:\/\/ingredientcalculator\.com\/.*\?utm_source=mcp&utm_medium=cups-to-grams-mcp$/);
    assert.equal(out.as_of, '2026-10-30');
    assert.match(out.source, /^https:\/\//);
  });
}

test('fixture count is at least 15', () => assert.ok(fixtures.length >= 15, String(fixtures.length)));

test('table has at least 120 ingredients and every row carries a source', () => {
  assert.ok(core.INGREDIENTS.length >= 120, String(core.INGREDIENTS.length));
  for (const i of core.INGREDIENTS) {
    assert.ok(['king_arthur', 'usda_fdc'].includes(i.primary.source), i.id);
    assert.match(i.primary.url, /^https:\/\//);
    if (i.primary.source === 'usda_fdc') assert.ok(Number.isInteger(i.primary.fdc_id), i.id);
    assert.equal(i.g_per_us_cup, i.primary.g_per_cup, i.id);
    assert.ok(i.g_per_us_cup > 1 && i.g_per_us_cup <= 500, `${i.id} ${i.g_per_us_cup}`);
  }
  assert.equal(new Set(core.INGREDIENTS.map((i) => i.id)).size, core.INGREDIENTS.length);
});

test('errors are InputError with clear text', () => {
  assert.throws(() => core.convertIngredient({ amount: 1, from_unit: 'cup', to_unit: 'g' }), /ingredient is required/);
  assert.throws(() => core.convertIngredient({ amount: 1, from_unit: 'bucket', to_unit: 'g', ingredient: 'flour' }), /Unknown unit/);
  assert.throws(() => core.convertIngredient({ amount: 1, from_unit: 'stick', to_unit: 'g', ingredient: 'flour' }), /stick is a butter unit/);
  assert.throws(() => core.convertIngredient({ amount: 1, from_unit: 'cup', to_unit: 'g', ingredient: 'zzqxv' }), /No ingredient matched/);
  assert.throws(() => core.convertIngredient({ amount: 1, from_unit: 'cup', to_unit: 'g', ingredient: 'eggs' }), /counted/);
  assert.throws(() => core.scaleRecipe({ lines: ['1 cup flour'] }), /factor/);
  assert.throws(() => core.convertOvenTemperature({ value: 11, from_scale: 'gas' }), /Gas mark/);
});

test('fraction parsing', () => {
  assert.deepEqual(core.parseLine('1 1/2 cups flour'), { qty: 1.5, unitRaw: 'cups', rest: 'flour' });
  assert.equal(core.parseLine('¾ cup sugar').qty, 0.75);
  assert.equal(core.parseLine('2½ tbsp honey').qty, 2.5);
  assert.equal(core.parseLine('3/4 tsp salt').unitRaw, 'tsp');
});
