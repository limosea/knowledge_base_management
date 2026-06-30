import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auditLogsApi } from "@/api";
import type { AuditLog } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import {
  User,
  Clock,
  MapPin,
  Zap,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  FileJson,
  LayoutList,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/highlighter";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "users.superAdmin",
  admin: "users.admin",
  user: "users.user",
};

interface AuditLogDetailDialogProps {
  logId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailDialog({
  logId,
  open,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  const { t } = useTranslation();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !logId) {
      setLog(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    auditLogsApi
      .get(logId)
      .then((data) => {
        if (!cancelled) setLog(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, logId]);

  const handleCopyJson = () => {
    if (!log) return;
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

useLayoutEffect(() => {
    if (!open) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.shiftKey) return;

      const target = e.target as HTMLElement;
      const scrollContainer = target.closest('.code-scroll') as HTMLElement | null;
      if (!scrollContainer) return;

      e.stopImmediatePropagation();
      e.preventDefault();
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      scrollContainer.scrollBy({ left: delta, behavior: 'auto' });
    };

    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => document.removeEventListener('wheel', onWheel, { capture: true });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[calc(100dvh-3rem)] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            {t("auditLogs.detailTitle")}
            {loading && <Skeleton className="h-5 w-24 inline-block" />}
            {!loading && log && (
              <Badge variant="secondary" className="font-mono text-xs">
                {log.action}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {logId && !loading && (
              <span className="font-mono text-xs">{logId}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="px-6 pb-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="px-6 pb-6 text-sm text-destructive">{error}</div>
        )}

        {!loading && !error && log && (
          <Tabs defaultValue="overview" className="flex flex-col min-h-0 min-w-0">
            <div className="px-6 border-b">
              <TabsList className="bg-transparent p-0 h-10 gap-4">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 gap-2"
                >
                  <LayoutList className="h-4 w-4" />
                  {t("auditLogs.overviewTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="raw"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 gap-2"
                >
                  <FileJson className="h-4 w-4" />
                  {t("auditLogs.rawJsonTab")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="m-0 flex-1 min-h-0 min-w-0">
              <ScrollArea className="h-[calc(100dvh-16rem)]">
                <div className="px-6 pb-6 space-y-4 pt-4">
                  <AuditLogOverview log={log} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="raw" className="m-0 flex-1 min-h-0 min-w-0">
              <div className="relative px-6 pb-6 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-6 right-8 z-10 gap-1.5"
                  onClick={handleCopyJson}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {t("common.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t("common.copy")}
                    </>
                  )}
                </Button>
                <div
                  className="h-[calc(100dvh-17rem)] overflow-auto rounded-md border bg-muted/50 code-scroll"
                >
                  <div className="text-sm font-mono leading-relaxed">
                    <CodeBlock
                      code={log ? JSON.stringify(log, null, 2) : "{}"}
                      language="json"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuditLogOverview({ log }: { log: AuditLog }) {
  const { t } = useTranslation();

  const roleLabel = log.actorRole
    ? ROLE_LABELS[log.actorRole]
      ? t(ROLE_LABELS[log.actorRole])
      : log.actorRole
    : undefined;

  const clientValue = log.clientInfo?.mcpClient
    ? `${log.clientInfo.mcpClient}${log.clientInfo.clientVersion ? ` ${log.clientInfo.clientVersion}` : ""}`
    : log.userAgent
      ? parseUserAgent(log.userAgent)
      : "-";

  const actorName = log.actorName || t(`auditLogs.actorType_${log.actorType}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={log.status} />
        {log.httpStatusCode !== undefined && log.httpStatusCode !== null && (
          <HttpStatusBadge code={log.httpStatusCode} />
        )}
        <SourceBadge source={log.source} />
        {roleLabel && (
          <Badge
            variant={
              log.actorRole === "super_admin"
                ? "default"
                : log.actorRole === "admin"
                  ? "secondary"
                  : "outline"
            }
            className="text-xs"
          >
            {roleLabel}
          </Badge>
        )}
      </div>

      {log.errorMessage && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {log.errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          icon={<User className="h-4 w-4" />}
          color="blue"
          label={t("auditLogs.who")}
        >
          <div className="space-y-2">
            <LabeledRow
              label={t("auditLogs.username", "用户名")}
              value={actorName}
            />
            {log.actorNickname && (
              <LabeledRow
                label={t("auditLogs.nickname", "昵称")}
                value={log.actorNickname}
                valueClassName="font-normal"
              />
            )}
            {log.actorId && (
              <LabeledRow
                label={t("auditLogs.internalId", "内部 ID")}
                value={log.actorId}
                mono
              />
            )}
            {log.actorAccountType === "test" && (
              <Badge variant="outline" className="text-xs">
                {t("auditLogs.testAccount", "测试号")}
              </Badge>
            )}
          </div>
        </SectionCard>
        <SectionCard
          icon={<Clock className="h-4 w-4" />}
          color="amber"
          label={t("auditLogs.when")}
          value={formatDate(log.createdAt)}
          sub={new Date(log.createdAt).toISOString()}
        />
        <SectionCard
          icon={<MapPin className="h-4 w-4" />}
          color="emerald"
          label={t("auditLogs.where")}
          value={log.ipAddress || "-"}
        />
        <SectionCard
          icon={<Zap className="h-4 w-4" />}
          color="violet"
          label={t("auditLogs.what")}
        >
          <div className="space-y-2">
            <LabeledRow
              label={t("auditLogs.action", "动作")}
              value={log.action}
            />
            {log.resourceType && (
              <LabeledRow
                label={t("auditLogs.resourceType", "资源类型")}
                value={log.resourceType}
                valueClassName="font-normal"
              />
            )}
            {log.resourceId && (
              <LabeledRow
                label={t("auditLogs.resourceId", "资源 ID")}
                value={log.resourceId}
                mono
              />
            )}
          </div>
        </SectionCard>
        <SectionCard
          icon={<Monitor className="h-4 w-4" />}
          color="cyan"
          label={t("auditLogs.how")}
          value={clientValue}
          sub={log.userAgent || undefined}
        />
        <SectionCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          color={
            log.status === "success"
              ? "green"
              : log.status === "failure"
                ? "orange"
                : "red"
          }
          label={t("auditLogs.result")}
          value={log.status ? t(`auditLogs.status_${log.status}`) : "-"}
          sub={
            log.httpStatusCode !== undefined && log.httpStatusCode !== null
              ? `HTTP ${log.httpStatusCode}`
              : undefined
          }
        />
      </div>

      {log.details && Object.keys(log.details).length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            {t("auditLogs.details")}
          </h4>
          <div
            className="max-h-64 overflow-auto rounded-md bg-muted/50 code-scroll"
          >
            <pre className="p-3 text-xs font-mono leading-relaxed whitespace-pre">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  icon,
  color,
  label,
  value,
  sub,
  children,
}: {
  icon: React.ReactNode;
  color:
    | "blue"
    | "amber"
    | "emerald"
    | "violet"
    | "cyan"
    | "green"
    | "orange"
    | "red";
  label: string;
  value?: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("rounded-md p-1.5", colorClasses[color])}>
          {icon}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      {children ?? (
        <>
          <div className="text-sm font-medium break-words">{value}</div>
          {sub && (
            <div className="mt-1 text-xs text-muted-foreground break-all font-mono">
              {sub}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LabeledRow({
  label,
  value,
  mono,
  valueClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div
        className={cn(
          "text-sm font-medium break-words",
          mono && "font-mono text-xs text-muted-foreground",
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: AuditLog["status"] }) {
  const { t } = useTranslation();
  if (!status) return null;

  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: React.ReactNode;
    }
  > = {
    success: {
      variant: "default",
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    failure: {
      variant: "secondary",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    error: {
      variant: "destructive",
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const { variant, icon } = variants[status];

  return (
    <Badge variant={variant} className="capitalize">
      {icon}
      {t(`auditLogs.status_${status}`)}
    </Badge>
  );
}

function HttpStatusBadge({ code }: { code: number }) {
  const color =
    code < 300
      ? "bg-green-500/15 text-green-700 dark:text-green-400"
      : code < 400
        ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
        : code < 500
          ? "bg-orange-500/15 text-orange-700 dark:text-orange-400"
          : "bg-red-500/15 text-red-700 dark:text-red-400";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        color,
      )}
    >
      HTTP {code}
    </span>
  );
}

function SourceBadge({ source }: { source: AuditLog["source"] }) {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className="capitalize">
      {t(`auditLogs.source_${source}`)}
    </Badge>
  );
}

function parseUserAgent(ua: string) {
  const match = ua.match(/^(\S+)/);
  return match ? match[0] : ua.slice(0, 40);
}
