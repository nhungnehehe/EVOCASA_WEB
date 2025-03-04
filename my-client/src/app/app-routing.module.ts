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
import { AboutUsComponent } from './about-us/about-us.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  {path:"",component:HomepageComponent},
  {path:"contact-page",component:ContactComponent},
  {path:"sidebar-page",component:SidebarComponent},
  {path:"cart-page",component:CartComponent},
  {path:"blog-page",component:BlogComponent},
  {path:"about-page",component: AboutUsComponent},
  {path:"homepage",component:HomepageComponent},
  {path:"payment-method",component:PaymentMethodComponent},
  {path:"product-page",component:ProductComponent},
  {path:"login-page",component:LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
