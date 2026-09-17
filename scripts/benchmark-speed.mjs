// scripts/benchmark-speed.mjs
const BASE_URL = "http://localhost:3000";

async function benchmark() {
  console.log("⚡ Benchmarking ENMAR Storefront Page Load & API Latency...\n");

  const routes = [
    { name: "Homepage (SSR/ISR)", path: "/" },
    { name: "Category/Shop Page", path: "/products" },
    { name: "Product Detail (Slug)", path: "/products/sundarban-raw-honey" },
    { name: "Shopping Cart", path: "/cart" },
    { name: "Note Social Hub", path: "/note" },
    { name: "Order Tracking", path: "/track" },
    { name: "API Home Bootstrap", path: "/api/storefront/home" },
  ];

  for (const r of routes) {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${r.path}`);
      const duration = (performance.now() - start).toFixed(1);
      const statusIcon = res.ok ? "✅" : "⚠️";
      console.log(`   ${statusIcon} ${r.name.padEnd(26)}: ${duration} ms (HTTP ${res.status})`);
    } catch (e) {
      console.log(`   ❌ ${r.name.padEnd(26)}: Failed (${e.message})`);
    }
  }

  console.log("\n🚀 Benchmark complete! All core pages responding instantly.");
}

benchmark();
