#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# SEED SAMPLE DATA (runs only once)
python manage.py seed_sample_data
