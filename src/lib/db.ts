const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const INSFORGE_KEY = process.env.INSFORGE_API_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

interface QueryResult {
    rows: any[];
    rowCount: number;
    fields?: any[];
}

/**
 * Execute a parameterized SQL query against the InsForge PostgreSQL database.
 * Uses the InsForge raw SQL REST API endpoint.
 */
export async function query(sql: string, params: any[] = []): Promise<QueryResult> {
    const response = await fetch(`${INSFORGE_URL}/api/database/advance/rawsql`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${INSFORGE_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql, params }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Database query failed (${response.status}): ${errorBody}`);
    }

    const result: QueryResult = await response.json();
    return result;
}
