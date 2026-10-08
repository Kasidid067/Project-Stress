export interface StaffStudentDetail {

    id: number;

    studentId: string;

    fullname: string;

    email: string;

    phone: string | null;


    major: {
        id: number;
        name: string;
    };

    advisor: {
        id: number;
        fullname: string;
    } | null;

    pulses: {
        id: number;
        bpm: number;
        recordedAt: string;
    }[];

    results: {
        id: number;
        stressScore: number;
        stressLevel: string;
        recommendation: string | null;
        createdAt: string;
    }[];

}
