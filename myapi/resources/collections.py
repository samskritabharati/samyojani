from flask_restful import fields, marshal, marshal_with, reqparse, Resource
from db import *

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

#_exposed_fields = {
##    'id': fields.String(attribute='_id'),
#    'Uri' : fields.Url('users', absolute=True),
#    "Coordinator_id" : fields.FormattedString('/users/{Coordinator_id}'),
#    "Person_id" : fields.FormattedString('/users/{Person_id}'),
#    "Activity_id" : fields.FormattedString('/activities/{Activity_id}'),
#    "Project_id" : fields.FormattedString('/projects/{Project_id}'),
#    'Name': fields.String,
#    'Email': fields.String,
#    'Phone': fields.String,
#    'Profession' : fields.String,
#    'SB_Region' : _Praanta_name(attribute='Praanta_id'),
#    "SB_Parent_Region" : _Praanta_name(attribute='Parent_praanta_id'),
#    'Role' : Role_field,
##    'custom_greeting': fields.FormattedString('Namaste {username}!'),
##    'date_created': fields.DateTime,
##    'date_updated': fields.DateTime,
#    'Address' : _address_fields
#}

attr2external = {
    'Coordinator_id' : { 'Coordinator_url' : fields.FormattedString('/users/{Coordinator_id}') },
    'Person_id' : { 'Person_url' : fields.FormattedString('/users/{Person_id}') },
    'Activity_id' : { 'Activity_url' : fields.FormattedString('/activities/{Activity_id}') },
    'Project_id' : { 'Project_url' : fields.FormattedString('/projects/{Project_id}') },
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
                self.get_parser.add_argument(a, dest=a, type=_email, 
                    help=self.helpstr() + a)
                self.put_parser.add_argument(a, dest=a, type=_email, 
                    location = 'json', help=self.helpstr() + a)
                self.post_parser.add_argument(a, dest=a, type=_email,
                    required=True, default='', location = 'json', 
                    help=self.helpstr() + a)
            else:
                self.get_parser.add_argument(a, dest=a, help=self.helpstr() + a)
                self.put_parser.add_argument(a, dest=a, 
                    location='json', help=self.helpstr() + a)
                self.post_parser.add_argument(a, dest=a, required=True, 
                    location='json', default='', help=self.helpstr() + a)

            if a in attr2external:
                for k, v in attr2external[a].items():
                    self.exported_fields[k] = v 
            elif a == '_id':
                self.exported_fields['Url'] = fields.FormattedString('/{}/{_id}'.format(cname))
            else:
                self.exported_fields[a] = fields.String

    def helpstr(self):
        return self.cname + " object\'s " if self.cname else " "

    def put(self, _id):
        args = self.put_parser.parse_args()
        return sbget()[self.cname].update(_id, args)
    
    def delete(self, _id):
        return sbget()[self.cname].delete(_id)

    def post(self):
        args = self.post_parser.parse_args()
        _id = sbget()[self.cname].insert(args)
        entry = sbget()[self.cname].get(_id)
        return marshal(entry, self.exported_fields)

    def get(self, _id=None):
        if _id:
            print "Retrieving {} by {} ".format(self.cname,  _id)
            entry = sbget()[self.cname].get(_id)
            return marshal(entry, self.exported_fields)
        else:
            print "Listing " + self.cname
            args = self.get_parser.parse_args()
            query = {}
            for k, v in args.items():
                if not v:
                    args.pop(k)
                    continue
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
        self.cname = 'assignments'
        self.helpprefix = 'The Karyakarta assignment\'s '
        _SBCollection.__init__(self)

class Regions(_SBCollection):
    def __init__(self):
        self.cname = 'regions'
        self.helpprefix = 'The SB region\'s '
        _SBCollection.__init__(self)
