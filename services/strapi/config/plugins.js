"use strict";

module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET", "localJwtSecret"),
    },
  },
});
