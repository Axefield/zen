"use strict";

module.exports = ({ env }) => ({
  connection: {
    client: env("DATABASE_CLIENT", "postgres"),
    connection: {
      host: env("DATABASE_HOST", "postgres"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "truligon"),
      user: env("DATABASE_USERNAME", "truligon"),
      password: env("DATABASE_PASSWORD", "truligon"),
      ssl: env.bool("DATABASE_SSL", false)
    }
  }
});
