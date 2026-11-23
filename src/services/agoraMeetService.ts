// src/services/agoraMeetService.ts

export interface AgoraSessionConfig {
  appId: string;
  channelName: string;
  token?: string | null;
  uid?: number;
}

export interface AgoraController {
  isNativeSdkAvailable: boolean;
  joinRoom: (config: AgoraSessionConfig) => Promise<{ ok: boolean; mode: 'agora-native' | 'expo-go-sim' }>;
  leaveRoom: () => Promise<void>;
  setMicrophoneMuted: (muted: boolean) => Promise<void>;
  setCameraEnabled: (enabled: boolean) => Promise<void>;
}

// Placeholder App ID — replace with your Agora App ID when building a native client
export const DEFAULT_AGORA_APP_ID = 'YOUR_AGORA_APP_ID';

function loadAgoraRtcEngine(): any | null {
  try {
    // Dynamic require prevents Expo Go from crashing on missing native RTC binary
    const mod = require('react-native-agora');
    return mod?.createAgoraRtcEngine ? mod.createAgoraRtcEngine() : null;
  } catch {
    return null;
  }
}

export function createAgoraMeetController(): AgoraController {
  let engine: any = null;
  const nativeAvailable = Boolean(loadAgoraRtcEngine());

  return {
    isNativeSdkAvailable: nativeAvailable,

    async joinRoom(config: AgoraSessionConfig) {
      if (nativeAvailable && config.appId && config.appId !== DEFAULT_AGORA_APP_ID) {
        try {
          engine = loadAgoraRtcEngine();
          engine.initialize({ appId: config.appId });
          engine.enableVideo();
          engine.joinChannel(config.token ?? '', config.channelName, config.uid ?? 0, {});
          return { ok: true, mode: 'agora-native' };
        } catch {
          // Fallback cleanly to simulation mode if native call fails
        }
      }

      return { ok: true, mode: 'expo-go-sim' };
    },

    async leaveRoom() {
      if (engine) {
        try {
          engine.leaveChannel();
          engine.release();
        } catch {
          // Ignore cleanup errors in simulation/dev
        } finally {
          engine = null;
        }
      }
    },

    async setMicrophoneMuted(muted: boolean) {
      if (engine) {
        try {
          engine.muteLocalAudioStream(muted);
        } catch {
          // Ignore in fallback mode
        }
      }
    },

    async setCameraEnabled(enabled: boolean) {
      if (engine) {
        try {
          engine.muteLocalVideoStream(!enabled);
        } catch {
          // Ignore in fallback mode
        }
      }
    },
  };
}