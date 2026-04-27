#!/bin/bash

BASE_DIR=~/Documentos/proyecto_movil
COMBINED_LOG="$BASE_DIR/combined.log"
PID_FILE="$BASE_DIR/.pids"

# Directorios
LARAVEL_DIR="$BASE_DIR/BackendAPK"
EXPRESS_DIR="$BASE_DIR/microservicio-express"
DJANGO_DIR="$BASE_DIR/microservicio-django"
FLASK_REC_DIR="$BASE_DIR/microservicio-flask"       # recomendaciones
FLASK_FAV_DIR="$BASE_DIR/microservicio-favoritos"   # favoritos y listas

# Limpiar logs y pid
> "$COMBINED_LOG"
> "$PID_FILE"

echo "Iniciando servicios (logs en $COMBINED_LOG)"

# Función para lanzar un servicio con prefijo y redirigir logs
run_service() {
    local name=$1
    local cmd=$2
    local dir=$3
    if [ ! -d "$dir" ]; then
        echo "[ERROR] No existe directorio: $dir" | tee -a "$COMBINED_LOG"
        return 1
    fi
    (
        cd "$dir" || return 1
        eval "$cmd" 2>&1 | while IFS= read -r line; do
            echo "[$name] $line"
        done
    ) >> "$COMBINED_LOG" 2>&1 &
    local pid=$!
    echo "$pid" >> "$PID_FILE"
    echo "OK → $name (PID $pid)"
}

# 1. Laravel Gateway (puerto 8001)
run_service "LARAVEL" "php artisan serve --port=8001 --host=0.0.0.0" "$LARAVEL_DIR"

# 2. Express (puerto 3000)
run_service "EXPRESS" "node server.js" "$EXPRESS_DIR"

# 3. Django (puerto 8000)
run_service "DJANGO" "source venv/bin/activate && python manage.py runserver 8000" "$DJANGO_DIR"

# 4. Flask recomendaciones (puerto 5000)
run_service "FLASK_REC" "source venv/bin/activate && python app.py" "$FLASK_REC_DIR"

# 5. Flask favoritos (puerto 5001)
run_service "FLASK_FAV" "source venv/bin/activate && python app.py" "$FLASK_FAV_DIR"

echo "Todos los servicios lanzados. Monitorea con: tail -f $COMBINED_LOG"
echo "Para detener: ./stop-all.sh"