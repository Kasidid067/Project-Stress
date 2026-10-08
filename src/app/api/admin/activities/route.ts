import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
    ActivityCategory,
    Role,
    StressLevel,
} from "@prisma/client";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const activities = await prisma.activity.findMany({
            orderBy: {
                title: "asc",
            },
        });

        return NextResponse.json(activities);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Server Error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const activity =
            await prisma.activity.create({
                data: {
                    title: body.title,
                    description: body.description,
                    duration: Number(body.duration),
                    image: body.image ?? null,
                    category:
                        body.category as ActivityCategory,
                    stressLevel:
                        body.stressLevel as StressLevel,
                },
            });

        return NextResponse.json(activity);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Server Error",
            },
            {
                status: 500,
            }
        );
    }
}