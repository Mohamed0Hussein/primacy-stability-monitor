import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../services/firebaseConfig';
import { Download, X } from 'lucide-react';
import packageJson from '../../package.json';

// Utility to compare semantic versions
const isNewerVersion = (current: string, latest: string) => {
  if (!current || !latest) return false;
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const c = currentParts[i] || 0;
    const l = latestParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

export const UpdateNotifier: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const db = getDatabase(app);
      const updateRef = ref(db, 'appConfig/latestUpdate');

      const unsubscribe = onValue(updateRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.version) {
          const currentVersion = packageJson.version;
          if (isNewerVersion(currentVersion, data.version)) {
            setLatestVersion(data.version);
            setDownloadUrl(data.downloadUrl || '');
            setUpdateAvailable(true);
            setDismissed(false); // Show again if a newer version is pushed
          } else {
            setUpdateAvailable(false);
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Failed to connect to Firebase database for update check:", error);
    }
  }, []);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-blue-500/30 p-5 max-w-sm w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
            <Download size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Update Available!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Version {latestVersion} is now available. You are on version {packageJson.version}.
            </p>
            {downloadUrl && (
              <a 
                href={downloadUrl}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setDismissed(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Download Update
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
