from flask_restful import Resource
from db import *

class _Types(Resource):
    cname = None

    def get(self):
        if not self.cname:
            return {}
        coll = sbget()[self.cname]
        return { self.cname : sorted(coll.all().keys()) }

class region_types(_Types):
    def __init__(self):
        self.cname = 'region_types'

class role_types(_Types):
    def __init__(self):
        self.cname = 'role_types'

class project_types(_Types):
    def __init__(self):
        self.cname = 'project_types'

class activity_types(_Types):
    def __init__(self):
        self.cname = 'activity_types'
