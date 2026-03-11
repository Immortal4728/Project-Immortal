type OtpRecord = {
    code: string;
    expiresAt: number;
    attempts: number;
};

// Global singleton to preserve state across module reloads in Next.js development
const globalForOtpStore = global as unknown as { otpCache: Map<string, OtpRecord> };

export const otpStore = globalForOtpStore.otpCache || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') globalForOtpStore.otpCache = otpStore;

export function storeOtp(email: string, code: string, durationMinutes: number = 5): void {
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    otpStore.set(email, { code, expiresAt, attempts: 3 });
}

export function getOtpRecord(email: string): OtpRecord | undefined {
    return otpStore.get(email);
}

export function deleteOtp(email: string): void {
    otpStore.delete(email);
}

export function decrementAttempts(email: string): void {
    const record = otpStore.get(email);
    if (record) {
        record.attempts -= 1;
        otpStore.set(email, record);
    }
}
