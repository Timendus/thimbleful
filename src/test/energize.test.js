const { getClassList } = require('./helpers');

describe('Energize class', () => {

  beforeEach(async () => {
    await page.goto(URL);
    await page.reload();
    await page.click('a[href="#energize"]');
  });

  describe('open and close', () => {

    it('can open the target', async () => {
      expect(await getClassList('#center')).toEqual(['tab']);
      await page.click('a[data-open="#center"]');
      expect(await getClassList('#center')).toEqual(['tab', 'active']);
    });

    it('can close the target', async () => {
      expect(await getClassList('#left')).toEqual(['tab','active']);
      await page.click('a[data-close="#left"]');
      expect(await getClassList('#left')).toEqual(['tab']);
    });

  });

  describe('toggle', () => {

    it('can toggle the target', async () => {
      // Go to right tab
      await page.click('a[data-open="#center"]');

      expect(await getClassList('#colour')).toEqual([]);
      await page.click('a[data-toggle="#colour"]');
      expect(await getClassList('#colour')).toEqual(['active']);
      await page.click('a[data-toggle="#colour"]');
      expect(await getClassList('#colour')).toEqual([]);
    });

  });

  describe('groups', () => {

    it('can close other targets in the group', async () => {
      expect(await getClassList('#left')).toEqual(['tab','active']);
      await page.click('a[data-open="#center"]');
      expect(await getClassList('#left')).toEqual(['tab']);
    });

  });

  describe('followers', () => {

    it('will open with the target element', async () => {
      expect(await getClassList('a[data-open="#center"]')).toEqual([]);
      await page.click('a[data-open="#center"]');
      expect(await getClassList('a[data-open="#center"]')).toEqual(['active']);
    });

    it('will close with the target element', async () => {
      expect(await getClassList('a[data-open="#left"]')).toEqual(['active']);
      await page.click('a[data-open="#center"]');
      expect(await getClassList('a[data-open="#left"]')).toEqual([]);
    });

  });

  describe('timers', () => {

    it('will close an element after a given time', async () => {
      expect(await getClassList('#right')).toEqual(['tab']);
      await page.click('a[data-open="#right"]');
      expect(await getClassList('#right')).toEqual(['tab', 'active']);
      await page.waitFor(2000);
      expect(await getClassList('#right')).toEqual(['tab']);
    });

  });

});
