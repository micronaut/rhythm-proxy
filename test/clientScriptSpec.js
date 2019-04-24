describe("Client spec", () => {
  it("caches the jobs", () => {
    let localStorageSpy = sinon.spy(window.localStorage, "setItem");
    $("body").append(`
        <div tooltip="job-1" title="job-1"></div>  
    `);
    jobStatusCache();

    localStorageSpy.restore();
    sinon.assert.calledWith(localStorageSpy, 'job-1', 'job-1');
  });
});
