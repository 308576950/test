#!/usr/bin/env python
import os
import sys
#from  import *

if __name__ == "__main__":

    sys.path.append('/usr/local/lib/python2.7/dist-packages/openstack_dashboard')

#    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "{{ project_name }}.settings")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE",'openstack_dashboard.settings')

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
