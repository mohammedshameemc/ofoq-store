// append urls here, DO NOT remove this line

const URLS = {
  contactUs: "/contact-us",
  about: "/about",
  wishlist: "/wishlist",
  search: "/search",
  shop: {
    root: "/shop",
    products: "/products",
    search: "/search",
    product: "/products/:id",
    viewSearch: (type: "product" | "blog", query: string) =>
      `/search?type=${type}&${query}`,
    viewProduct: (productId: number) => `/products/${productId}`,
    collections: "/collections",
  },
  cart: "/cart",
  checkout: "/checkout",
  home: "/",
  notFound: "/404",
  blog: {
    root: "/blog",
    viewRoute: "/blog/:id/:slug",
    view: (post: any) => `/blog/${post.id}/${post.slug}`,
  },

  searchRoute: {
    root: "/search",
    search: (type: "product" | "blog", query: string) =>
      `/search?type=${type}&${query}`,
  },
  faq: "/faq",
  admin: {
    root: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    categories: "/admin/categories",
    addCategory: "/admin/categories/add",
    editCategory: "/admin/categories/edit/:id",
    viewEditCategory: (id: number | string) => `/admin/categories/edit/${id}`,
    products: "/admin/products",
    addProduct: "/admin/products/add",
    editProduct: "/admin/products/edit/:id",
    viewEditProduct: (id: number | string) => `/admin/products/edit/${id}`,
    topProducts: "/admin/top-products",
    topCategories: "/admin/top-categories",
    analytics: "/admin/analytics",
  },
  settings: "/settings",
  pages: {
    aboutUs: "/about",
    termsConditions: "/terms-conditions",
    privacyPolicy: "/privacy-policy",
    faq: "/faq",
    team: "/team",
    viewRoute: "/pages/:slug",
    view: (page: any) => `/pages/${page.id}/${page.slug}`,
  },
};

export default URLS;
