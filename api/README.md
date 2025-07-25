# Dev XP Camp Backend Setup Guide

This guide will help you get the backend running and create a teacher account ready to log in and use the system.

---

## 1. Prerequisites

-   Python 3.10+
-   PostgreSQL (or your configured database)
-   [pipenv](https://pipenv.pypa.io/en/latest/) or `pip`
-   Node.js (for frontend, if needed)

---

## 2. Clone the Repository

```bash
git clone https://github.com/hmyunis/dev-xp-app.git
cd dev-xp-app/api
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

-   Copy `.env.example` to `.env` and fill in your settings (DB, secret key, etc).
-   To seed initial schools, add this to your `.env`:
    ```
    SEED_SCHOOLS=true
    ```

---

## 5. Run Migrations

```bash
python manage.py migrate
```

---

## 6. Seed Initial Schools

If you set `SEED_SCHOOLS=true` in your `.env`, run:

```bash
python manage.py seed_schools
```

This will upsert two schools:

-   Moonlight Academy
-   Nejashi Academy

---

## 7. Create a Teacher (Superuser) Account

Run:

```bash
python manage.py createsuperuser
```

-   You will be prompted to select a school from the seeded list.
-   Enter the school ID for the teacher account.

---

## 8. Run the Development Server

```bash
python manage.py runserver
```

---

## 9. Log In

-   Use the credentials you set for the teacher account.
-   You can now log in to the frontend or use the API.

---

## 10. Creating Students

-   When a teacher creates student users (via the backend or API), those students will automatically be assigned to the same school as the teacher.

---

## 11. Adding More Schools

-   To add more schools, use SQL or the Django shell. There is no frontend UI for school management.

---

## Troubleshooting

-   If you have issues with school assignment, ensure you have seeded schools and selected a valid school during superuser creation.
-   For any database or migration issues, check your `.env` and database connection.

---

## Contact

For further help, contact me or check the codebase for more documentation.
