const ROLES = require("./../constants/roles.js");
const authRoutes = require("./../router/auth.routes")

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
];
