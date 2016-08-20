from flask_restful import fields, marshal, marshal_with, reqparse, Resource
from ..db import *
from pprint import pprint

def _email(email_str):
    """Return email_str if valid, raise an exception in other case."""
    if valid_email(email_str):
        return email_str
    else:
        raise ValueError('{} is not a valid email'.format(email_str))

_address_fields = {}
_address_fields['Line 1'] = fields.String(attribute='Address_line1')
_address_fields['Line 2'] = fields.String(attribute='Address_line2')
_address_fields['City'] = fields.String
_address_fields['Locality'] = fields.String
_address_fields['District'] = fields.String
_address_fields['State'] = fields.String
_address_fields['Pincode'] = fields.String(attribute='Postal_code')
_address_fields['Country'] = fields.String

class _Praanta_name(fields.Raw):
    def format(self, praanta_id):
        #print "Praanta = " + str(praanta_id)
        p = sbget().sbregions()[praanta_id]
        #print p
        return p['path'] if p and 'path' in p else 'Unknown'

class _Rsrc_url(fields.Raw):
    cname = None
    def format(self, id):
        return '/{}/{}'.format(self.cname, id) if id else ''

class _User_url(_Rsrc_url):
    cname = 'users'
class _Activity_url(_Rsrc_url):
    cname = 'activities'
class _Project_url(_Rsrc_url):
    cname = 'projects'

attr2external = {
    'Coordinator_id' : { 'Coordinator_url' : _User_url(attribute='Coordinator_id') },
    'Person_id' : { 'Person_url' : _User_url(attribute='Person_id') },
    'Activity_id' : { 'Activity_url' : _Activity_url(attribute='Activity_id') },
    'Project_id' : { 'Project_url' : _Project_url(attribute='Project_id') },
    'Praanta_id' : { 'SB_Region' : _Praanta_name(attribute='Praanta_id') },
    'Parent_praanta_id' : { 'SB_Parent_Region' : _Praanta_name(attribute='Parent_praanta_id') },
    'Role_id' : { 'Role' : fields.FormattedString('{Role_id}') },
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
    attrs = []
    cname = None
    helpprefix = ''

    def __init__(self):
        for u in sbget()[self.cname].find():
            self.attrs = u
            self.attrs.pop('_id')
            break

        self.get_parser = reqparse.RequestParser()
        self.put_parser = reqparse.RequestParser()
        self.post_parser = reqparse.RequestParser()
        self.exported_fields = {}
        for a in self.attrs.keys():
            if a == 'Email':
                self.get_parser.add_argument(a, dest=a,
                    help=self.helpstr() + a)
                self.put_parser.add_argument(a, dest=a,
                    help=self.helpstr() + a)
                self.post_parser.add_argument(a, dest=a,
                    default='', help=self.helpstr() + a)
            else:
                self.get_parser.add_argument(a, dest=a, help=self.helpstr() + a)
                self.put_parser.add_argument(a, dest=a, 
                    help=self.helpstr() + a)
                self.post_parser.add_argument(a, dest=a, 
                    default='', help=self.helpstr() + a)

            if a in attr2external:
                for k, v in attr2external[a].items():
                    self.exported_fields[k] = v 
            else:
                self.exported_fields[a] = fields.String
        self.exported_fields['_url'] = \
            fields.FormattedString('/' + self.cname + '/{_id}')
        self.get_parser.add_argument('exact', type=int, default=0, 
            help=self.helpstr() + a)

    def helpstr(self):
        return "{}: Missing required field ".format(self.cname if self.cname else " ")

    def put(self, _id):
        print "Updating {} by {} ".format(self.cname,  _id)
        args = self.put_parser.parse_args()
        for k, v in args.items():
            if not v:
                args.pop(k)
        pprint(args)
        if sbget()[self.cname].update(_id, args):
            entry = sbget()[self.cname].get(_id)
            return marshal(entry, self.exported_fields)
        else:
            abort(404)
    
    def delete(self, _id):
        if sbget()[self.cname].delete(_id):
            return {}
        else:
            abort(404)

    def sanitize(self, entry):
        if 'Praanta_id' in entry and entry['Praanta_id'] == '':
            entry['Praanta_id'] = sbget().sbregions().root['_id']
        if 'Parent_praanta_id' in entry and entry['Parent_praanta_id'] == '':
            entry['Parent_praanta_id'] = sbget().sbregions().root['Parent_praanta_id']
        if 'Role_id' in entry and entry['Role_id'] == '':
            entry['Role_id'] = 'Student'

    def post(self):
        print "Inserting into {} ".format(self.cname)
        args = self.post_parser.parse_args()
        self.sanitize(args)
        _id = sbget()[self.cname].insert(args)
        entry = sbget()[self.cname].get(_id)
        return marshal(entry, self.exported_fields), 201

    def get(self, _id=None):
        if _id:
            print "Retrieving {} by {} ".format(self.cname,  _id)
            entry = sbget()[self.cname].get(_id)
            if entry:
                return marshal(entry, self.exported_fields)
            else:
                abort(404)
        else:
            print "Listing " + self.cname
            args = self.get_parser.parse_args()
            exact = False
            if 'exact' in args:
                exact = True if args['exact'] == 1 else False
            args.pop('exact')
            query = {}
            for k, v in args.items():
                if not v:
                    args.pop(k)
                    continue
                if exact:
                    query[k] = { '$regex' : '^{}$'.format(v), '$options' : 'i' }
                else:
                    query[k] = { '$regex' : v, '$options' : 'i' }
            elist = [e for e in sbget()[self.cname].find(query)]

            return marshal(elist, self.exported_fields)

class Users(_SBCollection):
    def __init__(self):
        self.cname = 'users'
        self.helpprefix = 'The user\'s '
        _SBCollection.__init__(self)

class Activities(_SBCollection):
    def __init__(self):
        self.cname = 'activities'
        self.helpprefix = 'The activity\'s '
        _SBCollection.__init__(self)

class Projects(_SBCollection):
    def __init__(self):
        self.cname = 'projects'
        self.helpprefix = 'The project\'s '
        _SBCollection.__init__(self)

class Roles(_SBCollection):
    def __init__(self):
        self.cname = 'roles'
        self.helpprefix = 'The Karyakarta assignment\'s '
        _SBCollection.__init__(self)

class Regions(_SBCollection):
    def __init__(self):
        self.cname = 'regions'
        self.helpprefix = 'The SB region\'s '
        _SBCollection.__init__(self)
