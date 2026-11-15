# HealthMate

HealthMate is an offline Android journal for steps, calories burned and water intake. Tap **Get Started** and **Add** to log your day. Use **Records** to search dates, edit entries or confirm a deletion. Open **Insights** to review a week, month, year or custom date range.

## Open the project

Use Node 22.19 or later, npm, Android Studio and Android SDK 37. Open the project folder in your editor, then run:

```sh
npm ci
npm run android
```

Open **Records** and search for **18 Aug 2026** to see the coursework example with 7,850 steps, 420 kcal burned and 2,000 ml of water. A one-time SQLite migration adds it on installation or upgrade if that date is free. You can edit or delete it. Fresh development databases also include recent sample days. The dashboard uses the device's local calendar date.

## Follow a record through the code

1. `src/screens/RecordFormScreen.tsx` collects the date and three measurements.
2. `src/viewmodels/useHealthViewModel.ts` validates the draft, saves it and reloads records. `HealthContext.tsx` shares that state with the other screens.
3. `src/database/healthRepository.ts` initializes and migrates `healthmate.db`. It uses parameterized SQL for inserts, updates, deletes and lookups. The unique date constraint enforces one entry per day. Edits and deletes use the row ID.
4. `src/models/healthRecords.ts` defines the record fields, date helpers, input limits and goal calculations. `src/models/insights.ts` groups saved measurements by date and calculates the chart, totals and averages for the selected period.

Settings keeps the display name, a small profile photo, daily goals and reminder preference in SQLite. Profile edits take effect when you tap **Save profile**.

## Verify and rebuild

```sh
npm run typecheck
npm test
npx expo prebuild --platform android --no-install
```

On Windows, set `JAVA_HOME` to your Android Studio JBR directory and `ANDROID_HOME` to your installed Android SDK. From the project root in PowerShell, run:

```powershell
$env:NODE_ENV = "production"
.\android\gradlew.bat -p android :app:assembleRelease
```

Gradle writes `android/app/build/outputs/apk/release/app-release.apk`. The coursework APK uses the generated project's development signing key for local installation. The repository tests run the production SQL against a file-backed SQLite database, including closing and reopening it.

The implementation builds on the existing local HealthMate Expo project and the supplied MobileApp Figma design. Codex assisted with the SQLite integration checks, project organization, profile editor, Insights changes and Android packaging.
