// src/App.tsx

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Cart,
  Checkout,
  HomeLayout,
  Landing,
  Login,
  OrderHistory,
  Register,
  Search,
  Shop,
  SingleOrderHistory,
  SingleProduct,
  UserProfile,
  NewsPage,
  WishlistPage,
  SellProduct,
  SellProductList,
  EditProduct,
  OrderConfirmation,
  CheckEmail,
  BuyerOrderStatus,
  SellerOrderStatus,
} from "./pages";
import { checkoutAction, searchAction } from "./actions/index";
import { shopCategoryLoader } from "./pages/Shop";
import { loader as orderHistoryLoader } from "./pages/Order/OrderHistory";
import { loader as singleOrderLoader } from "./pages/Order/SingleOrderHistory";
import HomeCollectionSection from "./components/HomeCollectionSection";
import { WishlistProvider } from "./components/WishlistContext";
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
import AuthGuard from "./components/AuthGuard";
import SingleBlogPage from "./pages/SingleBlogPage";
import TermOfUse from "./components/Hardcode/TermOfUse";
import PrivacyPolicy from "./components/Hardcode/PrivacyPolicy";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "shop", element: <Shop /> },
      { path: "news", element: <NewsPage /> },
      { path: "shop/:category", element: <Shop />, loader: shopCategoryLoader },
      { path: "product/:id", element: <SingleProduct /> },
      { path: "search", element: <Search />, action: searchAction },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "check-email", element: <CheckEmail /> },
      { path: "/terms-of-use", element: <TermOfUse /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "home-collection", element: <HomeCollectionSection /> },

      // Protected routes
      {
        path: "user-profile",
        element: (
          <AuthGuard>
            <UserProfile />
          </AuthGuard>
        ),
      },
      {
        path: "sell-product",
        element: (
          <AuthGuard>
            <SellProduct />
          </AuthGuard>
        ),
      },
      {
        path: "sell-product-list",
        element: (
          <AuthGuard>
            <SellProductList />
          </AuthGuard>
        ),
      },
      {
        path: "edit-product/:id",
        element: (
          <AuthGuard>
            <EditProduct />
          </AuthGuard>
        ),
      },
      {
        path: "wishlist",
        element: (
          <AuthGuard>
            <WishlistPage />
          </AuthGuard>
        ),
      },
      {
        path: "cart",
        element: (
          <AuthGuard>
            <Cart />
          </AuthGuard>
        ),
      },
      {
        path: "checkout",
        element: (
          <AuthGuard>
            <Checkout />
          </AuthGuard>
        ),
        action: checkoutAction,
      },
      {
        path: "order-history",
        element: (
          <AuthGuard>
            <OrderHistory />
          </AuthGuard>
        ),
        loader: orderHistoryLoader,
      },
      {
        path: "order-history/:id",
        element: (
          <AuthGuard>
            <SingleOrderHistory />
          </AuthGuard>
        ),
        loader: singleOrderLoader,
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmation />,
      },
      {
        path: "order/:orderId/status",
        element: <BuyerOrderStatus />,
        errorElement: <div>Error loading buyer order status.</div>,
      },
      {
        path: "/seller-order/:orderId/status",
        element: <SellerOrderStatus />,
        errorElement: <div>Error loading seller order status.</div>,
      },
    ],
  },
  { path: "blogs/:id", element: <SingleBlogPage /> },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminManager />
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <CategoriesManagement /> },
      { path: "categories", element: <CategoriesManagement /> },
      { path: "categories/add", element: <AddCategories /> },
      { path: "categories/edit/:id", element: <EditCategories /> },
      { path: "users", element: <UsersManagement /> },
      { path: "users/add", element: <AddUsers /> },
      { path: "users/edit/:id", element: <EditUsers /> },
      { path: "products", element: <ProductsManagement /> },
      { path: "products/add", element: <AddProducts /> },
      { path: "products/edit/:id", element: <EditProducts /> },
      { path: "orders", element: <OrdersManagement /> },
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
      <div className="">
        <RouterProvider router={router} />
      </div>
    </WishlistProvider>
  );
}

export default App;
