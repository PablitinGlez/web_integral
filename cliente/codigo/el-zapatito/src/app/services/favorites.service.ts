import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  favorites = signal<any[]>([]);

  private storageKey = 'el-zapatito-favorites';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.favorites.set(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      this.favorites.set([]);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(this.favorites()));
  }

  isFavorite(productId: string | number | undefined): boolean {
    if (!productId) return false;
    return this.favorites().some(item => String(item?.id) === String(productId));
  }

  toggleFavorite(product: any) {
    if (!product?.id) return;
    const current = this.favorites();
    const exists = current.some(item => String(item.id) === String(product.id));

    const next = exists
      ? current.filter(item => String(item.id) !== String(product.id))
      : [...current, product];

    this.favorites.set(next);
    this.persist();
    return next;
  }

  removeFavorite(productId: string | number | undefined) {
    if (!productId) return;
    const next = this.favorites().filter(item => String(item?.id) !== String(productId));
    this.favorites.set(next);
    this.persist();
    return next;
  }

  clearFavorites() {
    this.favorites.set([]);
    this.persist();
  }
}
