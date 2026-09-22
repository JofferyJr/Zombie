import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLeitianWorld } from '../../js/world/world-generator.js';
import { loadCoreContent } from '../../js/world/content-loader.js';

const content = {
  districts: [
    { id: 'northern-suburbs', cityId: 'leitian', danger: 1 },
    { id: 'railway-district', cityId: 'leitian', danger: 3 },
    { id: 'steelworks-zone', cityId: 'leitian', danger: 4 }
  ]
};

test('generates same seeded variations for same seed', () => {
  assert.deepEqual(generateLeitianWorld({ seed: 'HX-1', content }), generateLeitianWorld({ seed: 'HX-1', content }));
});

test('different seed changes generated variation while keeping northern suburbs', () => {
  const a = generateLeitianWorld({ seed: 'HX-1', content });
  const b = generateLeitianWorld({ seed: 'HX-2', content });
  assert.notDeepEqual(a, b);
  assert.ok(a.districts.some(d => d.id === 'northern-suburbs'));
  assert.ok(b.districts.some(d => d.id === 'northern-suburbs'));
});

test('core content loader fetches all four slice catalogs', async () => {
  const called = [];
  const fakeFetch = async url => {
    called.push(url);
    const name = url.split('/').pop().replace('.json','');
    return { ok: true, json: async () => [{ id: `${name}-1` }] };
  };
  const catalog = await loadCoreContent({ baseUrl: '/data', fetchImpl: fakeFetch });
  assert.deepEqual(Object.keys(catalog).sort(), ['cities','districts','regions','traits']);
  assert.equal(called.length, 4);
});
