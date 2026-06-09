"use strict";

module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "localAdminJwtSecret"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT", "localApiTokenSalt"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT", "localTransferTokenSalt"),
    },
  },
});
