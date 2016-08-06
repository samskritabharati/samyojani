from flask_restful import Resource
from db import *

class _Types(Resource):
    dbname = None

    def get(self):
        if not self.dbname:
            return {}
        coll = getdb()[self.dbname]
        return { self.dbname : sorted(coll.all().keys()) }

class region_types(_Types):
    def __init__(self):
        self.dbname = 'region_types'

class role_types(_Types):
    def __init__(self):
        self.dbname = 'role_types'

class project_types(_Types):
    def __init__(self):
        self.dbname = 'project_types'

class activity_types(_Types):
    def __init__(self):
        self.dbname = 'activity_types'
