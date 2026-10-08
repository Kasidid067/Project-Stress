"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/services/adminUserDetail.service";
import type { AdminUser } from "@/types/adminUser";

export function useAdminUser(id: number) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUser(id);
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    } else {
      setLoading(false);
    }
  }, [id]);

  return {
    user,
    loading,
  };
}