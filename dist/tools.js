import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { InputError, convertIngredient, searchIngredients, scaleRecipe, convertOvenTemperature, INGREDIENTS } from './core.js';
export const SERVER_NAME = 'cups-to-grams-mcp';
export const SERVER_VERSION = '1.0.0';
const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const cupSystem = z.enum(['us', 'metric', 'imperial']).describe('Which cup and spoon family the bare words cup, tbsp, tsp, fl oz and pint mean. us = 236.588 mL cup (default), metric = 250 mL cup with 15/5 mL spoons, imperial = 284.13 mL cup with UK pints. Explicit units such as metric_cup always win.').optional();
function wrap(fn) {
    return async (args) => {
        try {
            const out = fn(args);
            return { content: [{ type: 'text', text: `${out.summary}\n\n${JSON.stringify(out, null, 2)}` }], structuredContent: out };
        }
        catch (e) {
            const msg = e instanceof InputError ? e.message : `Unexpected error: ${e.message}`;
            return { content: [{ type: 'text', text: msg }], isError: true };
        }
    };
}
export function registerTools(server) {
    server.registerTool('convert_ingredient', {
        title: 'Convert cups to grams for a named ingredient',
        description: `Converts a kitchen amount between volume and weight for a specific ingredient, using measured grams-per-cup values (USDA FoodData Central portion weights with FDC ids, and the King Arthur Baking ingredient weight chart) instead of guessed densities. ${INGREDIENTS.length} ingredients. Units: US cup (236.5882365 mL), metric cup (250 mL), imperial cup, US legal cup (240 mL), Japanese cup, US/metric/Australian tablespoons, teaspoons, US and imperial fl oz, pints, quarts, gallons, mL, dL, L, g, mg, kg, oz, lb and sticks of butter. Volume to volume and weight to weight need no ingredient. States which cup definition it used and cites the density source.`,
        inputSchema: {
            amount: z.number().min(0).max(1_000_000).describe('Quantity to convert, e.g. 1.5. Use decimals for fractions (3/4 = 0.75).'),
            from_unit: z.string().min(1).max(30).describe('Unit to convert from, e.g. cup, us_cup, metric_cup, tbsp, tsp, fl oz, ml, l, g, oz, lb, stick.'),
            to_unit: z.string().min(1).max(30).describe('Unit to convert to, e.g. g, oz, cup, ml.'),
            ingredient: z.string().max(80).describe('Ingredient name, e.g. "all-purpose flour", "brown sugar", "honey". Required when converting between volume and weight.').optional(),
            cup_system: cupSystem,
        },
        annotations: { title: 'Convert ingredient', ...RO },
    }, wrap(convertIngredient));
    server.registerTool('search_ingredients', {
        title: 'Search the measured ingredient density table',
        description: 'Fuzzy search over the ingredient table (flours, sugars, fats, dairy, liquids, nuts, grains, fruit, produce). Returns canonical names, grams per US cup and per tablespoon, and the source (USDA FDC id or King Arthur Baking chart). Use it to pick the exact ingredient before converting.',
        inputSchema: {
            query: z.string().min(1).max(80).describe('Ingredient name or part of it, e.g. "flour", "confectioners sugar", "oats".'),
            limit: z.number().int().min(1).max(25).describe('Maximum results. Default 10.').optional(),
        },
        annotations: { title: 'Search ingredients', ...RO },
    }, wrap(searchIngredients));
    server.registerTool('scale_recipe', {
        title: 'Scale a recipe and convert it to grams',
        description: 'Scales a list of recipe ingredient lines ("1 1/2 cups all-purpose flour", "2 tbsp honey", "3 eggs") by a factor or from original to target servings. Parses mixed numbers and fraction characters. With to_metric_weights, converts cup and spoon amounts to grams with the measured density table and weights to grams, and reports lines it could not match.',
        inputSchema: {
            lines: z.array(z.string().min(1).max(200)).min(1).max(60).describe('Ingredient lines, one per item, quantity first.'),
            factor: z.number().positive().max(100).describe('Multiply every quantity by this, e.g. 2 or 0.5. Or give servings instead.').optional(),
            original_servings: z.number().positive().max(1000).describe('Servings the recipe makes now.').optional(),
            target_servings: z.number().positive().max(1000).describe('Servings you want.').optional(),
            to_metric_weights: z.boolean().describe('Also give grams for each line. Default false.').optional(),
            cup_system: cupSystem,
        },
        annotations: { title: 'Scale recipe', ...RO },
    }, wrap(scaleRecipe));
    server.registerTool('convert_oven_temperature', {
        title: 'Convert oven temperature between F, C and gas mark',
        description: 'Converts an oven setting between Fahrenheit, Celsius and UK gas mark (1/4 to 10, from the standard recipe table) and optionally adjusts for a fan (convection) oven by 20 C, the manufacturer guidance. Returns the nearest gas mark and whether it is an exact table value.',
        inputSchema: {
            value: z.number().describe('Temperature or gas mark, e.g. 350, 180 or 4.'),
            from_scale: z.enum(['F', 'C', 'gas']).describe('Scale of value: F, C or gas (gas mark).'),
            fan: z.enum(['none', 'conventional_to_fan', 'fan_to_conventional']).describe('Fan oven adjustment. Default none.').optional(),
        },
        annotations: { title: 'Convert oven temperature', ...RO },
    }, wrap(convertOvenTemperature));
}
export function createServer() {
    const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
    registerTools(server);
    return server;
}
