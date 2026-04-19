"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");

  useEffect(() => {
    async function load() {
      try {
        const param = filter === "all" ? "" : `?status=${filter}`;
        const res = await fetch(`/api/admin/students${param}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStudents(data.students || []);
      } catch {
        toast.error("Неуспешно вчитување студенти");
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    load();
  }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified_student: true }),
      });
      if (!res.ok) throw new Error();
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, is_verified_student: true } : s));
      toast.success("Студентот е верификуван");
    } catch {
      toast.error("Неуспешна верификација на студент");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Да се одбие и означи оваа студентска сметка?")) return;
    try {
      const res = await fetch(`/api/admin/students/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified_student: false, flagged: true }),
      });
      if (!res.ok) throw new Error();
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Студентот е одбиен");
    } catch {
      toast.error("Неуспешно одбивање студент");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <PageHeader
        title="Управување со студенти"
        description="Прегледајте студентски регистрации и управувајте со верификација."
        className="pt-0 mt-0 sm:pt-0 pb-2 mb-2 border-none"
      />

      <div className="flex gap-2">
        {(["all", "pending", "verified"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === f
                ? "bg-accent text-white border-accent"
                : "bg-surface border-border text-foreground-muted hover:bg-surface-raised"
            }`}
          >
            {f === "all" ? "сите" : f === "pending" ? "на чекање" : "верификувани"}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden shadow-card">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Корисник</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden md:table-cell">Емаил</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden sm:table-cell">Факултет</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Статус</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Акции</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="py-4 px-5">
                    <div className="h-4 bg-surface-raised rounded animate-pulse w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-foreground-muted text-sm">
                  Не се пронајдени студенти.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id} className="hover:bg-surface-raised transition-colors">
                  <TableCell className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{s.full_name || "Непознат"}</span>
                      <span className="text-xs text-foreground-muted font-mono">@{s.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-5 py-4 text-foreground-muted text-sm">{s.email}</TableCell>
                  <TableCell className="hidden sm:table-cell px-5 py-4 text-foreground-muted text-sm">{s.faculty || "—"}</TableCell>
                  <TableCell className="px-5 py-4">
                    {s.is_verified_student ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Верификуван</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">На чекање</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-surface-raised"
                        title="Види профил"
                        onClick={() => s.username && router.push(`/profile/${s.username}`)}
                      >
                        <Eye size={16} className="text-foreground-muted" />
                      </Button>
                      {!s.is_verified_student && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-success/20 hover:text-success"
                          title="Верификувај"
                          onClick={() => handleApprove(s.id)}
                        >
                          <Check size={16} />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                        title="Одбиј"
                        onClick={() => handleReject(s.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
