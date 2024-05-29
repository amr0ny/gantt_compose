#!/bin/bash
mkdir -p /var/www/static
mkdir -p /var/www/media

chown www-data:www-data /var/log

#python manage.py runserver #DO THIS ONLY IN DEBUG MODE
uwsgi --strict --ini uwsgi.ini