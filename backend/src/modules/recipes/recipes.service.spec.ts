import { matchIngredient } from './recipes.service';

describe('matchIngredient 食材匹配', () => {
  // ============ 精确匹配 ============
  it('完全相同的名称应匹配', () => {
    expect(matchIngredient('豆腐', '豆腐')).toBe(true);
    expect(matchIngredient('青椒', '青椒')).toBe(true);
  });

  // ============ 别名匹配 ============
  it('常见别名应互相匹配', () => {
    expect(matchIngredient('土豆', '马铃薯')).toBe(true);
    expect(matchIngredient('马铃薯', '土豆')).toBe(true);
    expect(matchIngredient('西红柿', '番茄')).toBe(true);
    expect(matchIngredient('西红柿', '马铃薯')).toBe(false);
  });

  // ============ 误匹配防护（Review 中的核心问题）============
  it('单字"鸡"不应匹配"鸡翅"（部位词防护）', () => {
    expect(matchIngredient('鸡', '鸡翅')).toBe(false);
    expect(matchIngredient('鸡翅', '鸡')).toBe(false);
  });

  it('泛称"肉"不应匹配具体部位"排骨"', () => {
    expect(matchIngredient('肉', '排骨')).toBe(false);
    expect(matchIngredient('排骨', '肉')).toBe(false);
  });

  it('泛称"鸡肉"不应匹配"鸡爪"', () => {
    expect(matchIngredient('鸡肉', '鸡爪')).toBe(false);
  });

  // ============ 合理的形态变体 ============
  it('合理长度的包含关系应匹配（>=2字）', () => {
    expect(matchIngredient('嫩豆腐', '豆腐')).toBe(true);
    expect(matchIngredient('豆腐', '嫩豆腐')).toBe(true);
  });

  // ============ 边界情况 ============
  it('空值和空白不应匹配', () => {
    expect(matchIngredient('', '豆腐')).toBe(false);
    expect(matchIngredient('豆腐', '')).toBe(false);
    expect(matchIngredient('  ', '豆腐')).toBe(false);
  });

  it('完全不相关的食材不应匹配', () => {
    expect(matchIngredient('土豆', '西红柿')).toBe(false);
    expect(matchIngredient('牛肉', '猪肉')).toBe(false);
  });

  it('别名组与部位词组合：五花肉与猪肉应匹配（别名组）', () => {
    expect(matchIngredient('猪肉', '五花肉')).toBe(true);
  });
});
