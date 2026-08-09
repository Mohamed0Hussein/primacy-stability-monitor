import React, { useEffect, useState } from 'react';
import { DownloadCloud, RotateCw } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { Button } from './common/Button';
import { Card } from './common/Card';
import packageJson from '../../package.json';

export const UpdateNotifier: React.FC = () => {
  const { theme } = useTheme();
  const { error: showError } = useToast();
  const [downloadedVersion, setDownloadedVersion] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const offDownloaded = api.onUpdateDownloaded((info) => setDownloadedVersion(info.version));
    const offError = api.onUpdateError((message) => showError(`Update check failed: ${message}`));

    return () => {
      offDownloaded();
      offError();
    };
  }, [showError]);

  if (!downloadedVersion) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await window.electronAPI?.installUpdate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: theme.colors.overlay }}
    >
      <Card className="max-w-sm w-full relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}
          >
            <DownloadCloud size={28} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            Update ready to install
          </h3>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Version {downloadedVersion} has been downloaded (you're on {packageJson.version}).
            Restart now to apply it.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="ghost" fullWidth onClick={() => setDownloadedVersion(null)}>
              Later
            </Button>
            <Button variant="primary" fullWidth isLoading={installing} onClick={handleInstall}>
              <RotateCw size={16} />
              Restart & Update
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
