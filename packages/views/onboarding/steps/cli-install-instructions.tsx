"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Card, CardContent } from "@multica/ui/components/ui/card";

const INSTALL_CMD =
  "curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash";
const DEFAULT_APP_URL = "https://multica.ai";
const DEFAULT_SERVER_URL = "https://api.multica.ai";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function Step({ n, label, cmd }: { n: number; label: string; cmd: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-foreground">
        {n}. {label}
      </p>
      <div className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 font-mono text-sm">
        <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <code className="min-w-0 flex-1 whitespace-pre-wrap break-all">
          {cmd}
        </code>
        <CopyButton text={cmd} />
      </div>
    </div>
  );
}

/**
 * CLI install instructions — two copy-and-run commands. The install
 * script is public; the setup command is parameterized so self-hosted
 * deployments can point the CLI and daemon back at their own server.
 */
export function CliInstallInstructions({
  appUrl = DEFAULT_APP_URL,
  serverUrl = DEFAULT_SERVER_URL,
}: {
  appUrl?: string;
  serverUrl?: string;
} = {}) {
  const setupCmd = `multica setup self-host --server-url ${serverUrl} --app-url ${appUrl}`;
  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-4">
        <p className="text-xs leading-[1.55] text-muted-foreground">
          You&apos;ll need an AI coding tool on this machine (Claude
          Code, Codex, Cursor, …) for the daemon to do real work. Also
          works on servers and remote dev boxes.
        </p>
        <Step n={1} label="Install the Multica CLI" cmd={INSTALL_CMD} />
        <Step
          n={2}
          label="Configure, login, and start the daemon"
          cmd={setupCmd}
        />
      </CardContent>
    </Card>
  );
}
