const API_BASE_URL = 'https://board-games-geek-tale.onrender.com';
const GRAPHQL_PATH = '/graphql';

function buildUrl(path, query) {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiRequest(path, { method = 'GET', token, body, query } = {}) {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.message && Array.isArray(data.message) ? data.message.join(', ') : data?.message;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return data;
}

export async function graphqlRequest(query, { token, variables } = {}) {
  const response = await fetch(buildUrl(GRAPHQL_PATH), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, variables })
  });

  const data = await response.json();
  if (!response.ok || data.errors?.length) {
    const gqlMessage = data.errors?.map((e) => e.message).join(', ');
    throw new Error(gqlMessage || `GraphQL request failed (${response.status})`);
  }
  return data.data;
}

export { API_BASE_URL };
