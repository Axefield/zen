const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

// Use a full-access API token (created manually or via admin API)
const TOKEN = process.env.STRAPI_API_TOKEN || "2166df5b70fecbf7009821c713d345e25e31333934c7b418697065e67bcff7e6126eb8bb58bb5c1dea2ad995b88c47dec7d72c58406ce0154c53d9d348db7499a299ef0cf52ee11d801a09f3ab120e9e85c489d29db6a33213cdb6dabbb84eb8fa582737688c4da8c116c5bc77c30b5679053913d60ce6c2273f9af85d1ad983";

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
      title: "Welcome to Truligon",
      slug: "welcome-to-truligon",
      excerpt: "An introduction to the Truligon platform",
      body: "# Welcome\n\nTruligon is a modular Business Operating System...",
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
      excerpt: "Architecture decisions behind Truligon",
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

  console.log("Bootstrap complete!");
}

main().catch(console.error);
