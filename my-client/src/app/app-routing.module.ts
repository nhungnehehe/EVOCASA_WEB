import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CartComponent } from './cart/cart.component';
import { BlogComponent } from './blog/blog.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PaymentShippingComponent } from './payment-shipping/payment-shipping.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { ProductComponent } from './product/product.component';


const routes: Routes = [
  {path:"contact-page",component:ContactComponent},
  {path:"sidebar-page",component:SidebarComponent},
  {path:"cart-page",component:CartComponent},
  {path:"blog-page",component:BlogComponent},
  {path:"about-page",component: PaymentShippingComponent},
  {path:"homepage",component:HomepageComponent},
  {path:"payment-method",component:PaymentMethodComponent},
  {path:"product-page",component:ProductComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
