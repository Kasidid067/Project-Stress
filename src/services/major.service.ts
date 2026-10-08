import type { Major } from "@/types/major";

export class MajorDeleteError extends Error {
    studentCount: number;

    constructor(
        message: string,
        studentCount: number
    ) {
        super(message);
        this.name = "MajorDeleteError";
        this.studentCount = studentCount;
    }
}

export async function getMajors(): Promise<Major[]> {
    const res = await fetch("/api/admin/majors");

    if (!res.ok) {
        throw new Error("โหลดหลักสูตรไม่สำเร็จ");
    }

    return res.json();
}

export async function createMajor(
    data: {
        name: string;
    }
): Promise<Major> {
    const res = await fetch("/api/admin/majors", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("เพิ่มหลักสูตรไม่สำเร็จ");
    }

    return res.json();
}

export async function updateMajor(
    id: number,
    data: {
        name: string;
    }
): Promise<Major> {
    const res = await fetch(
        `/api/admin/majors/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!res.ok) {
        throw new Error("แก้ไขหลักสูตรไม่สำเร็จ");
    }

    return res.json();
}

export async function deleteMajor(
    id: number,
    deleteStudents = false
): Promise<void> {
    const url = deleteStudents
        ? `/api/admin/majors/${id}?deleteStudents=true`
        : `/api/admin/majors/${id}`;

    const res = await fetch(url, {
        method: "DELETE",
    });

    if (res.ok) {
        return;
    }

    let data: {
        message?: string;
        studentCount?: number;
    } = {};

    try {
        data = await res.json();
    } catch {
        // ใช้ข้อความ default ด้านล่าง
    }

    if (
        res.status === 409 &&
        typeof data.studentCount === "number"
    ) {
        throw new MajorDeleteError(
            data.message ||
                "หลักสูตรนี้มีนิสิตอยู่ในระบบ",
            data.studentCount
        );
    }

    throw new Error(
        data.message ||
            "ลบหลักสูตรไม่สำเร็จ"
    );
}
