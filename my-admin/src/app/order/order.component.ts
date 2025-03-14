import { Component } from '@angular/core';
import { Order } from '../interfaces/order';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../interfaces/customer';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  orders: Order[] = [];

  totalOrders: number = 0;

  customerNames: { [key: string]: string } = {}; 

  selectedOrder: Order | null = null;
 
  constructor(private orderService: OrderService, private customerService: CustomerService,  private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }
  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(
      (data) => {
        this.orders = data;
        this.totalOrders = data.length;
        this.fetchCustomerNames(); 
        // this.updateDisplayedCustomers();
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }
  // Fetch customer names based on customer_id and store them temporarily
  fetchCustomerNames(): void {
    this.orders.forEach((order) => {
      // Check if customer name is already fetched, if not, fetch it
      if (!this.customerNames[order.Customer_id]) {
        this.customerService.getCustomerById(order.Customer_id).subscribe(
          (customer: Customer) => {
            this.customerNames[order.Customer_id] = customer.Name; // Store customer name by customer_id
          },
          (error) => {
            console.error('Error fetching customer details:', error);
          }
        );
      }
    });
  }
  viewOrderDetails(id: string): void {
    this.orderService.getOrderById(id).subscribe(
      (data) => {
        this.selectedOrder = data; // Store the selected customer's details
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
    this.router.navigate([`/order-detail/${id}`]);
  }
  
}
