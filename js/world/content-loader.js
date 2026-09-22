export async function loadCoreContent({ baseUrl = './data', fetchImpl = fetch } = {}) {
  const names = ['regions', 'cities', 'districts', 'traits'];
  const entries = await Promise.all(names.map(async name => {
    const response = await fetchImpl(`${baseUrl}/${name}.json`);
    if (!response.ok) throw new Error(`Failed to load ${name}.json`);
    return [name, await response.json()];
  }));
  return Object.fromEntries(entries);
}
