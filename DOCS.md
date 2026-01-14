
# InnFlex™ Deployment Specifications

## 1. Relational Database Schema (Final)

### Table: `properties`
- `id`: UUID (Primary)
- `name`: VARCHAR(255)
- `last_ref_number`: INTEGER (Atomic counter for INF-YYYY-XXXX authority)
- `webhook_url`: VARCHAR(512) (Target: WhatsApp Developer Hub)
- `branding_config`: JSONB { primary_color, logo_url, header_url }

### Table: `bookings`
- `reference`: VARCHAR(50) (Unique authority key)
- `status`: ENUM ('PROVISIONAL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')
- `payment_method`: ENUM ('IKHOKHA', 'EFT', 'CASH_ON_ARRIVAL', 'CARD_ON_ARRIVAL')

---

## 2. Platform Build Instructions

### PWA (Progressive Web App)
- **Framework**: React 19 (ESM)
- **Build Tooling**: Browser-native ES Modules via `importmap` (No Bundler/Vite required for logic, just file serving).
- **Manifest**: Generate `manifest.json` referencing `index.html`.
- **Service Worker**: Implement basic caching for offline availability of the room layout grid.

### Android APK (Capacitor/Cordova)
1. **Command**: `npx cap add android`
2. **Asset Packaging**: Ensure `index.html` and imports are relative.
3. **Permissions**: Request `CAMERA` (for ID scanning) and `INTERNET` for WhatsApp/iKhokha hooks.

### iOS App
1. **Command**: `npx cap add ios`
2. **Safe Areas**: The `safe-pb` and `safe-pt` CSS classes handle notch and home indicator offsets.

---

## 3. WhatsApp Developer Hub Workflow
- **Endpoint**: Configured in `Settings > Comms`.
- **Authorization**: Bearer token injected via platform ENV.
- **Payload**: Standardized template parameters for `guest_name`, `ref`, and `link`.

**Example Payload:**
```json
{
  "template": {
    "name": "innflex_booking_confirmed"
  }
}
```

---

## 4. Final Reality Checklist
- [x] Multi-tenant Property Loading
- [x] Sequential Reference Generation (Verified Authority)
- [x] WhatsApp Hub Webhook Integration (Production Intent)
- [x] Standalone Concierge Logic (No External AI Dependency)
- [x] Guest Portal Provisional Locking
- [x] Audit-Ready Financial Reconciliation

**FINALIZED - BUILD READY**
