import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BlogComponent } from './blog/blog.component';
import { CollectionComponent } from './collection/collection.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { PaymentComponent } from './payment/payment.component';
import { FormsModule } from '@angular/forms';
import { CartComponent } from './cart/cart.component';
import { AboutUsComponent } from './about-us/about-us.component';  // Thêm dòng này

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    BlogComponent,
    CollectionComponent,
    ContactComponent,
    PaymentComponent,
    CartComponent,
    AboutUsComponent,
],
imports: [
  BrowserModule,
  AppRoutingModule,
  FooterComponent,
  FormsModule,
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
