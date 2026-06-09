# Usage: STRAPI_ADMIN_JWT=<your_jwt> ./create-token.sh
# Get JWT by logging in: curl -X POST http://localhost:1337/admin/login -d '{"email":"admin@truligon.io","password":"your_password"}'

curl -s -X POST http://localhost:1337/admin/api-tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${STRAPI_ADMIN_JWT:?Set STRAPI_ADMIN_JWT env var}" \
  -d '{"name":"Bootstrap Token","description":"Seed data token","type":"full-access"}'
