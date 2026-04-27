#!/bin/bash

BASE_DIR=~/Documentos/proyecto_movil
PID_FILE="$BASE_DIR/.pids"

echo "Deteniendo servicios..."

# Matar procesos registrados en el archivo .pids
if [ -f "$PID_FILE" ]; then
    while read -r pid; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -9 "$pid" 2>/dev/null
            echo "Matado proceso $pid"
        fi
    done < "$PID_FILE"
    rm "$PID_FILE"
fi

# Matar cualquier proceso residual (huérfano)
pkill -f "php artisan serve" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
pkill -f "python manage.py runserver" 2>/dev/null
pkill -f "python app.py" 2>/dev/null

echo "Todos los servicios detenidos."