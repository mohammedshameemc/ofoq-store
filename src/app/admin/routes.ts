import router from "@mongez/react-router";
import AdminLayout from "layouts/AdminLayout";
import URLS from "shared/utils/urls";
import AddEditCategoryPage from "./pages/AddEditCategoryPage";
import AddEditProductPage from "./pages/AddEditProductPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import TopCategoriesPage from "./pages/TopCategoriesPage";
import TopProductsPage from "./pages/TopProductsPage";

// Login page without layout
router.add({
  path: URLS.admin.login,
  component: AdminLoginPage,
});

// Admin pages with AdminLayout
router.partOf(AdminLayout, [
  {
    path: URLS.admin.dashboard,
    component: AdminDashboardPage,
  },
  {
    path: URLS.admin.products,
    component: ProductsPage,
  },
  {
    path: URLS.admin.addProduct,
    component: AddEditProductPage,
  },
  {
    path: URLS.admin.editProduct,
    component: AddEditProductPage,
  },
  {
    path: URLS.admin.categories,
    component: CategoriesPage,
  },
  {
    path: URLS.admin.addCategory,
    component: AddEditCategoryPage,
  },
  {
    path: URLS.admin.editCategory,
    component: AddEditCategoryPage,
  },
  {
    path: URLS.admin.topProducts,
    component: TopProductsPage,
  },
  {
    path: URLS.admin.topCategories,
    component: TopCategoriesPage,
  },
  {
    path: URLS.admin.analytics,
    component: AnalyticsPage,
  },
]);
