import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: number;
  quantity: number;
}

const STORAGE_KEY = 'el-zapatito-cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items = signal<CartItem[]>(this.loadFromStorage());

  readonly cartItems = computed(() => this.items());
  readonly totalItems = computed(() => this.items().reduce((acc, i) => acc + i.quantity, 0));
  readonly totalPrice = computed(() => this.items().reduce((acc, i) => acc + i.price * i.quantity, 0));

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      // Almacenamiento no disponible; el carrito seguirá funcionando en memoria.
    }
  }

  addItem(item: CartItem) {
    this.items.update(list => {
      const existing = list.find(i => i.productId === item.productId && i.size === item.size);
      if (existing) {
        return list.map(i =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...list, item];
    });
    this.persist();
  }

  removeItem(productId: string, size: number) {
    this.items.update(list => list.filter(i => !(i.productId === productId && i.size === size)));
    this.persist();
  }

  clear() {
    this.items.set([]);
    this.persist();
  }
}