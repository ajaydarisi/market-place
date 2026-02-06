"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminAuditLogs() {
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [action]);

  const { data, isLoading } = useAdminAuditLogs({
    action: action !== "all" ? action : undefined,
    page,
    pageSize: 50,
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("delete")) return "destructive";
    if (action.includes("update")) return "secondary";
    if (action.includes("create")) return "default";
    return "outline";
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDetails = (details: any) => {
    if (!details) return "-";
    try {
      return JSON.stringify(details, null, 2).slice(0, 100) + (JSON.stringify(details).length > 100 ? "..." : "");
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          aria-label="Back to admin dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all administrative actions. Total: {data?.total || 0} entries.
          </p>
        </div>

        <Card className="mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger aria-label="Filter by action" className="w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user_update">User Update</SelectItem>
                <SelectItem value="user_delete">User Delete</SelectItem>
                <SelectItem value="profile_update">Profile Update</SelectItem>
                <SelectItem value="project_update">Project Update</SelectItem>
                <SelectItem value="project_delete">Project Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card>
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Type</TableHead>
                  <TableHead>Target ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {formatAction(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{log.targetType}</span>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {log.targetId.slice(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs text-muted-foreground truncate max-w-[200px] block"
                        title={formatDetails(log.details)}
                      >
                        {formatDetails(log.details)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No audit logs found</p>
                        <p className="text-sm text-muted-foreground">
                          Admin actions will appear here once performed.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Pagination */}
        {data && data.total > 50 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {Math.ceil(data.total / 50)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.total / 50)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
