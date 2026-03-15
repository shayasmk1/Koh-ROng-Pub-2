async function testOffset(offsetMinutes) {
  function getCambodiaTime() {
    const d = new Date();
    d.setUTCMinutes(d.getUTCMinutes() + offsetMinutes);
    return d.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  }

  const req_time = getCambodiaTime();
  const formData = new FormData();
  formData.append('req_time', req_time);
  formData.append('amount', '25.00');
  formData.append('currency', 'USD');
  formData.append('title', 'Koh Rong Pub Crawl - 1 Tickets');
  formData.append('description', 'Tickets for 2026-03-12');
  formData.append('merchant_ref_no', 'ORD-123');

  try {
    const res = await fetch('http://localhost:3000/api/payway/create', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log(`Offset ${offsetMinutes}m:`, data);
  } catch (e) {
    console.error(`Offset ${offsetMinutes}m: Error`);
  }
}

async function run() {
  for (let i = -10; i <= 10; i += 1) {
    await testOffset(i);
  }
}
run();
