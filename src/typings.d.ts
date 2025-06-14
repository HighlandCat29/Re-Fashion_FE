interface Product {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
}

interface ProductInCart extends Product {
  id: string;
  quantity: number;
  size: string;
  color: string;
  stock: number;
}

interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
}

interface Order {
  id: string;
  orderStatus: string;
  orderDate: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  data: {
    email: string;
  };
  products: ProductInCart[];
  subtotal: number;
  user: {
    email: string;
    id: number;
  };
}
