import sys, os
import logging
from werkzeug.debug import DebuggedApplication

logging.basicConfig(stream=sys.stderr)
mypath = '/home/sai/indictools/sb-mgmt'
sys.path.insert (0, mypath)
os.chdir(mypath)
sys.stdout = sys.stderr
from myapi.app import app
application = DebuggedApplication(app, True)
