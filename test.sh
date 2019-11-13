#!/usr/bin/env bash

# shellcheck disable=SC2164
cd backend/
pip install -r requirements.txt
pytest tests