import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CollectionComponent } from './collection/collection.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CartComponent } from './cart/cart.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PaymentShippingComponent } from './payment-shipping/payment-shipping.component';
import { ProductComponent } from './product/product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { SignupComponent } from './signup/signup.component';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { BlogComponent } from './blog/blog.component';
import { TheAnniversaryCollectionComponent } from './collection-detail/the-anniversary-collection/the-anniversary-collection.component';
import { SabiCollectionComponent } from './collection-detail/sabi-collection/sabi-collection.component';
import { ThePavilionCollectionComponent } from './collection-detail/the-pavilion-collection/the-pavilion-collection.component';
import { TheDiscCollectionComponent } from './collection-detail/the-disc-collection/the-disc-collection.component';
import { Blog1Component } from './blog-detail/blog1/blog1.component';
import { Blog2Component } from './blog-detail/blog2/blog2.component';
import { Blog3Component } from './blog-detail/blog3/blog3.component';
import { Blog4Component } from './blog-detail/blog4/blog4.component';
import { Blog5Component } from './blog-detail/blog5/blog5.component';
import { Blog6Component } from './blog-detail/blog6/blog6.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    ProductDetailComponent,
    HeaderComponent,
    SidebarComponent,
    CollectionComponent,
    ContactComponent,
    PaymentShippingComponent,
    CartComponent,
    AboutUsComponent,
    LoginComponent,
    ForgotComponent,
    SignupComponent,
    PaymentMethodComponent,
    PaymentConfirmComponent,
    BlogComponent,
    TheAnniversaryCollectionComponent,
    SabiCollectionComponent,
    ThePavilionCollectionComponent,
    TheDiscCollectionComponent,
    Blog1Component,
    Blog2Component,
    Blog3Component,
    Blog4Component,
    Blog5Component,
    Blog6Component,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FooterComponent,
    FormsModule,
    HttpClientModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
