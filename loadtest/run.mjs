/**
 * ─────────────────────────────────────────────────────────────
 *  Project Immortal — Production Load Test Suite
 *  Simulates real user flows with gradual ramp-up
 *  Run: node loadtest/run.mjs
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = "https://project-immortal.vercel.app";

// ─── Test Credentials ───
const STUDENT = { email: "kiranpodili2@gmail.com", password: "vT0zj2-2" };
const EMPLOYEE = { email: "gadevenkatadileep99@gmail.com", password: "Venkata@24" };

// ─── Metrics Storage ───
class MetricsCollector {
    constructor(name) {
        this.name = name;
        this.latencies = [];
        this.errors = 0;
        this.successes = 0;
        this.startTime = Date.now();
    }

    record(latencyMs, isError = false) {
        this.latencies.push(latencyMs);
        if (isError) this.errors++;
        else this.successes++;
    }

    percentile(p) {
        if (this.latencies.length === 0) return 0;
        const sorted = [...this.latencies].sort((a, b) => a - b);
        const idx = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, idx)];
    }

    report() {
        const total = this.successes + this.errors;
        const elapsed = (Date.now() - this.startTime) / 1000;
        const avg = total > 0 ? Math.round(this.latencies.reduce((a, b) => a + b, 0) / total) : 0;

        return {
            endpoint: this.name,
            total,
            successes: this.successes,
            errors: this.errors,
            errorRate: total > 0 ? ((this.errors / total) * 100).toFixed(1) + "%" : "0%",
            rps: (total / elapsed).toFixed(1),
            avg: avg + "ms",
            p50: this.percentile(50) + "ms",
            p95: this.percentile(95) + "ms",
            p99: this.percentile(99) + "ms",
            min: (this.latencies.length > 0 ? Math.min(...this.latencies) : 0) + "ms",
            max: (this.latencies.length > 0 ? Math.max(...this.latencies) : 0) + "ms",
        };
    }
}

// ─── HTTP Helpers ───
async function timedFetch(url, options = {}) {
    const start = Date.now();
    try {
        const res = await fetch(url, { ...options, redirect: "manual" });
        const latency = Date.now() - start;
        const isError = res.status >= 400;
        return { latency, status: res.status, isError, headers: res.headers };
    } catch (err) {
        return { latency: Date.now() - start, status: 0, isError: true, error: err.message };
    }
}

// ─── Auth: Get session cookies ───
async function getStudentCookie() {
    const res = await fetch(`${BASE_URL}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(STUDENT),
        redirect: "manual",
    });
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) {
        console.error("  ⚠  Failed to get student session cookie");
        return null;
    }
    // Extract just the cookie name=value pair
    return setCookie.split(";")[0];
}

async function getEmployeeCookie() {
    const res = await fetch(`${BASE_URL}/api/employee/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(EMPLOYEE),
        redirect: "manual",
    });
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) {
        console.error("  ⚠  Failed to get employee session cookie");
        return null;
    }
    return setCookie.split(";")[0];
}

// ─── Scenario Definitions ───
function buildScenarios(studentCookie, employeeCookie) {
    return [
        {
            name: "Student Login",
            weight: 3,
            fn: () => timedFetch(`${BASE_URL}/api/student/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(STUDENT),
            }),
        },
        {
            name: "Student Dashboard",
            weight: 5,
            fn: () => timedFetch(`${BASE_URL}/api/student/session`, {
                headers: studentCookie ? { Cookie: studentCookie } : {},
            }),
        },
        {
            name: "Employee Login",
            weight: 2,
            fn: () => timedFetch(`${BASE_URL}/api/employee/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(EMPLOYEE),
            }),
        },
        {
            name: "Employee Dashboard",
            weight: 4,
            fn: () => timedFetch(`${BASE_URL}/api/employee/projects`, {
                headers: employeeCookie ? { Cookie: employeeCookie } : {},
            }),
        },
        {
            name: "Admin Dashboard",
            weight: 3,
            fn: () => timedFetch(`${BASE_URL}/api/admin/dashboard`),
        },
        {
            name: "Admin Submissions P1",
            weight: 3,
            fn: () => timedFetch(`${BASE_URL}/api/admin/submissions?page=1&limit=20`),
        },
    ];
}

// ─── Load Phase Runner ───
async function runPhase(phaseName, concurrentUsers, durationSec, scenarios) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  Phase: ${phaseName}`);
    console.log(`  ${concurrentUsers} concurrent users × ${durationSec}s`);
    console.log(`${"═".repeat(60)}`);

    // Build weighted scenario pool
    const pool = [];
    for (const s of scenarios) {
        for (let i = 0; i < s.weight; i++) pool.push(s);
    }

    const collectors = new Map();
    for (const s of scenarios) {
        collectors.set(s.name, new MetricsCollector(s.name));
    }
    const overall = new MetricsCollector("OVERALL");

    const endTime = Date.now() + durationSec * 1000;
    let active = 0;

    // Virtual user function
    async function virtualUser() {
        while (Date.now() < endTime) {
            const scenario = pool[Math.floor(Math.random() * pool.length)];
            const result = await scenario.fn();

            collectors.get(scenario.name).record(result.latency, result.isError);
            overall.record(result.latency, result.isError);

            // Small think-time to simulate real user behavior (100-500ms)
            await new Promise(r => setTimeout(r, 100 + Math.random() * 400));
        }
    }

    // Launch all virtual users concurrently
    const users = [];
    for (let i = 0; i < concurrentUsers; i++) {
        // Stagger user starts slightly to avoid thundering herd
        await new Promise(r => setTimeout(r, Math.floor((durationSec * 1000 * 0.1) / concurrentUsers)));
        users.push(virtualUser());
    }

    await Promise.all(users);

    // Print results table
    const results = [];
    for (const [, collector] of collectors) {
        results.push(collector.report());
    }
    results.push({ ...overall.report(), endpoint: "── OVERALL ──" });

    console.log("\n  Results:");
    console.table(results.map(r => ({
        Endpoint: r.endpoint,
        Reqs: r.total,
        "Err%": r.errorRate,
        "RPS": r.rps,
        Avg: r.avg,
        P50: r.p50,
        P95: r.p95,
        P99: r.p99,
        Max: r.max,
    })));

    return overall.report();
}

// ─── Main ───
async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║   Project Immortal — Production Load Test Suite           ║");
    console.log("║   Target: " + BASE_URL.padEnd(47) + "║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    // Step 1: Get auth cookies
    console.log("\n🔐 Authenticating test users...");
    const studentCookie = await getStudentCookie();
    const employeeCookie = await getEmployeeCookie();
    console.log(`  Student cookie: ${studentCookie ? "✓" : "✗"}`);
    console.log(`  Employee cookie: ${employeeCookie ? "✓" : "✗"}`);

    const scenarios = buildScenarios(studentCookie, employeeCookie);

    // Step 2: Progressive load phases
    const phaseResults = [];

    phaseResults.push(await runPhase("Warmup",        5,  15, scenarios));
    phaseResults.push(await runPhase("Light Load",   10,  30, scenarios));
    phaseResults.push(await runPhase("Medium Load",  25,  30, scenarios));
    phaseResults.push(await runPhase("Heavy Load",   50,  45, scenarios));
    phaseResults.push(await runPhase("Stress Test", 100,  45, scenarios));

    // Step 3: Summary
    console.log("\n\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    FINAL SUMMARY                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    const phases = ["Warmup (5)", "Light (10)", "Medium (25)", "Heavy (50)", "Stress (100)"];
    console.table(phaseResults.map((r, i) => ({
        Phase: phases[i],
        Requests: r.total,
        "Err%": r.errorRate,
        RPS: r.rps,
        Avg: r.avg,
        P95: r.p95,
        P99: r.p99,
        Max: r.max,
    })));

    // Identify breakpoint
    const breakpointIdx = phaseResults.findIndex(r => {
        const p95 = parseInt(r.p95);
        const errRate = parseFloat(r.errorRate);
        return p95 > 2000 || errRate > 5;
    });

    if (breakpointIdx === -1) {
        console.log("\n✅ System handled all load phases successfully (up to 100 concurrent users).");
        console.log("   No performance degradation detected.");
    } else {
        console.log(`\n⚠️  Performance degradation detected at: ${phases[breakpointIdx]}`);
        console.log(`   P95: ${phaseResults[breakpointIdx].p95}, Error Rate: ${phaseResults[breakpointIdx].errorRate}`);
        if (breakpointIdx > 0) {
            console.log(`   Last healthy phase: ${phases[breakpointIdx - 1]}`);
        }
    }

    // Bottleneck analysis
    console.log("\n📊 Bottleneck Analysis:");
    const lastPhase = phaseResults[phaseResults.length - 1];
    const p95Val = parseInt(lastPhase.p95);
    if (p95Val < 500) {
        console.log("   ✅ API layer is healthy — p95 under 500ms even at peak load");
    } else if (p95Val < 1000) {
        console.log("   ⚡ API layer shows minor strain — p95 between 500ms-1s at peak");
    } else if (p95Val < 2000) {
        console.log("   ⚠️  API layer under pressure — p95 between 1-2s at peak");
        console.log("   Likely cause: DB connection pooling or cold starts");
    } else {
        console.log("   🔴 API layer degraded — p95 over 2s at peak");
        console.log("   Likely cause: DB saturation, connection limits, or serverless cold starts");
    }

    console.log("\n── Load test complete ──\n");
}

main().catch(console.error);
