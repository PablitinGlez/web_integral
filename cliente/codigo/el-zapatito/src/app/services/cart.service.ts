import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  product: {
    id: string;
    name: string;
    brand?: string;
    price: number;
    main_image_url?: string;
  };
  size: number;
  quantity: number;
  unit_price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSignal = signal<CartItem[]>([]);

  // Exponer el signal de forma de solo lectura
  cartItems = this.cartItemsSignal.asReadonly();

  // Control del estado abierto/cerrado del drawer del carrito
  isCartOpen = signal(false);

  // Signals computados para contar e importe
  cartCount = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });

  cartTotal = computed(() => {
    return this.cartItemsSignal().reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  });

  constructor() {
    this.loadCart();
    
    // Guardar en localStorage de forma reactiva ante cualquier cambio
    effect(() => {
      localStorage.setItem('cart_items', JSON.stringify(this.cartItemsSignal()));
    });
  }

  private loadCart() {
    try {
      const stored = localStorage.getItem('cart_items');
      if (stored) {
        this.cartItemsSignal.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error al cargar el carrito de localStorage:', e);
    }
  }

  addToCart(product: any, size: number, quantity: number) {
    this.cartItemsSignal.update(items => {
      const existingIndex = items.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...items, {
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: Number(product.price),
            main_image_url: product.main_image_url
          },
          size: size,
          quantity: quantity,
          unit_price: Number(product.price)
        }];
      }
    });
  }

  removeFromCart(productId: string, size: number) {
    this.cartItemsSignal.update(items => 
      items.filter(item => !(item.product.id === productId && item.size === size))
    );
  }

  updateQuantity(productId: string, size: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId, size);
      return;
    }
    
    this.cartItemsSignal.update(items => {
      return items.map(item => {
        if (item.product.id === productId && item.size === size) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  }

  clearCart() {
    this.cartItemsSignal.set([]);
  }
}
