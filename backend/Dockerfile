# backend/Dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Production image
FROM python:3.12-slim as production

WORKDIR /app

# Создаем непривилегированного пользователя
RUN useradd --create-home --shell /bin/bash appuser

# Копируем виртуальное окружение из builder-этапа
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем код приложения
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

# Запускаем Gunicorn с воркерами Uvicorn
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]