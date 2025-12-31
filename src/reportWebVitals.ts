import type { ReportHandler } from "web-vitals";

/**
 * Pass a callback to log or send performance metrics.
 * Example:
 *   reportWebVitals(console.log);
 *
 * Or send to analytics:
 *   reportWebVitals(metric => sendToAnalytics(metric));
 */
const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (typeof onPerfEntry !== "function") return;

  import("web-vitals").then(
    ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }
  );
};

export default reportWebVitals;
