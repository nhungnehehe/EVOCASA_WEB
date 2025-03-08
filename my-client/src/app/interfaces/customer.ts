export class Customer {
  constructor(
    public _id: any = null,
    public Name: string = '',
    public Phone: string = '',
    public Mail: string = '',
    public DOB: Date | string = '',
    public Address: string = '',
    public Password: string = '',
    public PasswordSalt: string = '', 
    public Gender: string = '',
    public Image: string = '',
    public CreatedAt: Date | string = '',
    public Cart: CartItem1[] = []
  ) { }
}

export class CartItem1 {
  constructor(
    public ProductId: any = null,
    public Quantity: number = 0
  ) { }
}

export interface ICustomer {
  _id?: any;
  Name: string;
  Phone: string;
  Mail: string;
  DOB: Date | string;
  Address: string;
  Password: string;
  PasswordSalt: string; 
  Gender: string;
  Image: string;
  CreatedAt: Date | string;
  Cart: CartItem1[];
}

// Helper function to create a public profile by omitting sensitive information
export function createCustomerProfile(customer: Customer): Omit<Customer, 'Password' | 'PasswordSalt'> {
  const { Password, PasswordSalt, ...customerProfile } = customer;
  return customerProfile;
}