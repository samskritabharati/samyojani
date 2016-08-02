from config import *
from pprint import pprint
from mydb import *
import json
            
class SBMgmtDB(MyDB):
    global SB_MGMTDB

    def __init__(self):
        MyDB.__init__(self, SB_MGMTDB)

    def initialize(self):
        MyDB.initialize(self)
        try:
            for cname in ['users', 'activities', 'regions', 'projects', \
               'project_types', 'role_types', 'activity_types', \
               'region_types', 'xactions' ]:
                self.add(cname)
        except Exception as e:
            print("Error initializing " + self.dbname + " database; aborting.", e)
            sys.exit(1)
