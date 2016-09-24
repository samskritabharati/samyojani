from flask_restful import fields, marshal, marshal_with, reqparse, Resource
import pymongo
from ..db import *
from types import Presets
from pprint import pprint

def _email(email_str):
    """Return email_str if valid, raise an exception in other case."""
    if valid_email(email_str):
        return email_str
    else:
        raise ValueError('{} is not a valid email'.format(email_str))

_address_fields = {}
#_address_fields['Line1'] = fields.String(attribute='Address_line1')
#_address_fields['Line2'] = fields.String(attribute='Address_line2')
_address_fields['Address_line1'] = fields.String
_address_fields['Address_line2'] = fields.String
_address_fields['City'] = fields.String
_address_fields['Locality'] = fields.String
_address_fields['District'] = fields.String
_address_fields['State'] = fields.String
#_address_fields['Pincode'] = fields.String(attribute='Postal_code')
_address_fields['Postal_code'] = fields.String
_address_fields['Country'] = fields.String

class _Praanta_name(fields.Raw):
    def format(self, praanta_id):
        #print "Praanta = " + str(praanta_id)
        if praanta_id == '':
            return 'Unknown'
        p = sbget().sbregions()[praanta_id]
        #print p
        return p['path'] if p and 'path' in p else 'Unknown'

class _Subregions(fields.Raw):
    def format(self, subregions):
        subr = dict((name, _Region_url().format(id)) for name, id in subregions.items())
        return subr

class _Rsrc_url(fields.Raw):
    cname = None
    def format(self, id):
        return '/{}/{}'.format(self.cname, id) if id else ''
    def id(self, url):
        match = re.search('/([^/]*)$'.format(self.cname), url)
        return match.group(1) if match else None

class _User_url(_Rsrc_url):
    cname = 'users'
class _Course_url(_Rsrc_url):
    cname = 'courses'
class _Activity_url(_Rsrc_url):
    cname = 'activities'
class _Project_url(_Rsrc_url):
    cname = 'projects'
class _Region_url(_Rsrc_url):
    cname = 'regions'

attr2external = {
    'Coordinator_id' : { 'Coordinator_url' : _User_url(attribute='Coordinator_id') },
    'Person_id' : { 'Person_url' : _User_url(attribute='Person_id') },
    'Course_id' : { 'Course_url' : _Course_url(attribute='Course_id') },
    'Activity_id' : { 'Activity_url' : _Activity_url(attribute='Activity_id') },
    'Project_id' : { 'Project_url' : _Project_url(attribute='Project_id') },
    'Region_id' : { 'Region_url' : _Region_url(attribute='Region_id') },
    'Parent_region_id' : { 'Parent_region_url' : _Region_url(attribute='Parent_region_id') },
    'subregions' : { 'Subregions' : _Subregions(attribute='subregions') },
    'Address_line1' : { 'Address' : _address_fields },
    'Address_line2' : { 'Address' : _address_fields },
    'City' : { 'Address' : _address_fields },
    'Locality' : { 'Address' : _address_fields },
    'District' : { 'Address' : _address_fields },
    'State' : { 'Address' : _address_fields },
    'Postal_code' : { 'Address' : _address_fields },
    'Country' : { 'Address' : _address_fields },
}

class _SBCollection(Resource):
    schema = {}
    cname = None
    key = None
    helpprefix = ''
    mycollection = None

    def __init__(self):
        self.mycollection = sbget()[self.cname]
        for u in self.mycollection.find():
            if not self.schema:
                self.schema = u
                #self.attrs.pop('_id')
            break
        self.schema_ext = {}

        self.get_parser = reqparse.RequestParser()
        self.exported_fields = {}

        # Externalize the schema field names
        for a in self.schema.keys():
            m = re.search('^(.*?)_id$', a)
            if m:
                repl_a = m.group(1) + '_url'
                v = self.schema[a]
                self.schema_ext[repl_a] = v
            else:
                self.schema_ext[a] = self.schema[a]

        for a in self.schema.keys():
            if a == 'Email':
                self.get_parser.add_argument(a, dest=a,
                    help=self.helpstr() + a)
            else:
                self.get_parser.add_argument(a, dest=a, help=self.helpstr() + a)

            if a in attr2external:
                for k, v in attr2external[a].items():
                    self.exported_fields[k] = v 
            else:
                self.exported_fields[a] = fields.String
        self.exported_fields['_url'] = \
            fields.FormattedString('/' + self.cname + '/{_id}')
        self.get_parser.add_argument('exact', type=int, default=0, 
            help=self.helpstr() + 'exact')
        self.get_parser.add_argument('offset', type=int, default=0, 
            help=self.helpstr() + 'offset')
        self.get_parser.add_argument('limit', type=int, default=25, 
            help=self.helpstr() + 'limit')
        self.get_parser.add_argument('fields', default='', 
            help=self.helpstr() + 'fields')

    def helpstr(self):
        return "{}: Missing required field ".format(self.cname if self.cname else " ")

    def put(self, _id):
        print "Updating {} by {} ".format(self.cname,  _id)
        args = request.json
        for k, v in args.items():
            if (k == '_id') or not v:
                args.pop(k)

        print "Update args ..."
        pprint(args)
        self.sanitize(args)
        print "Sanitized args ..."
        pprint(args)

        self.set_defaults(args)
        if self.mycollection.update(_id, args):
            entry = self.mycollection.get(_id)
            return marshal(entry, self.exported_fields)
        else:
            abort(404)
    
    def delete(self, _id):
        if self.mycollection.delete(_id):
            return {}
        else:
            abort(404)

    def sanitize(self, entry):
        for k in entry:
            if entry[k] in ['null', 'undefined']:
                entry[k] = ''

        #if 'Role' in entry and entry['Role'] == '':
        #    entry['Role'] = 'Student'

        for f in ['Coordinator', 'Project', 'Activity', 'Person', 'Course', \
                'Region', 'Parent_region']:
            if f + '_url' in entry:
                entry[f + '_id'] = _Rsrc_url().id(entry[f + '_url'])
                entry.pop(f + '_url')

        if 'Region_id' in entry and entry['Region_id'] == '':
            entry['Region_id'] = sbget().sbregions().root['_id']

        if 'Parent_region_id' in entry and entry['Parent_region_id'] == '':
            entry['Parent_region_id'] = sbget().sbregions().root['Parent_region_id']

        if 'Address' in entry:
            addr = entry['Address']
            for f in _address_fields:
                entry[f] = addr[f] if f in addr else ''
            entry.pop('Address')

    def post(self):
        print "Inserting into {} ".format(self.cname)

        args = request.json
        print "Post args ..."
        pprint(args)
        self.sanitize(args)

        print "Sanitized args ..."
        pprint(args)

        for k, v in args.items():
            if (k == '_id') or not v:
                args.pop(k)
        self.set_defaults(args)

        _id = None
        if self.key:
            q = dict((k, args[k]) for k in self.key if k in args)
            e = self.mycollection.find_one(q)
            if e:
                _id = e['_id']
                self.mycollection.update(_id, args)
        if not _id:
            _id = self.mycollection.insert(args)

        entry = self.mycollection.get(_id)
        return marshal(entry, self.exported_fields), 201

    def default(self, k):
        if k not in self.schema:
            return None
        val = self.schema[k]['default'] if isinstance(self.schema[k], dict) \
                else self.schema[k]
        #if val != '':
        #   print "Default for {} is {}".format(k, val)

    def set_defaults(self, entry):
        if 'Postal_code' in entry and 'Region_id' not in entry and \
            'Region_id' in self.schema:
            entry['Region_id'] = sbget().sbregions().from_address(entry)
        missing_keys = []
        for k, v in self.schema.items():
            if k not in entry:
                missing_keys.append(k)
                entry[k] = self.default(k)

    def mymarshal(self, output, fields = None):
        # Remove fields not present in out_entry
        #pprint(output)

        inlist = output if isinstance(output, list) else [output]

        for e in inlist:
            self.set_defaults(e)

        try:
            r = marshal(output, self.exported_fields)
            if isinstance(r, list):
                for row in r:
                    for k, v in row.items():
                        if fields and (k not in fields or not v):
                            row.pop(k)
            else:
                    for k, v in r.items():
                        if fields and (k not in fields or not v):
                            r.pop(k)
            return r
        except Exception as e:
            print "Error in mymarshal: ", e
            return {}

    def get(self, _id=None):
        if 'schema' in request.url_rule.rule:
            print "Schema returned", self.schema_ext
            return self.schema_ext

        if _id:
            print "Retrieving {} by {} ".format(self.cname,  _id)
            entry = self.mycollection.get(_id)
            if entry:
                return self.mymarshal(entry)
            else:
                abort(404)
        else:
            print "Listing " + self.cname
            args = request.args.copy()
            self.sanitize(args)
            exact = False
            if 'exact' in args:
                exact = True if int(args['exact']) > 0 else False
                args.pop('exact')
            offset = args['offset'] if 'offset' in args else 0
            if 'offset' in args:
                args.pop('offset')
            limit = args['limit'] if 'limit' in args else 0
            if 'limit' in args:
                args.pop('limit')
            fields = None
            if 'fields' in args and args['fields'] != '':
                fields = args['fields'].split(',')
                pprint(fields)
                args.pop('fields')

            query = {}
            for k, v in args.items():
                if k == 'Region_id' or not v:
                    args.pop(k)
                    continue
                if exact:
                    query[k] = { '$regex' : '^{}$'.format(v), '$options' : 'i' }
                else:
                    query[k] = { '$regex' : v, '$options' : 'i' }
            pprint(query)
            elist = [e for e in self.mycollection.find(query) \
                .sort('_id', pymongo.ASCENDING).skip(offset).limit(limit)]
            return self.mymarshal(elist, fields)

class Users(_SBCollection):
    def __init__(self):
        self.cname = 'users'
        self.key = ['Email']
        self.helpprefix = 'The user\'s '
        self.schema = {
            'Email': '',
            'Name': '',
            'Signup_date': '',
            'Phone': '',
            'Region_id': { 'ref' : 'regions', 'default' : '' },
            'Profession': { 'options' : Presets().get('Profession'), 'default' : '' },
            'Interests': { 'options' : Presets().get('Interests'), 'default' : 'Student' },
            'Facebook_id': '',
            'Role': { 'ref' : 'roles', 'default' : 'Student' },
            'URL': '' }
        for f in _address_fields.keys():
            self.schema[f] = ''
        _SBCollection.__init__(self)

class Activities(_SBCollection):
    def __init__(self):
        self.cname = 'activities'
        self.helpprefix = 'The activity\'s '
        self.schema = {
            'Activity_type': { 'ref' : 'activity_types', 'default' : 'varga' },
            'Coordinator_id': { 'ref' : 'users', 'default' : '' },
            'Project_id': { 'ref' : 'projects', 'default' : '' },
            'Name': '',
            'Days' : '',
            'Email': '',
            'Phone': '',
            'Start_date': '',
            'End_date': '',
            'Start_time': '',
            'End_time': '',
            'Recurrence': { 'options' : Presets().get('Recurrence'), 'default' : 'daily' },
            'URL': '' }
        for f in _address_fields.keys():
            self.schema[f] = ''
        _SBCollection.__init__(self)

class Courses(_SBCollection):
    def __init__(self):
        self.cname = 'courses'
        self.helpprefix = 'The course \'s '
        self.schema = {
            'Name': '',
            'Description': '',
            'Duration' : { 'options' : range(1, 30), 'default' : 1 },
            'Units': { 'options' : ['hours', 'days', 'weeks', 'months', 'years'], 'default' : 'days' },
            'Type' : { 'options' : Presets().get('CourseType'), 'default' : 'Classroom' },
            'URL': '' }
        _SBCollection.__init__(self)

class Projects(_SBCollection):
    def __init__(self):
        self.cname = 'projects'
        self.key = ['Name']
        self.helpprefix = 'The project\'s '
        self.schema = {
            'Project_type': { 'ref' : 'project_types', 'default' : 'shibiram' },
            'Coordinator_id': { 'ref' : 'users', 'default' : '' },
            'Name': '',
            'Description' : '',
            'Start_date': '',
            'End_date': '',
            'Phone': '',
            'Email': '',
            'URL': '' }
        for f in _address_fields.keys():
            self.schema[f] = ''
        _SBCollection.__init__(self)

class Roles(_SBCollection):
    def __init__(self):
        self.cname = 'roles'
        self.helpprefix = 'The Karyakarta assignment\'s '
        self.schema = {
            'Last_active_date': '',
            'Activity_id': { 'ref' : 'activities', 'default' : '' },
            'Person_id': { 'ref' : 'users', 'default' : '' },
            'EventRole': { 'options' : Presets().get('EventRole'), 'default' : 'Student' },
            'Status': { 'options' : ['Tentative', 'Confirmed'], 'default' : 'Tentative' },
            }
        _SBCollection.__init__(self)

class WishList(_SBCollection):
    def __init__(self):
        self.cname = 'wishlist'
        self.helpprefix = 'The wish list\'s '
        self.schema = {
            'Last_active_date': '',
            'Course_id': { 'ref' : 'courses', 'default' : '' },
            'Person_id': { 'ref' : 'users', 'default' : '' },
            }
        _SBCollection.__init__(self)

class Regions(_SBCollection):
    def __init__(self):
        self.cname = 'regions'
        self.helpprefix = 'The SB region\'s '
        self.schema = {
            'Coordinator_id': { 'ref' : 'users', 'default' : '' },
            'Description': '',
            'Parent_region_id': { 'ref' : 'regions', 'default' : '' },
            'Praanta_type': { 'ref' : 'praanta_types', 'default' : '' },
            'path': '',
            'subregions': { 'ref' : 'regions', 'default' : {} },
            'URL' : '',
            'Name' : '',
            }
        for f in _address_fields.keys():
            self.schema[f] = ''
        _SBCollection.__init__(self)

class Locations(_SBCollection):
    def __init__(self):
        self.cname = 'locations'
        self.helpprefix = 'The Geo location\'s '
        self.schema = {
            'Region_id': { 'ref' : 'regions', 'default' : '' },
            }
        for f in _address_fields.keys():
            self.schema[f] = ''
        _SBCollection.__init__(self)

    def post(self):
        abort(403)

    def put(self):
        abort(403)
