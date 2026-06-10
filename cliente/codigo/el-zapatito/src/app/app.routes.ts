import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/store/store-layout/store-layout.component').then(c => c.StoreLayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./components/store/home/home.component').then(c => c.HomeComponent)
            },
            {
                path: 'catalog',
                loadComponent: () => import('./components/store/catalog/catalog.component').then(c => c.CatalogComponent)
            },
            {
                path: 'about',
                loadComponent: () => import('./components/store/about/about.component').then(c => c.AboutComponent)
            },
            {
                path: 'login',
                loadComponent: () => import('./components/auth/login.component').then(c => c.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./components/auth/register.component').then(c => c.RegisterComponent)
            }
        ]
    },
    {
        path: 'admin',
        // canActivate: [authGuard],
        loadComponent: () => import('./components/admin/admin-layout/admin-layout.component').then(c => c.AdminLayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(c => c.DashboardComponent)
            },
            {
                path: 'add-product',
                loadComponent: () => import('./components/admin/add-product/add-product.component').then(c => c.AddProductComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./components/admin/products/products.component').then(c => c.ProductsComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./components/admin/inventory/inventory.component').then(c => c.InventoryComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./components/admin/orders/orders.component').then(c => c.OrdersComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./components/admin/settings/settings.component').then(c => c.SettingsComponent)
            }
        ]
    }
];
