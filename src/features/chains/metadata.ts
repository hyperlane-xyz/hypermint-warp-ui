import type { Chain as WagmiChain } from '@wagmi/chains';

import { ChainMetadata, chainIdToMetadata, objMap, wagmiChainMetadata } from '@hyperlane-xyz/sdk';

import CustomChainConfig from '../../consts/chains.json';

export type CustomChainMetadata = Omit<ChainMetadata, 'name'> & {
  name: string;
  logoImgSrc: string;
};

export const chainIdToCustomConfig = Object.values(CustomChainConfig).reduce<
  Record<number, CustomChainMetadata>
>((result, config) => {
  result[config.id] = config as CustomChainMetadata;
  return result;
}, {});

export const chainIdToCustomConfigg = Object.values(CustomChainConfig).reduce<
  Record<number, CustomChainMetadata>
>((result, config) => {
  const id = config.name == 'goerli' ? 5 : 9000;
  result[id] = config as CustomChainMetadata;
  return result;
}, {});

export function getChainMetadata(chainId: number): ChainMetadata {
  if (chainIdToCustomConfig[chainId]) return chainIdToCustomConfig[chainId] as ChainMetadata;
  else if (chainIdToMetadata[chainId]) return chainIdToMetadata[chainId];
  else throw new Error(`No metadata found for chain ${chainId}`);
}

export function getChainRpcUrl(chainId: number): string {
  if (chainId === 5) {
    return 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
  }
  const metadata = getChainMetadata(chainId);
  const first = metadata.publicRpcUrls[0];
  return first.http;
}

export function getChainExplorerUrl(chainId: number, apiUrl = false): string {
  const metadata = getChainMetadata(chainId);
  const first = metadata.blockExplorers[0];
  if (!first) {
    return 'unknown_explorer';
  }
  return apiUrl ? first.apiUrl || first.url : first.url;
}

export function getChainDisplayName(chainId?: number, shortName = false): string {
  if (!chainId) return 'Unknown';
  const metadata = getChainMetadata(chainId);
  return shortName ? metadata.displayNameShort || metadata.displayName : metadata.displayName;
}

// Metadata formatted for use in Wagmi config
export function getWagmiChainConfig() {
  return Object.values({
    ...wagmiChainMetadata,
    ...objMap(chainIdToCustomConfigg as Record<string, ChainMetadata>, toWagmiConfig),
  });
}

// TODO move to SDK
function toWagmiConfig(_: any, metadata: ChainMetadata): WagmiChain {
  const id = metadata.name == 'goerli' ? 5 : 9000;
  return {
    id,
    name: metadata.displayName,
    network: metadata.name as string,
    nativeCurrency: metadata.nativeToken,
    rpcUrls: { default: { http: [metadata.publicRpcUrls[0].http] } },
    blockExplorers: metadata.blockExplorers.length
      ? {
          default: {
            name: metadata.blockExplorers[0].name,
            url: metadata.blockExplorers[0].url,
          },
        }
      : undefined,
  };
}
