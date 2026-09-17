// scripts/rebuild-snapshots.mjs
import { triggerSnapshotRebuild } from "../lib/snapshotEngine.ts";

async function run() {
  console.log("⚡ Rebuilding storefront snapshots...");
  await triggerSnapshotRebuild();
  console.log("✅ Storefront snapshots successfully rebuilt!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
