import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { OrderComponent } from './order/order.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { AddProductComponent } from './product-detail/add-product/add-product.component';
import { EditProductComponent } from './product-detail/edit-product/edit-product.component';
import { AddCategoryComponent } from './category-detail/add-category/add-category.component';
import { EditCategoryComponent } from './category-detail/edit-category/edit-category.component';

const routes: Routes = [
  { path: "", component:DashboardComponent},
  { path: "admin-customer", component: CustomerComponent},
  { path: "admin-product", component: ProductComponent },
  { path: "admin-category", component: CategoryComponent},
  { path: "admin-order", component:OrderComponent},
  { path: "customer-detail", component:CustomerDetailComponent},
  { path: "order-detail", component:OrderDetailComponent},
  { path: "admin-product-add", component:AddProductComponent},
  { path: "admin-product-edit", component:EditProductComponent},
  { path: "admin-category-add", component:AddCategoryComponent},
  { path: "admin-category-edit", component:EditCategoryComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
