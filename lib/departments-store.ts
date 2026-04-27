"use client";

export type Department = {
  id: string;
  name: string;
  description: string;
};

export const initialDepartments: Department[] = [
  {
    id: "department-it",
    name: "Information Technology (IT)",
    description: "Manages software, infrastructure, networking, and academic technology workflows.",
  },
  {
    id: "department-electrical",
    name: "Electrical Technology",
    description: "Focuses on electrical systems, control engineering, and applied laboratory training.",
  },
  {
    id: "department-mechanical",
    name: "Mechanical Technology",
    description: "Covers mechanical design, production systems, and hands-on technical practice.",
  },
];
