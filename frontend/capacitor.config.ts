import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.youthcenter.app',
  appName: 'YouthCenterApp',
  webDir: 'out',  // <--- 여기를 'public'에서 'out'으로 수정!
  server: {
    androidScheme: 'https'
  }
};

export default config;