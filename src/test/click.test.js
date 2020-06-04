describe('Click.js class', () => {

  beforeAll(async () => {
    await page.goto(URL);
  });

  it('shows a page', async () => {
    expect(await page.title()).toBe('Thimbleful');
  });

});
