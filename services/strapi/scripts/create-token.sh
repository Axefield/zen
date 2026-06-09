curl -s -X POST http://localhost:1337/admin/api-tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwic2Vzc2lvbklkIjoiNmYzODZlYjBhZGZkY2IyOTAxNzlkZmJjMzVlODQ3ZmEiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzgxMDIzODk0LCJleHAiOjE3ODEwMjU2OTR9.GyHLPecib9umfHwK8FxljL9JoLollgk8j7jScW_CSt4" \
  -d '{"name":"Bootstrap Token","description":"Seed data token","type":"full-access"}'
