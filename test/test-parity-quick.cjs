// Quick parity test: load sample project via server, check key values match expected
const { webkit } = require('playwright');
(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('error')) {
      console.log('BROWSER ERROR:', text);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Load sample project
  await page.evaluate(async () => {
    const resp = await fetch('src/template/case-studies/01-assembly-obc-sb10.csv');
    const csv = await resp.text();
    window.TEUI.FileHandler.processImportedCSV(csv);
  });
  await page.waitForTimeout(5000);

  // Check key parity values
  const result = await page.evaluate(() => {
    const CI = window.TEUI.ComputationIntegration;
    const mState = CI.getState();
    const modelId = mState.getActiveModelId();

    const fields = {};
    const fieldIds = ['h_10', 'h_6', 'h_8', 'e_10', 'e_6', 'e_8', 'h_136', 'j_32', 'k_32'];
    for (const fid of fieldIds) {
      const dom = document.querySelector(`[data-field-id="${fid}"]`)?.textContent;
      fields[fid] = { dom };
    }

    // Also check graph values
    fields.graphTEUI = mState.getValueForModel(modelId, 'keyValues.target.teui');
    fields.graphAnnualCarbon = mState.getValueForModel(modelId, 'keyValues.target.annualCarbon');
    fields.graphCFA = mState.getValueForModel(modelId, 'building.conditionedFloorArea');

    return fields;
  });

  console.log('Parity check results:');
  console.log(JSON.stringify(result, null, 2));

  // Expected: h_10 DOM = 93.3 (TEUI target), h_136 DOM should be the same as graph TEUI
  const h10dom = parseFloat(result.h_10?.dom);
  const graphTEUI = result.graphTEUI;
  console.log(`\nh_10 DOM: ${h10dom}, graph TEUI: ${graphTEUI}`);
  console.log(`Match: ${Math.abs(h10dom - graphTEUI) < 0.1 ? 'YES' : 'NO'}`);

  await browser.close();
})();
