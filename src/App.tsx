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
} from "./pages";
import { checkoutAction, searchAction } from "./actions/index";
import { shopCategoryLoader } from "./pages/Shop";
import { loader as orderHistoryLoader } from "./pages/OrderHistory";
import { loader as singleOrderLoader } from "./pages/SingleOrderHistory";
import HomeCollectionSection from "./components/HomeCollectionSection";
import { WishlistProvider } from "./components/WishlistContext";
import WishlistPage from "./components/WishlistPage";
import SellProduct from "./pages/SellProduct";
import AdminManager from "./pages/Admin/AdminManager"; // Import your AdminDashboard component
import CategoriesManagement from "./pages/Admin/Categories/CategoriesManagement";
import AddCategories from "./pages/Admin/Categories/AddCategories";
import EditCategories from "./pages/Admin/Categories/EditCategories";
// import DeleteCategories from "./pages/Admin/Categories/DeleteCategories";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
      {
        path: "news",
        element: <NewsPage />,
      },
      {
        path: "user-profile", // URL path
        element: <UserProfile />,
      },
      {
        path: "shop/:category",
        element: <Shop />,
        loader: shopCategoryLoader,
      },
      {
        path: "product/:id",
        element: <SingleProduct />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "wishlist", // URL path /wishlist
        element: <WishlistPage />, // Component to render
      },
      {
        path: "checkout",
        element: <Checkout />,
        action: checkoutAction,
      },
      {
        path: "search",
        action: searchAction,
        element: <Search />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmation />,
      },
      {
        path: "user-profile",
        element: <UserProfile />,
      },
      {
        path: "order-history",
        element: <OrderHistory />,
        loader: orderHistoryLoader,
      },
      {
        path: "home-collection",
        element: <HomeCollectionSection />,
      },
      {
        path: "sell-product",
        element: <SellProduct />,
      },
      {
        path: "order-history/:id",
        element: <SingleOrderHistory />,
        loader: singleOrderLoader,
      },
      {
        path: "admin",
        element: <AdminManager />,
        children: [
          {
            path: "categories",
            element: <CategoriesManagement />,
          },
          { path: "categories/add", element: <AddCategories /> },
          { path: "categories/edit/:id", element: <EditCategories /> },
          // { path: "categories/delete", element: <DeleteCategories /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <WishlistProvider>
      <RouterProvider router={router} />
    </WishlistProvider>
  );
}

export default App;
