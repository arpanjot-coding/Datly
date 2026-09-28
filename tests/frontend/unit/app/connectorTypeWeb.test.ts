import { describe, expect, it } from 'vitest';

import { connectorSortOrder, DatabaseIcon, getConnectorIcon } from '../../../../src/icons';
import { en, zh } from '../../../../src/i18n/locales';
import { CONNECTOR_TYPE_KEY_MAP } from '../../../../src/views/UnifiedDataUploadDialog';

describe('web connector UI type', () => {
    it('maps WebDataLoader to the web i18n suffix', () => {
        expect(CONNECTOR_TYPE_KEY_MAP.WebDataLoader).toBe('web');
    });

    it('sorts web near sample_datasets and local_folder, not in the unknown bucket', () => {
        expect(connectorSortOrder('web', 'sample_datasets')).toBeGreaterThan(0);
        expect(connectorSortOrder('WebDataLoader', 'SampleDatasetsLoader')).toBeGreaterThan(0);
        expect(connectorSortOrder('web', 'local_folder')).toBeLessThan(0);
        expect(connectorSortOrder('WebDataLoader', 'LocalFolderDataLoader')).toBeLessThan(0);
        expect(connectorSortOrder('web', 'mysql')).toBeLessThan(0);
        expect(connectorSortOrder('web', 'unknown_loader_type')).toBeLessThan(0);
        expect(connectorSortOrder('WebDataLoader', 'unknown_loader_type')).toBeLessThan(0);
    });

    it('uses a dedicated icon for web and WebDataLoader, not the unknown fallback', () => {
        expect(getConnectorIcon('web').type).not.toBe(DatabaseIcon);
        expect(getConnectorIcon('WebDataLoader').type).not.toBe(DatabaseIcon);
        expect(getConnectorIcon('unknown_loader_type').type).toBe(DatabaseIcon);
    });

    it('has upload.connectorDesc.web in English and Chinese', () => {
        const enDesc = (en as { upload: { connectorDesc: Record<string, string> } }).upload.connectorDesc.web;
        const zhDesc = (zh as { upload: { connectorDesc: Record<string, string> } }).upload.connectorDesc.web;
        expect(typeof enDesc).toBe('string');
        expect(enDesc.length).toBeGreaterThan(0);
        expect(typeof zhDesc).toBe('string');
        expect(zhDesc.length).toBeGreaterThan(0);
    });
});
