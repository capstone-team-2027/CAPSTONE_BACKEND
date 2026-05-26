const ROLES = require("./../constants/roles.js");
const authRoutes = require("./../router/common/auth.routes.js");
const customerRoutes = require("./customer/customer.routes");
const checkClient = require("../middleware/auth.middleware.js");
const adminServiceCombosRoutes = require("./admin/admin.routes.js");

module.exports = [
  // {
  //   prefix: "/api/customer/check",
  //   middlewares:
  //     [
  //       checkClient.checkaccount,
  //       checkClient.checkRole(ROLES.CUSTOMER),
  // ❌ KHÔNG có checkRole → mọi role đều vào được
  //     ],
  //   router: clientcheck
  // },

  {
    prefix: "/api/auth/",
    router: authRoutes,
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
    router: adminServiceCombosRoutes,
  },
];
