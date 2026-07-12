import { isFeatureEnabled } from "@/lib/featureFlags";

export const dynamic = "force-dynamic";

export default async function FeatureDemoPage() {
  const newBookingFlowEnabled = await isFeatureEnabled(
    "new_booking_flow",
    false
  );

  return (
    <div style={{ padding: "3rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        ConfigCat Feature Flag Demo
      </h1>

      {newBookingFlowEnabled ? (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "8px",
            background: "#dcfce7",
            border: "2px solid #16a34a",
            color: "#166534",
          }}
        >
          <strong>✅ New Booking Flow — ENABLED</strong>
          <p>
            This is the new, redesigned booking experience — toggled on
            live via ConfigCat, no redeploy needed.
          </p>
        </div>
      ) : (
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "8px",
            background: "#f3f4f6",
            border: "2px solid #9ca3af",
            color: "#374151",
          }}
        >
          <strong>⚪ New Booking Flow — DISABLED</strong>
          <p>Showing the classic booking flow (default/fallback state).</p>
        </div>
      )}

      <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#6b7280" }}>
        Flag key: <code>new_booking_flow</code> · Poll interval: 10s ·
        Toggle this in the ConfigCat dashboard and refresh this page.
      </p>
    </div>
  );
}
