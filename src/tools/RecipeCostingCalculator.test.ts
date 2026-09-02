import { describe, expect, it } from 'vitest';
import { costRecipe, Ingredient, Recipe } from './RecipeCostingCalculator';

const ingredients: Ingredient[] = [
  { id: 'flour', name: 'Flour', pricePerKg: 20 },
  { id: 'cheese', name: 'Cheese', pricePerKg: 200 },
];

describe('costRecipe', () => {
  it('sums ingredient cost proportional to grams used', () => {
    const recipe: Recipe = { id: 'r1', name: 'Pizza', sellingPrice: 100, lines: [{ ingredientId: 'flour', grams: 250 }, { ingredientId: 'cheese', grams: 100 }] };
    const r = costRecipe(recipe, ingredients, 30);
    // flour: 250/1000 * 20 = 5, cheese: 100/1000 * 200 = 20 -> total 25
    expect(r.cost).toBe(25);
  });

  it('computes food cost percentage as cost over selling price', () => {
    const recipe: Recipe = { id: 'r1', name: 'Pizza', sellingPrice: 100, lines: [{ ingredientId: 'flour', grams: 1000 }] };
    const r = costRecipe(recipe, ingredients, 30);
    expect(r.foodCostPct).toBeCloseTo(20, 5);
  });

  it('flags a recipe as losing money when cost exceeds selling price', () => {
    const recipe: Recipe = { id: 'r1', name: 'Pizza', sellingPrice: 10, lines: [{ ingredientId: 'cheese', grams: 1000 }] };
    const r = costRecipe(recipe, ingredients, 30);
    expect(r.isLosing).toBe(true);
    expect(r.profit).toBeLessThan(0);
  });

  it('suggests a selling price that hits the target food-cost percentage', () => {
    const recipe: Recipe = { id: 'r1', name: 'Pizza', sellingPrice: 100, lines: [{ ingredientId: 'flour', grams: 1000 }] };
    const r = costRecipe(recipe, ingredients, 25);
    // cost = 20, target 25% -> suggested price = 20 / 0.25 = 80
    expect(r.suggestedPrice).toBeCloseTo(80, 5);
  });

  it('reacts to an updated ingredient price by recalculating cost', () => {
    const recipe: Recipe = { id: 'r1', name: 'Pizza', sellingPrice: 100, lines: [{ ingredientId: 'flour', grams: 1000 }] };
    const cheaperFlour: Ingredient[] = [{ id: 'flour', name: 'Flour', pricePerKg: 10 }];
    const r = costRecipe(recipe, cheaperFlour, 30);
    expect(r.cost).toBe(10);
  });

  it('ignores lines referencing an ingredient that no longer exists', () => {
    const recipe: Recipe = { id: 'r1', name: 'Pizza', sellingPrice: 100, lines: [{ ingredientId: 'missing', grams: 500 }] };
    const r = costRecipe(recipe, ingredients, 30);
    expect(r.cost).toBe(0);
  });
});
