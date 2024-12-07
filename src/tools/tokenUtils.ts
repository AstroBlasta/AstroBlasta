import { ARCHWAY_TOKEN_MAPPINGS, IBC_TOKEN_MAPPINGS, NATIVE_TOKENS } from './tokenMappings';

export function resolveTokenFromContract(contractAddr: string): string {
  // Check for known contract address patterns
  for (const [pattern, symbol] of Object.entries(ARCHWAY_TOKEN_MAPPINGS)) {
    if (contractAddr.includes(pattern)) {
      return symbol;
    }
  }
  return 'TOKEN';
}

export function resolveTokenFromIBC(ibcDenom: string): string {
  // Check if it's a native token first
  if (NATIVE_TOKENS[ibcDenom]) {
    return NATIVE_TOKENS[ibcDenom];
  }

  if (!ibcDenom.startsWith('ibc/')) {
    return ibcDenom.toUpperCase();
  }

  // Extract the hash from the IBC denom
  const hash = ibcDenom.split('ibc/')[1];

  // Look up the hash in our mappings
  return IBC_TOKEN_MAPPINGS[hash] || 'IBC';
}

export function resolveAssetName(asset: string): string {
  if (asset.startsWith('ibc/')) {
    return resolveTokenFromIBC(asset);
  }
  if (asset.startsWith('archway') || asset.startsWith('neutron')) {
    return resolveTokenFromContract(asset);
  }
  if (NATIVE_TOKENS[asset]) {
    return NATIVE_TOKENS[asset];
  }
  return asset;
}

export function formatTokenPair(tokens: string[]): string {
  return tokens.join('-');
}
