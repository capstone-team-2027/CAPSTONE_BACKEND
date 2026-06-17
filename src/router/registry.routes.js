const ROLES = require("./../constants/roles.js");
const authRoutes = require("./../router/auth/auth.routes.js");
const customerRoutes = require("./customer/customer.routes");
const adminRoutes = require("../router/admin/admin.routes.js");
const guestRoutes = require("./common/guest.routes.js");
const inventoryRoutes = require("../router/inventory/inventory.routes.js");
const checkClient = require("../middleware/auth.middleware.js");
const receptionistRoutes = require("./../router/receptionist/receptionist.routes.js")
module.exports = [
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
    router: adminRoutes,
  },
  {
    prefix: "/api/guest",
    router: guestRoutes,
  },

  {
    prefix: "/api/inventory",
    middlewares: [
      checkClient.authenticate,
      checkClient.authorizeRoles(ROLES.ADMIN),
    ],
    router: inventoryRoutes,
  },
  {
    prefix: "/api/receptionist",
    middlewares: [
      checkClient.authenticate,
      checkClient.authorizeRoles(ROLES.RECEPTIONIST),
    ],
    router: receptionistRoutes,
  },
];
