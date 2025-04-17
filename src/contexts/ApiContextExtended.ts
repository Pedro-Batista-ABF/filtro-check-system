
// This is a helper file to make imports cleaner
export { ApiContextExtended, ApiContextExtendedProvider } from './api/ApiContextExtendedProvider';
export { useExtendedApi } from './api/useExtendedApi';
export type { ApiContextExtendedType } from './api/types';

// Renomeamos a exportação para evitar conflitos
export { useExtendedApi as useApi } from './api/useExtendedApi';
