import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerComponent } from './customer/customer.component';
import { OrderComponent } from './order/order.component';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { EditCategoryComponent } from './category-detail/edit-category/edit-category.component';
import { AddCategoryComponent } from './category-detail/add-category/add-category.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { HeaderComponent } from './header/header.component';
import { AddProductComponent } from './product-detail/add-product/add-product.component';
import { EditProductComponent } from './product-detail/edit-product/edit-product.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    CustomerComponent,
    OrderComponent,
    ProductComponent,
    CategoryComponent,
    AddProductComponent,
    EditCategoryComponent,
    AddCategoryComponent,
    OrderDetailComponent,
    HeaderComponent,
    EditProductComponent,
    CustomerDetailComponent,
<<<<<<< HEAD
    LoginComponent,
=======
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
>>>>>>> ff529fe06a8bc29a47e197b3f97a550cadb8d684
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
