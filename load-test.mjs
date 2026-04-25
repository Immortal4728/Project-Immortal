import crypto from "crypto";

// ================= CONFIG =================
const CONFIG = {
  TARGET_URL:
    process.env.TARGET_URL ||
    "http://localhost:3000/api/project-request",

  TOTAL_REQUESTS: 10,      // start small first!
  CONCURRENCY: 1,
  DELAY_MS: 500,
  TIMEOUT_MS: 15000,
  MAX_RETRIES: 2,

  DEBUG_MODE: true,         // 🔥 turn OFF later
};

// ================= VALID DOMAINS =================
const domains = [
  "AI / Machine Learning",
  "Fullstack Web Application",
  "Mobile Application",
  "Blockchain",
  "IoT System",
  "Cloud Platform",
  "Other",
];

const firstNames = ["Naruto", "Sasuke", "Gojo", "Luffy", "Eren"];
const lastNames = ["Uzumaki", "Uchiha", "Satoru", "D", "Yeager"];
const projectTypes = [
  "AI Platform",
  "Mobile App",
  "Web Dashboard",
  "IoT System",
  "Blockchain App",
];

// ================= DATA GENERATOR =================
function generateRandomData() {
  const id = crypto.randomUUID().slice(0, 6);
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];

  return {
    name: `${f} ${l}`,
    email: `loadtest_${id}@test.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    project_title: `${type} ${id}`,
    domain: domain,
    description: `[LOAD TEST] ${type} project simulation ${id}`,
  };
}

// ================= METRICS =================
const metrics = {
  total: 0,
  success: 0,
  failed: 0,
  totalTime: 0,
  min: Infinity,
  max: 0,
  status: {},
};

let stop = false;

// ================= REQUEST FUNCTION =================
async function requestWithRetry(data, attempt = 1) {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

    const res = await fetch(CONFIG.TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const time = Date.now() - start;

    if (res.ok) {
      return { ok: true, time, status: res.status };
    } else {
      const text = await res.text();

      if (metrics.failed < 5) {
        console.log(`❌ ERROR ${res.status}:`, text.slice(0, 200));
        if (CONFIG.DEBUG_MODE) console.log("Payload:", data);
      }

      if (attempt <= CONFIG.MAX_RETRIES && !stop) {
        return requestWithRetry(data, attempt + 1);
      }

      return { ok: false, time, status: res.status };
    }
  } catch (err) {
    if (metrics.failed < 5) {
      console.log("❌ FETCH ERROR:", err.message);
      if (CONFIG.DEBUG_MODE) console.log("Payload:", data);
    }

    if (attempt <= CONFIG.MAX_RETRIES && !stop) {
      return requestWithRetry(data, attempt + 1);
    }

    return {
      ok: false,
      time: Date.now() - start,
      status: err.name === "AbortError" ? "TIMEOUT" : "ERROR",
    };
  }
}

// ================= RUNNER =================
async function run() {
  console.log("\n🚀 LOAD TEST STARTED\n");

  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping safely...");
    stop = true;
  });

  const start = Date.now();
  let done = 0;

  while (done < CONFIG.TOTAL_REQUESTS && !stop) {
    const batchSize = Math.min(
      CONFIG.CONCURRENCY,
      CONFIG.TOTAL_REQUESTS - done
    );

    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      batch.push(requestWithRetry(generateRandomData()));
    }

    const results = await Promise.all(batch);

    for (const r of results) {
      metrics.total++;

      if (r.ok) metrics.success++;
      else metrics.failed++;

      metrics.totalTime += r.time;
      metrics.min = Math.min(metrics.min, r.time);
      metrics.max = Math.max(metrics.max, r.time);

      metrics.status[r.status] =
        (metrics.status[r.status] || 0) + 1;
    }

    done += batchSize;

    if (done % 50 === 0 || done === CONFIG.TOTAL_REQUESTS) {
      console.log(`Progress: ${done}/${CONFIG.TOTAL_REQUESTS}`);
    }

    if (!stop && CONFIG.DELAY_MS > 0) {
      await new Promise((r) => setTimeout(r, CONFIG.DELAY_MS));
    }
  }

  // ================= REPORT =================
  const totalTime = ((Date.now() - start) / 1000).toFixed(2);
  const avg = (metrics.totalTime / metrics.total).toFixed(2);
  const throughput = (metrics.total / totalTime).toFixed(2);

  console.log("\n📊 FINAL REPORT");
  console.log("-------------------------");
  console.log("Total:", metrics.total);
  console.log("Success:", metrics.success);
  console.log("Failed:", metrics.failed);
  console.log("Avg Time:", avg, "ms");
  console.log("Min:", metrics.min, "ms");
  console.log("Max:", metrics.max, "ms");
  console.log("Throughput:", throughput, "req/sec");

  console.log("\nStatus Codes:");
  console.log(metrics.status);
}

run();