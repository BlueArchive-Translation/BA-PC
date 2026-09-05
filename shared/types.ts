export type ProxyMode = 'system' | 'direct';

export interface IProxyInfo {
  url: string;
  noProxy: string;
}

export type TErrorMessageChannel =
  | 'game-download-error-no-space'
  | 'error-system'
  | 'game-download-failed'
  | 'game-download-error-network-down';
