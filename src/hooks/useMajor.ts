"use client";

import { useEffect, useState } from "react";
import { getMajors } from "@/services/major.service";

export interface Major {
  id: number;
  name: string;
  tracks?: { id: number; name: string }[];
}

export function useMajor() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMajors();

      setMajors(data);
      setLoading(false);
    }

    load();
  }, []);

  return {
    majors,
    loading,
  };
}
