import axios from "axios";

export async function getAdvisors() {
    const { data } = await axios.get(
        "/api/admin/advisors"
    );

    return data;
}

export async function getAdvisorStudents(
    advisorId: number
) {
    const { data } = await axios.get(
        `/api/admin/advisors/${advisorId}/students`
    );

    return data;
}