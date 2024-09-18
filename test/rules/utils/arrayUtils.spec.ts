import { describe, it, expect } from 'vitest';
import { addToList } from '@/rules/utils/arrayUtils';

describe('src/rules/utils/arrayUtils.ts', () => {
  it('adds items to an empty list', () => {
    const items = ['apple', 'banana'];
    const list: string[] = [];
    const result = addToList(items, list);
    expect(result).toEqual(['apple', 'banana']);
  });

  it('adds items to an existing list', () => {
    const items = ['orange', 'grape'];
    const list = ['apple', 'banana'];
    const result = addToList(items, list);
    expect(result).toEqual(['apple', 'banana', 'orange', 'grape']);
  });

  it('ensures the original list is not mutated', () => {
    const items = ['kiwi'];
    const list = ['apple'];
    const result = addToList(items, list);
    expect(list).toEqual(['apple']);
    expect(result).toEqual(['apple', 'kiwi']);
  });

  it('handles an empty items array', () => {
    const items: string[] = [];
    const list = ['apple', 'banana'];
    const result = addToList(items, list);
    expect(result).toEqual(['apple', 'banana']);
  });

  it('handles both items and list being empty', () => {
    const items: string[] = [];
    const list: string[] = [];
    const result = addToList(items, list);
    expect(result).toEqual([]);
  });
});
