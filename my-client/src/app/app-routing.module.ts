import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CartComponent } from './cart/cart.component';
import { BlogComponent } from './blog/blog.component';
import { PaymentComponent } from './payment/payment.component';

const routes: Routes = [
  {path:"contact-page",component:ContactComponent},
  {path:"sidebar-page",component:SidebarComponent},
  {path:"cart-page",component:CartComponent},
  {path:"blog-page",component:BlogComponent},
  {path:"about-page",component:PaymentComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
