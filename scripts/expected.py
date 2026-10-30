"""Expected fixture values from first principles (unit definitions and published table values),
independent of src/. Run: python3 -I scripts/expected.py > test/fixtures.json"""
import json
from decimal import Decimal as D, ROUND_HALF_UP
r3 = lambda x: float(D(str(x)).quantize(D('0.001'), ROUND_HALF_UP))
r1 = lambda x: float(D(str(x)).quantize(D('0.1'), ROUND_HALF_UP))
US_GAL = D('231') * D('2.54') ** 3          # mL, NIST: gallon = 231 in^3, in = 2.54 cm
CUP = US_GAL / 16
LB = D('453.59237')
IMP_GAL = D('4546.09')                       # UK Weights and Measures Act 1985
fx = []
def conv(name, inp, result, extra=None):
    e = {'result': result}; e.update(extra or {})
    fx.append({'name': name, 'tool': 'convert_ingredient', 'input': inp, 'expect': e})
conv('US cup is 236.588 mL', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'ml'}, r3(CUP), {'cup_definition_used.unit': 'us_cup'})
conv('US tablespoon is 14.787 mL', {'amount': 1, 'from_unit': 'tbsp', 'to_unit': 'ml'}, r3(CUP / 16))
conv('US teaspoon is 4.929 mL', {'amount': 1, 'from_unit': 'tsp', 'to_unit': 'ml'}, r3(CUP / 48))
conv('US fl oz is 29.574 mL', {'amount': 1, 'from_unit': 'fl oz', 'to_unit': 'ml'}, r3(CUP / 8))
conv('16 tbsp is 1 cup', {'amount': 16, 'from_unit': 'tbsp', 'to_unit': 'cup'}, 1.0)
conv('1 lb is 453.592 g', {'amount': 1, 'from_unit': 'lb', 'to_unit': 'g'}, r3(LB))
conv('1 oz is 28.35 g', {'amount': 1, 'from_unit': 'oz', 'to_unit': 'g'}, r3(LB / 16))
conv('imperial pint is 568.261 mL', {'amount': 1, 'from_unit': 'imperial_pint', 'to_unit': 'ml'}, r3(IMP_GAL / 8))
conv('metric cup is 250 mL', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'ml', 'cup_system': 'metric'}, 250.0, {'cup_definition_used.unit': 'metric_cup'})
conv('1 L is 4.227 US cups', {'amount': 1, 'from_unit': 'l', 'to_unit': 'us_cup'}, r3(1000 / CUP))
# table values: KA AP flour 1 cup = 120 g; USDA FDC 169655 sugar 1 cup = 200 g; FDC 173430 butter 1 cup = 227 g;
# FDC 169640 honey 1 cup = 339 g; FDC 174158 water 1 cup = 237 g; FDC 168833 brown sugar packed 1 cup = 220 g
conv('AP flour 1 cup = 120 g (King Arthur)', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'all-purpose flour'}, 120.0, {'ingredient.density_source.source': 'king_arthur'})
conv('granulated sugar 1 cup = 200 g (USDA 169655)', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'granulated sugar'}, 200.0, {'ingredient.density_source.fdc_id': 169655})
conv('butter 1 cup = 227 g (USDA 173430)', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'butter'}, 227.0, {'ingredient.density_source.fdc_id': 173430})
conv('honey 1 cup = 339 g (USDA 169640)', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'honey'}, 339.0, {'ingredient.density_source.fdc_id': 169640})
conv('water 1 cup = 237 g (USDA 174158)', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'water'}, 237.0)
conv('honey 1 tbsp = 339/16 g', {'amount': 1, 'from_unit': 'tbsp', 'to_unit': 'g', 'ingredient': 'honey'}, r3(D(339) / 16))
conv('brown sugar 1/2 cup = 110 g', {'amount': 0.5, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'brown sugar'}, 110.0)
conv('100 g sugar = 1/2 cup', {'amount': 100, 'from_unit': 'g', 'to_unit': 'cup', 'ingredient': 'sugar'}, 0.5)
conv('1 stick butter = 1/4 lb', {'amount': 1, 'from_unit': 'stick', 'to_unit': 'g', 'ingredient': 'butter'}, r3(LB / 4))
conv('AP flour 1 metric cup = 120 x 250 / 236.588', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'g', 'ingredient': 'all-purpose flour', 'cup_system': 'metric'}, r3(D(120) * 250 / CUP))
conv('milk 1 cup to oz weight = 244 / 28.3495', {'amount': 1, 'from_unit': 'cup', 'to_unit': 'oz', 'ingredient': 'milk'}, r3(D(244) / (LB / 16)))
fx.append({'name': 'search flour finds AP flour first', 'tool': 'search_ingredients', 'input': {'query': 'icing sugar'}, 'expect': {'results.0.id': 'powdered-sugar', 'results.0.g_per_us_cup': 120.0}})
fx.append({'name': 'scale 1 1/2 cups AP flour x2 = 3 cups = 360 g', 'tool': 'scale_recipe', 'input': {'lines': ['1 1/2 cups all-purpose flour', '½ cup sugar'], 'factor': 2, 'to_metric_weights': True},
           'expect': {'lines.0.scaled_quantity': 3.0, 'lines.0.metric.grams': 360.0, 'lines.1.scaled': '1 cup sugar', 'lines.1.metric.grams': 200.0}})
fx.append({'name': 'scale by servings 4 to 6', 'tool': 'scale_recipe', 'input': {'lines': ['2 tbsp honey'], 'original_servings': 4, 'target_servings': 6, 'to_metric_weights': True},
           'expect': {'factor': 1.5, 'lines.0.scaled_quantity': 3.0, 'lines.0.metric.grams': r1(D(339) * 3 / 16)}})
fx.append({'name': '350 F = 176.7 C, gas 4', 'tool': 'convert_oven_temperature', 'input': {'value': 350, 'from_scale': 'F'}, 'expect': {'celsius': r1((D(350) - 32) * 5 / 9), 'gas_mark.mark': 4, 'gas_mark.exact': True}})
fx.append({'name': 'gas 6 = 400 F / 200 C', 'tool': 'convert_oven_temperature', 'input': {'value': 6, 'from_scale': 'gas'}, 'expect': {'fahrenheit': 400.0, 'celsius': 200.0}})
fx.append({'name': '180 C conventional = 160 C fan', 'tool': 'convert_oven_temperature', 'input': {'value': 180, 'from_scale': 'C', 'fan': 'conventional_to_fan'}, 'expect': {'fan_adjusted.c': 160.0, 'fan_adjusted.f': 320.0, 'fahrenheit': 356.0}})
print(json.dumps(fx, indent=1, ensure_ascii=False))
