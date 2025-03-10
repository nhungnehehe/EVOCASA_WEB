import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { OrderComponent } from './order/order.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

const routes: Routes = [
  { path: "", component:DashboardComponent},
  { path: "admin-customer", component: CustomerComponent},
  { path: "admin-product", component: ProductComponent },
  { path: "admin-category", component: CategoryComponent},
  { path: "admin-order", component:OrderComponent},
  { path: "customer-detail", component:CustomerDetailComponent},
  { path: "order-detail", component:OrderDetailComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
