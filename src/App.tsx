// src/App.tsx

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Cart,
  Checkout,
  HomeLayout,
  Landing,
  Login,
  OrderConfirmation,
  OrderHistory,
  Register,
  Search,
  Shop,
  SingleOrderHistory,
  SingleProduct,
  UserProfile,
  NewsPage,
  WishlistPage,
} from "./pages";
import { checkoutAction, searchAction } from "./actions/index";
import { shopCategoryLoader } from "./pages/Shop";
import { loader as orderHistoryLoader } from "./pages/OrderHistory";
import { loader as singleOrderLoader } from "./pages/SingleOrderHistory";
import HomeCollectionSection from "./components/HomeCollectionSection";
import { WishlistProvider } from "./components/WishlistContext";
import SellProduct from "./pages/SellProduct";
import AdminManager from "./pages/Admin/AdminManager";
import CategoriesManagement from "./pages/Admin/Categories/CategoriesManagement";
import AddCategories from "./pages/Admin/Categories/AddCategories";
import EditCategories from "./pages/Admin/Categories/EditCategories";
import UsersManagement from "./pages/Admin/Users/UsersManagement";
import AddUsers from "./pages/Admin/Users/AddUsers";
import EditUsers from "./pages/Admin/Users/EditUsers";
import ProductsManagement from "./pages/Admin/Products/ProductsManagement";
import AddProducts from "./pages/Admin/Products/AddProducts";
import EditProducts from "./pages/Admin/Products/EditProducts";
import OrdersManagement from "./pages/Admin/Orders/OrdersManagement";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "shop", element: <Shop /> },
      { path: "news", element: <NewsPage /> },
      { path: "user-profile", element: <UserProfile /> },
      { path: "shop/:category", element: <Shop />, loader: shopCategoryLoader },
      { path: "product/:id", element: <SingleProduct /> },
      { path: "cart", element: <Cart /> },
      { path: "wishlist", element: <WishlistPage /> },
      { path: "checkout", element: <Checkout />, action: checkoutAction },
      { path: "search", element: <Search />, action: searchAction },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "order-confirmation", element: <OrderConfirmation /> },
      {
        path: "order-history",
        element: <OrderHistory />,
        loader: orderHistoryLoader,
      },
      { path: "home-collection", element: <HomeCollectionSection /> },
      { path: "sell-product", element: <SellProduct /> },
      {
        path: "order-history/:id",
        element: <SingleOrderHistory />,
        loader: singleOrderLoader,
      },
      {
        path: "admin",
        element: (
          <ProtectedAdminRoute>
            <AdminManager />
          </ProtectedAdminRoute>
        ),
        children: [
          {
            path: "categories",
            element: (
              <ProtectedAdminRoute>
                <CategoriesManagement />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "categories/add",
            element: (
              <ProtectedAdminRoute>
                <AddCategories />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "categories/edit/:id",
            element: (
              <ProtectedAdminRoute>
                <EditCategories />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "users",
            element: (
              <ProtectedAdminRoute>
                <UsersManagement />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "users/add",
            element: (
              <ProtectedAdminRoute>
                <AddUsers />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "users/edit/:id",
            element: (
              <ProtectedAdminRoute>
                <EditUsers />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "products",
            element: (
              <ProtectedAdminRoute>
                <ProductsManagement />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "products/add",
            element: (
              <ProtectedAdminRoute>
                <AddProducts />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "products/edit/:id",
            element: (
              <ProtectedAdminRoute>
                <EditProducts />
              </ProtectedAdminRoute>
            ),
          },
          {
            path: "orders",
            element: (
              <ProtectedAdminRoute>
                <OrdersManagement />
              </ProtectedAdminRoute>
            ),
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <WishlistProvider>
      {/* 
        The header is fixed at the top with height = h-24 (96px). 
        So add pt-24 (96px) here to push the routed pages down.
      */}
      <div className="pt-24">
        <RouterProvider router={router} />
      </div>
    </WishlistProvider>
  );
}

export default App;
