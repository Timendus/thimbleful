describe('Click class', () => {

  beforeEach(async () => {
    await page.goto(URL);
    await page.reload();
    await page.click('a[href="#click"]');
  });

  it('triggers when clicking a button', async () => {
    const buttonDialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', buttonDialogHandler);
    await page.click('.example button');
    expect(buttonDialogHandler).toHaveBeenCalled();
    page.off('dialog', buttonDialogHandler);
  });

  it('triggers when clicking an input[type="button"]', async () => {
    const inputDialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', inputDialogHandler);
    await page.click('.example input[type="button"]');
    expect(inputDialogHandler).toHaveBeenCalled();
    page.off('dialog', inputDialogHandler);
  });

});
