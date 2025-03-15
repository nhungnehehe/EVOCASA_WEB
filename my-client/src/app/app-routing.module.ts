import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
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
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { InsituComponent } from './insitu/insitu.component';
import { CollectionComponent } from './collection/collection.component';
import { TheAnniversaryCollectionComponent } from './collection-detail/the-anniversary-collection/the-anniversary-collection.component';
import { SabiCollectionComponent } from './collection-detail/sabi-collection/sabi-collection.component';
import { ThePavilionCollectionComponent } from './collection-detail/the-pavilion-collection/the-pavilion-collection.component';
import { TheDiscCollectionComponent } from './collection-detail/the-disc-collection/the-disc-collection.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { OrderTrackingDetailComponent } from './order-tracking-detail/order-tracking-detail.component';
import { ProductResolver } from './product.resolever';
import { PolicyComponent } from './policy/policy.component';
const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'contact-page', component: ContactComponent },
  { path: 'cart-page', component: CartComponent },
  { path: 'about-page', component: AboutUsComponent },
  { path: 'blog', component: BlogComponent },
  {
    path: 'product',
    component: ProductComponent,
    resolve: { products: ProductResolver },
  },
  {
    path: 'product/:mainCategory',
    component: ProductComponent,
    resolve: { products: ProductResolver },
  },
  {
    path: 'product/:mainCategory/:subCategory',
    component: ProductComponent,
    resolve: { products: ProductResolver },
  },
  { path: 'login-page', component: LoginComponent },
  { path: 'forgot-page', component: ForgotComponent },
  { path: 'signup-page', component: SignupComponent },
  { path: 'payment-shipping', component: PaymentShippingComponent },
  { path: 'payment-method', component: PaymentMethodComponent },
  { path: 'payment-confirm', component: PaymentConfirmComponent },
  { path: 'payment-notice', component: PaymentNoticeComponent },
  { path: 'blog-2024-sofa-trend', component: Blog1Component },
  { path: 'blog-minimalist-style', component: Blog2Component },
  { path: 'blog-mix-and-match-wood', component: Blog3Component },
  { path: 'blog-elevating-spaces', component: Blog4Component },
  { path: 'blog-redefining-comfort', component: Blog5Component },
  { path: 'blog-creating-cozy-haven', component: Blog6Component },
  { path: 'product-detail/:identifier', component: ProductDetailComponent },
  { path: 'insitu-page', component: InsituComponent },
  { path: 'collections', component: CollectionComponent },
  {
    path: 'the-anniversary-collection',
    component: TheAnniversaryCollectionComponent,
  },
  { path: 'sabi-collection', component: SabiCollectionComponent },
  {
    path: 'the-pavilion-collection',
    component: ThePavilionCollectionComponent,
  },
  { path: 'the-disc-collection', component: TheDiscCollectionComponent },
  { path: 'manage-account', component: ManageAccountComponent },
  { path: 'view-orders', component: OrderTrackingComponent },
  {
    path: 'view-order-detail/:identifier',
    component: OrderTrackingDetailComponent,
  },
  { path: 'policy-page', component: PolicyComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
