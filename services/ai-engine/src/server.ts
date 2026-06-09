import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);

type HealthResponse = {
  status: "ok";
  service: "api";
  modules: string[];
};

const health: HealthResponse = {
  status: "ok",
  service: "api",
  modules: ["api", "analytics", "ai", "type-system"]
};

const server = createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Content-Type", "application/json");

  if (request.url === "/health") {
    response.writeHead(200);
    response.end(JSON.stringify(health));
    return;
  }

  response.writeHead(404);
  response.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});
