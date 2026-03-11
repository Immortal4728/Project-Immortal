export interface ProjectRequest {
    id?: string;
    name: string;
    email: string;
    phone: string;
    project_title: string;
    domain: string;
    description: string;
    status?: "pending" | "approved" | "rejected";
    created_at?: string;
}
