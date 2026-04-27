"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SearchInput } from "@/components/dashboard-kit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const modules = [
  { id: 1, name: "Computer Systems", type: "IT", classes: 2, doctors: "Dr. Hesham, Eslam" },
  { id: 2, name: "Database", type: "IT", classes: 2, doctors: "Dr. Dorothy Guirgues" },
  { id: 3, name: "Network", type: "IT", classes: 4, doctors: "Dr. Amr Adel, Ahmed Ali" },
  { id: 4, name: "Software development", type: "IT", classes: 1, doctors: "Dr. Ali Omar, Yousra" },
  { id: 5, name: "Microcontroller", type: "IT", classes: 2, doctors: "Mohamed Medhat" },
];

export default function ModulesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout
      title="Module Management"
      description="Create and assign Modules to doctors"
      action={
        <Link href="/modules/new">
          <PageActionButton icon={Plus}>Add Module</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search Modules by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="dashboard-panel overflow-hidden">
          <Table>
            <TableHeader className="bg-[#fcfbff]">
              <TableRow>
                <TableHead>Module Name</TableHead>
                <TableHead>Module Type</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Doctors</TableHead>
                <TableHead className="w-[150px] text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium text-[#6f6a7e]">{module.name}</TableCell>
                  <TableCell>{module.type}</TableCell>
                  <TableCell>{module.classes}</TableCell>
                  <TableCell>{module.doctors}</TableCell>
                  <TableCell className="space-x-7 text-right">
                    <button className="text-[14px] font-medium text-foreground">Edit</button>
                    <button className="text-[14px] font-medium text-[#ff5c68]">Delete</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
