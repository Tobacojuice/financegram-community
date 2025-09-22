# Financegram: App + Backend — Working Stack

This bundle wires your **Android app** and **Node/Express + MongoDB backend** into a single, easy-to-run setup.

---

## 1) Run the backend locally (with MongoDB)

### Quick start
```bash
# From this folder
docker compose up --build
```
- API base URL: **http://localhost:4000/**
- Health check: **GET http://localhost:4000/news** (should return seeded news items within a few seconds)

### What’s inside
- `docker-compose.yml` — spins up **MongoDB 7** and the **Financegram API** (Node 20).
- `backend/Dockerfile` — multi-stage TypeScript build → small production image.
- `backend/.env` — local env pointing the API at the `mongo` container and setting a strong `JWT_SECRET`.

To stop everything:
```bash
docker compose down -v
```

---

## 2) Android app → Backend (minimal wiring)

The app you provided is a template. The patches below make the **Slideshow** screen fetch and display `/news` from the backend.

### A. Add Internet permission
In `app/src/main/AndroidManifest.xml` (top level), add:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### B. Expose the API base URL to code
In `app/build.gradle.kts` inside `android {{ defaultConfig {{ ... }} }}`, add:
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:4000/\"")
```
- Emulator: use `http://10.0.2.2:4000/`
- Physical device on same Wi‑Fi: replace with your **host LAN IP**, e.g. `http://192.168.1.23:4000/`

### C. Add dependencies (Retrofit, Gson, Coroutines, RecyclerView)
In `app/build.gradle.kts` inside `dependencies {{}}`:
```kotlin
implementation("com.squareup.retrofit2:retrofit:2.11.0")
implementation("com.squareup.retrofit2:converter-gson:2.11.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.2")
implementation("androidx.recyclerview:recyclerview:1.3.2")
```
Sync Gradle.

### D. Drop-in files from this folder
Copy these files into your project (matching package paths):
```
android_patches/java/com/beta/financegram/net/ApiService.kt      → app/src/main/java/com/beta/financegram/net/ApiService.kt
android_patches/java/com/beta/financegram/net/Models.kt          → app/src/main/java/com/beta/financegram/net/Models.kt
android_patches/java/com/beta/financegram/ui/news/NewsAdapter.kt → app/src/main/java/com/beta/financegram/ui/news/NewsAdapter.kt
android_patches/java/com/beta/financegram/ui/news/NewsViewModel.kt → app/src/main/java/com/beta/financegram/ui/news/NewsViewModel.kt
android_patches/java/com/beta/financegram/ui/news/NewsFragment.kt → app/src/main/java/com/beta/financegram/ui/news/NewsFragment.kt
android_patches/res/layout/fragment_news.xml                      → app/src/main/res/layout/fragment_news.xml
android_patches/res/layout/item_news.xml                          → app/src/main/res/layout/item_news.xml
```

Then, update your navigation (or replace the **Slideshow** menu item) to point to `NewsFragment` and set its layout to `fragment_news`.

> Tip: Quick test before wiring navigation — make `NewsFragment` your start destination and run.

---

## 3) API map (what the app can call)
- `GET /news` — latest ~20 news items (seeded by the backend on boot and hourly).
- `GET /market` — latest market quotes.
- `GET /jobs` — talent/job postings.
- `GET /communities` — community posts.
- `POST /auth/register` → `{{ email, password, name? }}`
- `POST /auth/login` → `{{ email, password }}` → returns JWT
- `GET /session` (auth) — returns current user profile (send `Authorization: Bearer <token>`)

---

## 4) Troubleshooting
- **API returns empty collections**: give it ~5 seconds after container starts; the seeder runs at launch.
- **Android cannot reach backend**:
  - Emulator: use `10.0.2.2` (Android maps this to your host).
  - Device: ensure phone and laptop are on the same network; use host LAN IP.
  - Check CORS: server already enables permissive CORS.
- **Port in use**: change `PORT` in `backend/.env` and the `ports:` mapping in `docker-compose.yml` accordingly.

---

Happy shipping! 🚀
