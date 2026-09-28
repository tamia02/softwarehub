# Python backend (Flask + LangGraph). Runs behind the same VPS as the frontend,
# on its own container. Built from requirements-runtime.txt (verified set).
FROM python:3.11-slim

WORKDIR /app

# gcc as insurance for any sdist; no libpq needed on the SQLite path.
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Install deps first for layer caching.
COPY requirements-runtime.txt .
RUN pip install --no-cache-dir -r requirements-runtime.txt

# App code.
COPY . .
RUN mkdir -p logs /data

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health').raise_for_status()" || exit 1

# Init the DB, then serve with waitress (production WSGI). Overridable by compose.
CMD ["sh", "-c", "python -c 'from database import init_db; init_db()' && waitress-serve --host=0.0.0.0 --port=5000 app:app"]
