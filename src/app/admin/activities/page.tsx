"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import ActivityForm, {
  ActivityFormData,
} from "@/components/activity/ActivityForm";
import ActivityTable from "@/components/activity/ActivityTable";
import DeleteActivityDialog from "@/components/activity/DeleteActivityDialog";
import {
  createActivity,
  deleteActivity,
  updateActivity,
} from "@/services/activity.service";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/types/activity";

export default function AdminActivitiesPage() {
  const {
    activities,
    loading,
    refresh,
  } = useActivities();
  const [
    keyword,
    setKeyword,
  ] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");
  const [levelFilter, setLevelFilter] =
    useState("ALL");
  const [
    open,
    setOpen,
  ] = useState(false);
  const [
    editing,
    setEditing,
  ] =
    useState<Activity | null>(null);
  const [
    deleting,
    setDeleting,
  ] =
    useState<Activity | null>(null);
  const filteredActivities = useMemo(() => {
    const key =
      keyword
        .trim()
        .toLowerCase();
    return activities.filter(
      (activity) => {
        const keywordMatch =
          activity.title
            .toLowerCase()
            .includes(key)
          ||
          activity.description
            .toLowerCase()
            .includes(key);
        const categoryMatch =
          categoryFilter === "ALL"
          ||
          activity.category ===
          categoryFilter;
        const levelMatch =
          levelFilter === "ALL"
          ||
          activity.stressLevel ===
          levelFilter;
        return (
          keywordMatch
          &&
          categoryMatch
          &&
          levelMatch
        );
      }
    );
  }, [
    activities,
    keyword,
    categoryFilter,
    levelFilter,
  ]);
  async function handleSubmit(
    data: ActivityFormData
  ) {
    try {
      if (
        !data.title.trim()
      ) {
        alert(
          "กรุณากรอกชื่อกิจกรรม"
        );
        return;
      }
      if (
        !data.description.trim()
      ) {
        alert(
          "กรุณากรอกรายละเอียด"
        );
        return;
      }
      if (
        data.duration <= 0
      ) {
        alert(
          "ระยะเวลาต้องมากกว่า 0 นาที"
        );
        return;
      }
      if (editing) {
        await updateActivity(
          editing.id,
          data
        );
        alert(
          "แก้ไขกิจกรรมสำเร็จ"
        );
      } else {
        await createActivity(
          data
        );
        alert(
          "เพิ่มกิจกรรมสำเร็จ"
        );
      }
      await refresh();
      setEditing(null);
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert(
        "เกิดข้อผิดพลาด"
      );
    }
  }

  async function confirmDelete() {
    if (!deleting)
      return;
    try {
      await deleteActivity(
        deleting.id
      );
      alert(
        "ลบกิจกรรมสำเร็จ"
      );
      setDeleting(null);
      setEditing(null);
      await refresh();
    } catch (error) {
      console.error(error);
      alert(
        "ไม่สามารถลบกิจกรรมได้"
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl">
            ⏳
          </div>
          <p>
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-page wellness-page space-y-8 p-5 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-green-700">
            จัดการกิจกรรม
          </h1>
          <p className="mt-2 text-gray-500">
            เพิ่ม แก้ไข และลบกิจกรรมสำหรับนิสิต
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
        >
          <Plus size={18} />
          เพิ่มกิจกรรม
        </button>
      </div>
      <div className="admin-surface p-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={keyword}
              onChange={(e) =>
                setKeyword(
                  e.target.value
                )
              }
              placeholder="ค้นหากิจกรรม..."
              className="w-full rounded-xl border py-3 pl-11 pr-4"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="rounded-xl border p-3"
          >
            <option value="ALL">
              ทุกประเภท
            </option>
            <option value="RELAX">
              ผ่อนคลาย
            </option>
            <option value="EXERCISE">
              ออกกำลังกาย
            </option>
            <option value="MEDITATION">
              สมาธิ
            </option>
            <option value="MUSIC">
              ดนตรี
            </option>
            <option value="OTHER">
              อื่น ๆ
            </option>
          </select>
          <select
            value={levelFilter}
            onChange={(e) =>
              setLevelFilter(
                e.target.value
              )
            }
            className="rounded-xl border p-3"
          >
            <option value="ALL">
              ทุกระดับ
            </option>
            <option value="LOW">
              ความเครียดต่ำ
            </option>
            <option value="MEDIUM">
              ความเครียดปานกลาง
            </option>
            <option value="HIGH">
              ความเครียดสูง
            </option>
          </select>
        </div>
        <ActivityTable
          activities={filteredActivities}
          onEdit={(activity) => {
            setEditing(activity);
            setOpen(true);
          }}
          onDelete={(activity) => {
            setDeleting(activity);
          }}
        />
      </div>

      <ActivityForm
        open={open}
        initialData={editing}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <DeleteActivityDialog
        open={!!deleting}
        activity={deleting}
        onClose={() => {
          setDeleting(null);
        }}
        onConfirm={confirmDelete}
      />
      <div className="admin-surface p-6">
        <h2 className="mb-4 text-xl font-bold">
          สรุปข้อมูล
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="wellness-card bg-emerald-50/70 p-5 dark:bg-emerald-950/20">
            <p className="text-gray-500">
              กิจกรรมทั้งหมด
            </p>
            <h3 className="mt-2 text-3xl font-bold text-green-700">
              {activities.length}
            </h3>
          </div>
          <div className="wellness-card bg-teal-50/70 p-5 dark:bg-teal-950/20">
            <p className="text-gray-500">
              ผ่อนคลาย
            </p>
            <h3 className="mt-2 text-3xl font-bold text-green-700">
              {
                activities.filter(
                  a =>
                    a.category ===
                    "RELAX"
                ).length
              }
            </h3>
          </div>
          <div className="wellness-card bg-amber-50/70 p-5 dark:bg-amber-950/20">
            <p className="text-gray-500">
              ออกกำลังกาย
            </p>
            <h3 className="mt-2 text-3xl font-bold text-yellow-600">
              {
                activities.filter(
                  a =>
                    a.category ===
                    "EXERCISE"
                ).length
              }
            </h3>
          </div>
          <div className="wellness-card bg-violet-50/70 p-5 dark:bg-violet-950/20">
            <p className="text-gray-500">
              สมาธิ / อื่น ๆ
            </p>
            <h3 className="mt-2 text-3xl font-bold text-red-600">
              {
                activities.filter(
                  a =>
                    a.category ===
                    "MEDITATION" ||
                    a.category ===
                    "MUSIC" ||
                    a.category ===
                    "OTHER"
                ).length
              }
            </h3>
          </div>
        </div>
      </div>
    </main>
  );
}
