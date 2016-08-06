from config import *
from pprint import pprint
from mydb import *
from sbregions import *
from locations import *
import json
            
class SBMgmtDB(MyDB):
    global SB_MGMTDB
    _sbregions = None
    _geodb = None

    def __init__(self):
        MyDB.__init__(self, SB_MGMTDB)

    def initialize(self):
        MyDB.initialize(self)
        try:
            for cname in ['project_types', 'role_types', 'activity_types', \
               'region_types', 'regions']:
                self.add(cname, True)
            for cname in ['users', 'activities', 'projects', 'xactions' ]:
                self.add(cname)
        except Exception as e:
            print("Error initializing " + self.dbname + " database; aborting.", e)
            sys.exit(1)
        _sbregions = None
        _geodb = None
        self.sbregions()
        self.locations()

    def sbregions(self):
        if not self._sbregions:
            self._sbregions = SBRegions(self)
        return self._sbregions

    def locations(self):
        if not self._geodb:
            self._geodb = Locations(self)
        return self._geodb
