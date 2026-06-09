const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

// Use a full-access API token (create via: docker compose exec strapi npx strapi admin:api-token:create --name=FullAccess --permissions-all)
const TOKEN = process.env.STRAPI_API_TOKEN;

async function api(path, options = {}) {
  const url = `${STRAPI_URL}${path}`;
  const headers = { Authorization: `Bearer ${TOKEN}`, ...options.headers };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function main() {

  // 3. Create seed categories
  const categories = [
    { name: "Technology", slug: "technology", description: "Tech articles" },
    { name: "Design", slug: "design", description: "Design articles" },
    { name: "Business", slug: "business", description: "Business articles" },
  ];

  for (const cat of categories) {
    const { ok, status, data } = await api("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: cat }),
    });
    if (ok) {
      console.log(`Category "${cat.name}" created: ${data.data?.id}`);
    } else if (status === 409) {
      console.log(`Category "${cat.name}" already exists`);
    } else {
      console.error(`Failed to create category "${cat.name}" (${status}):`, JSON.stringify(data));
    }
  }

  // 4. Create seed articles
  const articles = [
    {
      title: "Welcome to Truligon's Zen",
      slug: "welcome-to-truligons-zen",
      excerpt: "An introduction to the Truligon's Zen platform",
      body: "# Welcome\n\nTruligon's Zen is a modular Business Operating System...",
    },
    {
      title: "Getting Started with Design Tokens",
      slug: "getting-started-with-design-tokens",
      excerpt: "How we use design tokens for consistent UI",
      body: "# Design Tokens\n\nDesign tokens are the foundation...",
    },
    {
      title: "Building a Modular Business OS",
      slug: "building-modular-business-os",
      excerpt: "Architecture decisions behind Truligon's Zen",
      body: "# Modular Architecture\n\nA domain-agnostic approach...",
    },
  ];

  for (const article of articles) {
    const { ok, status, data } = await api("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: article }),
    });
    if (ok) {
      console.log(`Article "${article.title}" created: ${data.data?.id}`);
    } else if (status === 409) {
      console.log(`Article "${article.title}" already exists`);
    } else {
      console.error(`Failed to create article "${article.title}" (${status}):`, JSON.stringify(data));
    }
  }

  // 5. Create seed products
  const products = [
    { name: "Zen Starter Kit", slug: "zen-starter-kit", description: "# Zen Starter Kit\n\nThe foundational toolkit for building on Truligon's Zen. Includes type-safe templates, Strapi content models, and AI integration stubs.", price: 99.99, currency: "USD" },
    { name: "Enterprise License", slug: "enterprise-license", description: "# Enterprise License\n\nFull access to all modules, priority support, and custom integration assistance for your organization.", price: 999.99, compareAtPrice: 1499.99, currency: "USD" },
    { name: "AI Agent Pack", slug: "ai-agent-pack", description: "# AI Agent Pack\n\nPre-built AI agent workflows for content generation, analytics, and customer engagement automation.", price: 299.99, currency: "USD" },
  ];

  for (const product of products) {
    const { ok, status, data } = await api("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: product }),
    });
    if (ok) {
      console.log(`Product "${product.name}" created: ${data.data?.id}`);
    } else if (status === 409) {
      console.log(`Product "${product.name}" already exists`);
    } else {
      console.error(`Failed to create product "${product.name}" (${status}):`, JSON.stringify(data));
    }
  }

  // 6. Create seed courses
  const courses = [
    { title: "Getting Started with Truligon's Zen", slug: "getting-started-with-zen", description: "# Course Overview\n\nLearn how to set up your first Truligon's Zen instance, configure modules, and deploy to production.", price: 0, currency: "USD" },
    { title: "Advanced Type System Design", slug: "advanced-type-system", description: "# Advanced Type System\n\nDeep dive into designing reusable, type-safe entities with Zod validation across your entire stack.", price: 149.99, currency: "USD" },
  ];

  for (const course of courses) {
    const { ok, status, data } = await api("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: course }),
    });
    if (ok) {
      console.log(`Course "${course.title}" created: ${data.data?.id}`);
    } else if (status === 409) {
      console.log(`Course "${course.title}" already exists`);
    } else {
      console.error(`Failed to create course "${course.title}" (${status}):`, JSON.stringify(data));
    }
  }

  // 7. Create seed events
  const events = [
    { title: "Zen Developer Summit 2026", slug: "zen-developer-summit-2026", description: "# Zen Developer Summit\n\nJoin us for a two-day summit covering modular architecture, AI integration patterns, and real-world case studies.", date: "2026-09-15T09:00:00Z", locationType: "hybrid", address: "123 Innovation Drive, San Francisco, CA", virtualUrl: "https://events.truligons.zen/summit-2026", capacity: 500 },
    { title: "Monthly Community Call", slug: "monthly-community-call", description: "# Community Call\n\nMonthly sync with the Truligon's Zen community. Share what you're building, get help, and meet other developers.", date: "2026-07-01T16:00:00Z", locationType: "virtual", virtualUrl: "https://meet.truligons.zen/community", capacity: 100 },
  ];

  for (const event of events) {
    const { ok, status, data } = await api("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: event }),
    });
    if (ok) {
      console.log(`Event "${event.title}" created: ${data.data?.id}`);
    } else if (status === 409) {
      console.log(`Event "${event.title}" already exists`);
    } else {
      console.error(`Failed to create event "${event.title}" (${status}):`, JSON.stringify(data));
    }
  }

  console.log("Bootstrap complete!");
}

main().catch(console.error);
