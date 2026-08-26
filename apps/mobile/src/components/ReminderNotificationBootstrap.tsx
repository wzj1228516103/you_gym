import { useEffect } from 'react';
import { fetchReminderSettings } from '../services/api';
import { loadLocalReminderSettings, syncReminderNotifications } from '../services/reminderNotifications';
import { useAuthState } from '../state/AuthState';

export function ReminderNotificationBootstrap() {
  const { loading, token, guest } = useAuthState();
  useEffect(() => {
    if (loading) return;
    let active = true;
    void (async () => {
      const settings = token
        ? await fetchReminderSettings(token).then((result) => result.settings).catch(() => loadLocalReminderSettings())
        : await loadLocalReminderSettings();
      if (active) await syncReminderNotifications(settings).catch(() => undefined);
    })();
    return () => { active = false; };
  }, [guest, loading, token]);
  return null;
}
