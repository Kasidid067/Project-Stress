export interface AdminUser {
    id: number;

    studentId: string;
    fullname: string;
    email: string;
    phone: string | null;


    role: string;
    isSuperAdmin: boolean;
    status: string;

    majorId: number;
    advisorId: number | null;

    major: {
        id: number;
        name: string;
    };

    advisor: {
        id: number;
        fullname: string;
    } | null;
}
