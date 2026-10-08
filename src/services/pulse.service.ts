import axios from "axios";

export interface PulseRecord {
    id: number;
    userId: number;
    bpm: number;
    recordedAt: string;
}

const API = "/api/pulse";

export async function measurePulse() {
    const { data } =
        await axios.post<PulseRecord>(
            API
        );

    return data;
}

export async function saveManualPulse(
    bpm: number
) {
    const { data } =
        await axios.post<PulseRecord>(
            API,
            {
                bpm,
            }
        );

    return data;
}

export async function getPulseHistory() {
    const { data } =
        await axios.get<PulseRecord[]>(
            API
        );

    return data;
}
