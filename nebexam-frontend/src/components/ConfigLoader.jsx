'use client';

import { useEffect } from 'react';
import { configService } from '@/services/users.service';
import useConfigStore from '@/store/configStore';

export default function ConfigLoader() {
  const setConfig = useConfigStore((s) => s.setConfig);

  useEffect(() => {
    configService.getSiteSettings()
      .then((res) => setConfig(res.data))
      .catch(() => setConfig({ subscription_required: true }));
  }, []);

  return null;
}
