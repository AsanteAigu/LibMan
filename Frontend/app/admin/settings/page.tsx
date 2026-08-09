"use client";

import { useState } from "react";
import { useSettings, useUpdateSetting } from "@/features/admin/hooks";
import { TableSkeleton } from "@/components/shared/skeletons";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Settings</h1>
        <p className="text-body-md text-on-surface-variant">System-wide library policy defaults</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {settings?.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-label-md text-label-md text-on-surface capitalize">
                  {setting.key.replace(/_/g, " ")}
                </p>
                {setting.description && (
                  <p className="text-label-sm font-label-sm text-on-surface-variant">{setting.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={drafts[setting.key] ?? setting.value}
                  onChange={(e) => setDrafts((d) => ({ ...d, [setting.key]: e.target.value }))}
                  className="w-24 rounded-md border border-outline-variant bg-surface-container-low px-2 py-1.5 text-body-md text-right"
                />
                <button
                  onClick={() => updateSetting.mutate({ key: setting.key, value: drafts[setting.key] ?? setting.value })}
                  disabled={updateSetting.isPending}
                  className="rounded-md bg-primary text-on-primary text-label-sm font-label-sm px-3 py-1.5 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
