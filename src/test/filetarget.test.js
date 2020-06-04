describe('File target class', () => {

  beforeEach(async () => {
    await page.goto(URL);
    await page.reload();
    await page.click('a[href="#dragdrop"]');
  });

  it('triggers when clicking a drop target', async () => {
    const clickDialogHandler = jest.fn(dialog => {
      expect(dialog._message).toEqual('You loaded README.md to target A');
      dialog.dismiss();
    });
    page.on('dialog', clickDialogHandler);

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('.example .droptarget')
    ]);
    await fileChooser.accept(['README.md']);

    await page.waitFor(100);
    expect(clickDialogHandler).toHaveBeenCalled();
    page.off('dialog', clickDialogHandler);
  });

  xit('triggers when dragging a file onto a drop target', async () => {
    // Dragging and dropping of files not supported in Puppeteer 😢
  });

});
