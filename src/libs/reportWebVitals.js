const reportWebVitals = onPerfEntry => {
  if (typeof onPerfEntry !== 'function') {
    return;
  }

  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }).catch(error => {
    console.error('Failed to load web-vitals module', error);
  });
};

export default reportWebVitals;
