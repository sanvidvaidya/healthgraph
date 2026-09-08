/**
 * HealthGraph API Client
 * Connects the React UI to the Starlette backend and FHIR R4 endpoints.
 */

const API_BASE = '';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API request failed [${url}]:`, err);
    throw err;
  }
}

export const api = {
  getStats: () => fetchJson('/api/stats'),
  getPatients: () => fetchJson('/api/patients'),
  getPatientDossier: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/dossier`),
  getCdsAlerts: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/cds-alerts`),
  getPatientTransferReadiness: (id) => fetchJson(`/api/patient/${encodeURIComponent(id)}/transfer-readiness`),
  getGraph: () => fetchJson('/api/graph'),
  getPatientGraph: (id) => fetchJson(`/api/graph/patient/${encodeURIComponent(id)}`),
  getPatientTimeline: (id) => fetchJson(`/api/timeline/patient/${encodeURIComponent(id)}`),
  getResources: (type = '', search = '') => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    return fetchJson(`/api/resources?${params.toString()}`);
  },
  getResourceDetail: (type, id) => fetchJson(`/api/resource/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
  getQualityAudit: () => fetchJson('/api/quality/audit'),
  getInteropPipeline: () => fetchJson('/api/interop/pipeline'),
  getTerminology: () => fetchJson('/api/terminology'),
  search: (query) => fetchJson(`/api/search?q=${encodeURIComponent(query)}`),
  validateResource: (resource) => fetchJson('/api/validate', {
    method: 'POST',
    body: JSON.stringify(resource),
  }),
  getCapabilityStatement: () => fetchJson('/fhir/metadata'),
  getFhirResource: (type, id) => fetchJson(`/fhir/${encodeURIComponent(type)}/${encodeURIComponent(id)}`),
  getFhirList: (type) => fetchJson(`/fhir/${encodeURIComponent(type)}`),
  getBundleExport: () => fetchJson('/api/bundle/export'),
  importBundle: (bundle, mode = 'merge') => fetchJson(`/api/bundle/import?mode=${mode}`, {
    method: 'POST',
    body: JSON.stringify(bundle),
  }),
  resetBundle: () => fetchJson('/api/bundle/reset', {
    method: 'POST',
  }),
};
