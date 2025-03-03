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
import { HomepageComponent } from './homepage/homepage.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PaymentShippingComponent } from './payment-shipping/payment-shipping.component';
import { RouterModule } from '@angular/router';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { ProductComponent } from './product/product.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    BlogComponent,
    CollectionComponent,
    ContactComponent,
    HomepageComponent,
    PaymentShippingComponent,
    PaymentMethodComponent,
    ProductComponent,
],
imports: [
  BrowserModule,
  AppRoutingModule,
  FooterComponent,
  FormsModule,
  HttpClientModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
