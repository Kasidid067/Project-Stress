export interface AdvisorStudent {
    id: number;
    studentId: string;
    fullname: string;
    major: {
        id: number;
        name: string;
    };

    pulses: {
        id: number;
        bpm: number;
        recordedAt: string;
    }[];

    results: {
        id: number;
        stressScore: number;
        stressLevel: string;
        createdAt: Date;
    }[];
}
