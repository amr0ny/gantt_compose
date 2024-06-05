#!/bin/bash
mkdir -p /var/www/static
mkdir -p /var/www/media
mkdir -p /opt/app/logs
chown www-data:www-data /opt/app/logs

#python manage.py runserver #DO THIS ONLY IN DEBUG MODE
uwsgi --strict --ini uwsgi.ini