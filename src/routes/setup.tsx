import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
  head: () => ({
    meta: [
      { title: "Setup Guide — Chama-OS" },
      { name: "description", content: "Database and authentication setup guide." },
    ],
  }),
});

interface DatabaseStatus {
  connected: boolean;
  tables: Record<string, boolean>;
  checking: boolean;
}

function SetupPage() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    tables: {},
    checking: true,
  });

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // Try to check if we can connect to Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Try to query a table to verify database connection
      const tables = [
        'profiles',
        'chamas',
        'memberships',
        'savings_records',
        'loans',
        'meetings',
        'invites'
      ];

      const tableStatus: Record<string, boolean> = {};
      let connected = !sessionError;

      for (const table of tables) {
        try {
          const { error } = await (supabase as any)
            .from(table)
            .select('id', { count: 'exact' })
            .limit(1);
          
          tableStatus[table] = !error;
          if (!error) connected = true;
        } catch (e) {
          tableStatus[table] = false;
        }
      }

      setStatus({
        connected,
        tables: tableStatus,
        checking: false,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        checking: false,
        connected: false,
      }));
    }
  };

  const allTablesExist = Object.values(status.tables).every(exists => exists);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Chama-OS Setup</h1>
          <p className="text-slate-400">Database and authentication configuration</p>
        </div>

        {/* Database Status */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {allTablesExist ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              Database Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              {status.checking ? "Checking..." : allTablesExist ? "All set!" : "Action needed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            {status.checking ? (
              <p>Checking database connection...</p>
            ) : allTablesExist ? (
              <>
                <p className="text-green-400">✅ Database is fully configured!</p>
                <p>All required tables are set up and ready.</p>
              </>
            ) : (
              <>
                <Alert className="bg-amber-950 border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-200">
                    Database tables are not yet created. Follow the manual setup steps below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 mt-4">
                  <p className="font-semibold text-white">Table Status:</p>
                  {Object.entries(status.tables).map(([table, exists]) => (
                    <div key={table} className="flex items-center gap-2">
                      {exists ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{table}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Setup Instructions</CardTitle>
            <CardDescription className="text-slate-400">Follow these steps to complete setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="border-b border-slate-700 pb-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Set Up Database Schema
              </h3>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                <li>Go to <a href="https://app.supabase.com" target="_blank" className="text-blue-400 hover:underline inline-flex items-center gap-1">Supabase Dashboard<ExternalLink className="w-3 h-3" /></a></li>
                <li>Select your project: <code className="bg-slate-900 px-2 py-1 rounded text-sm">amvfhtjenuktbhozvyeka</code></li>
                <li>Navigate to <strong>SQL Editor</strong> (left sidebar)</li>
                <li>Click <strong>New Query</strong></li>
                <li>Copy and paste this SQL file: <a href="https://github.com" target="_blank" className="text-blue-400 hover:underline">supabase/migrations/20260525000000_complete_schema.sql</a></li>
                <li>Click <strong>Run</strong> (play button)</li>
                <li>Click the refresh button below to verify tables are created</li>
              </ol>
              <Button onClick={checkDatabase} className="mt-4" variant="outline">
                🔄 Refresh Database Status
              </Button>
            </div>

            {/* Step 2 */}
            <div className="border-b border-slate-700 pb-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Configure Google OAuth
              </h3>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-blue-400 hover:underline inline-flex items-center gap-1">Google Cloud Console<ExternalLink className="w-3 h-3" /></a></li>
                <li>Create or select a project</li>
                <li>Enable the <strong>Google+ API</strong></li>
                <li>Go to <strong>Credentials</strong> → <strong>Create Credentials</strong> → <strong>OAuth 2.0 Web Client</strong></li>
                <li>Set <strong>Authorized redirect URIs</strong> to:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li><code className="bg-slate-900 px-2 py-1 rounded text-sm">https://amvfhtjenuktbhozvyeka.supabase.co/auth/v1/callback</code></li>
                    <li><code className="bg-slate-900 px-2 py-1 rounded text-sm">http://localhost:8081/auth/v1/callback</code></li>
                  </ul>
                </li>
                <li>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                <li>In Supabase Dashboard → <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Google</strong></li>
                <li>Paste Client ID and Secret, then <strong>Save</strong></li>
              </ol>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                Test Login
              </h3>
              <p className="text-slate-300 mb-4">Once database and OAuth are configured:</p>
              <Button asChild className="w-full">
                <a href="/login">Go to Login Page</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="mt-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-300 font-mono text-sm">
            <div>
              <span className="text-slate-400">Project ID:</span>
              <code className="bg-slate-900 px-2 py-1 rounded block mt-1">amvfhtjenuktbhozvyeka</code>
            </div>
            <div>
              <span className="text-slate-400">URL:</span>
              <code className="bg-slate-900 px-2 py-1 rounded block mt-1">https://amvfhtjenuktbhozvyeka.supabase.co</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
