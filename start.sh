#!/bin/bash

if source .venv/bin/activate; then
    if pip install -r nova_loadtest/requirements.txt; then
        echo "Installed all"
    else
        echo "Failed to install requirements"
    fi
else
    echo "Failed to activate virtual environment"
fi

