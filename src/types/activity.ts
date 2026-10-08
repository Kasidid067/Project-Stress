export interface Activity {
    id: number;
    title: string;
    description: string;
    image: string | null;
    category:
        | "RELAX"
        | "EXERCISE"
        | "MEDITATION"
        | "MUSIC"
        | "OTHER";
    duration: number;
    stressLevel:
        | "LOW"
        | "MEDIUM"
        | "HIGH";
    createdAt: string;
    updatedAt: string;
    recommendationReasons?: string[];
}
