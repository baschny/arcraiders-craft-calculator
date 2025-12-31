export interface LocalizedString {
  en: string;
  de?: string;
  fr?: string;
  es?: string;
  pt?: string;
  pl?: string;
  no?: string;
  da?: string;
  it?: string;
  ru?: string;
  ja?: string;
  'zh-TW'?: string;
  uk?: string;
  'zh-CN'?: string;
  kr?: string;
  tr?: string;
  hr?: string;
  sr?: string;
}

export interface ItemRecipe {
  [materialId: string]: number;
}

export interface Item {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  type?: string;
  value?: number;
  rarity?: string;
  stackSize?: number;
  weightKg?: number;
  imageFilename?: string;
  recipe?: ItemRecipe;
  craftBench?: string;
  recyclesInto?: ItemRecipe;
  salvagesInto?: ItemRecipe;
  foundIn?: string;
  updatedAt?: string;
  effects?: Record<string, unknown>;
}

export interface ItemDatabase {
  [itemId: string]: Item;
}
