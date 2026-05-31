const ROLES = require("./../constants/roles.js");
const authRoutes = require("./../router/common/auth.routes.js");
const customerRoutes = require("./customer/customer.routes");
const adminRoutes = require("../router/admin/admin.routes.js");
const publicRoutes = require("./common/public.routes.js");
const checkClient = require("../middleware/auth.middleware.js");
module.exports = [
  {
    prefix: "/api/auth/",
    router: authRoutes,
  },
  {
    prefix: "/api/public",
    router: publicRoutes,
  },
  {
    prefix: "/api/customer",
    middlewares: [
      checkClient.authenticate,
      checkClient.authorizeRoles(ROLES.CUSTOMER),
    ],
    router: customerRoutes,
  },
  {
    prefix: "/api/admin",
    middlewares: [
      checkClient.authenticate,
      checkClient.authorizeRoles(ROLES.ADMIN),
    ],
    router: adminRoutes,
  },
];

