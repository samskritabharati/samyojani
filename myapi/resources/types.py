from flask_restful import Resource
from ..db import *

class _Types(Resource):
    cname = None

    def get(self):
        if not self.cname:
            abort(404)
        coll = sbget()[self.cname]
        return sorted(coll.all().keys())

class region_types(_Types):
    def __init__(self):
        self.cname = 'region_types'

class role_types(_Types):
    def __init__(self):
        self.cname = 'role_types'

class project_types(_Types):
    def __init__(self):
        self.cname = 'project_types'

class countries(_Types):
    def __init__(self):
        self.cname = 'countries'
        if self.cname not in sbget().c:
            cdb = sbget()[self.cname]
            cdb.reset()
            countries_file = cmdpath("countries.txt")
            print "Loading country list from", countries_file
            if os.path.exists(countries_file):
                with open(countries_file) as f:
                    for line in f:
                        c = line.rstrip().split('|')
                        cdb.insert({'_id' : c[1], 'code' : c[0]})

class activity_types(_Types):
    def __init__(self):
        self.cname = 'activity_types'

class Presets(Resource):
    _presets = {
        'Profession' :
            ['Technical Professional', 'Manager', \
            'Student', 'Self-employed', 'Not Employed', 'Homemaker', \
            'Vedic', 'Sanskrit Teaching', 'Sanskrit Pundit', 'Education', \
            'Other'],
        'Interests' :
            ['Learn Samskrit', 'Teach Samskrit', \
            'Volunteer for Samskrit', 'Help with Projects', \
            'Other'],
        'CourseType' :
            ['Classroom', 'Virtual', 'Self-paced'],
        'Recurrence' :
            ['daily', 'weekly', 'monthly', 'yearly'],
        'EventRole' :
            ['Student', 'Shikshaka', 'Samyojaka', 'Prabandhaka', 'Adhyaksha'],
        'Days' :
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    }

    def get(self, field=None):
        
        if field:
            if field in self._presets:
                return self._presets[field]
            elif field == 'Project_type':
                return project_types().get()
            elif field == 'Praanta_type':
                return region_types().get()
            elif field == 'Activity_type':
                return activity_types().get()
            elif field == 'Role':
                return role_types().get()
            elif field == 'Country':
                return countries().get()
            else:
                return []
        else:
            return sorted(self._presets.keys() + \
                ['Project_type', 'Praanta_type', 'Activity_type', \
                    'Role', 'Country'])
