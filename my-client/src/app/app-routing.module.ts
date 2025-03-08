import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CartComponent } from './cart/cart.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PaymentShippingComponent } from './payment-shipping/payment-shipping.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { ProductComponent } from './product/product.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { SignupComponent } from './signup/signup.component';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';
import { PaymentNoticeComponent } from './payment-notice/payment-notice.component';
import { BlogComponent } from './blog/blog.component';
import { Blog1Component } from './blog-detail/blog1/blog1.component';
import { Blog5Component } from './blog-detail/blog5/blog5.component';
import { Blog6Component } from './blog-detail/blog6/blog6.component';
import { Blog4Component } from './blog-detail/blog4/blog4.component';
import { Blog3Component } from './blog-detail/blog3/blog3.component';
import { Blog2Component } from './blog-detail/blog2/blog2.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'contact-page', component: ContactComponent },
  { path: 'sidebar-page', component: SidebarComponent },
  { path: 'cart-page', component: CartComponent },
  { path: 'about-page', component: AboutUsComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'product-page', component: ProductComponent },
  { path: 'login-page', component: LoginComponent },
  { path: 'forgot-page', component: ForgotComponent },
  { path: 'signup-page', component: SignupComponent },
  { path: 'payment-shipping', component: PaymentShippingComponent },
  { path: 'payment-method', component: PaymentMethodComponent },
  { path: 'payment-confirm', component: PaymentConfirmComponent },
  { path: 'blog1', component: Blog1Component },
  { path: 'blog2', component: Blog2Component },
  { path: 'blog3', component: Blog3Component },
  { path: 'blog4', component: Blog4Component },
  { path: 'blog5', component: Blog5Component },
  { path: 'blog6', component: Blog6Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
