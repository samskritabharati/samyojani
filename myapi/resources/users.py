from flask_restful import fields, marshal, marshal_with, reqparse, Resource
from db import *

def email(email_str):
    """Return email_str if valid, raise an exception in other case."""
    if valid_email(email_str):
        return email_str
    else:
        raise ValueError('{} is not a valid email'.format(email_str))

post_parser = reqparse.RequestParser()
post_parser.add_argument(
    'Name', dest='Name',
    location='form', required=True,
    help='The user\'s full name',
)
post_parser.add_argument(
    'Email', dest='Email',
    type=email, location='form',
    required=True, help='The user\'s email',
)
post_parser.add_argument(
    'Phone', dest='Phone',
    location='form',
    required=True, help='The user\'s phone number',
)
post_parser.add_argument(
    'Postal_code', dest='Postal_code',
    type=int, location='form',
    required=True, help='The user\'s postal code',
)
post_parser.add_argument(
    'Country', dest='Country',
    type=int, location='form',
    required=True, help='The user\'s Country',
)
post_parser.add_argument(
    'Address_line1', dest='Address_line1',
    location='form',
    required=True, help='The user\'s Street address line 1',
)
post_parser.add_argument(
    'Address_line2', dest='Address_line2',
    location='form',
    default='', help='The user\'s Street address line 2',
)

get_parser = reqparse.RequestParser()
get_parser.add_argument(
    'Name', dest='Name',
    location='form', 
    help='The user\'s full name',
)
get_parser.add_argument(
    'Email', dest='Email',
    type=email, location='form',
    help='The user\'s email',
)
get_parser.add_argument(
    'Phone', dest='Phone',
    location='form',
    help='The user\'s phone number',
)
get_parser.add_argument(
    'Postal_code', dest='Postal_code',
    type=int, location='form',
    help='The user\'s postal code',
)
get_parser.add_argument(
    'Country', dest='Country',
    location='form',
    help='The user\'s Country',
)
get_parser.add_argument(
    'Address_line1', dest='Address_line1',
    location='form',
    help='The user\'s Street address line 1',
)
get_parser.add_argument(
    'Address_line2', dest='Address_line2',
    location='form',
    default='', help='The user\'s Street address line 2',
)

address_fields = {}
address_fields['Line 1'] = fields.String(attribute='Address_line1')
address_fields['Line 2'] = fields.String(attribute='Address_line2')
address_fields['City'] = fields.String
address_fields['Locality'] = fields.String
address_fields['District'] = fields.String
address_fields['State'] = fields.String
address_fields['Pincode'] = fields.String(attribute='Postal_code')
address_fields['Country'] = fields.String

Role_field = fields.FormattedString('{Role_id}')

class Praanta_name(fields.Raw):
    def format(self, praanta_id):
        #print "Praanta = " + str(praanta_id)
        p = sbget().sbregions()[praanta_id]
        #print p
        return p['path'] if p and 'path' in p else 'Unknown'

user_fields = {
#    'id': fields.String(attribute='_id'),
    'Uri' : fields.Url('users'),
    'Name': fields.String,
    'Email': fields.String,
    'Phone': fields.String,
    'Profession' : fields.String,
    'SB_Region' : Praanta_name(attribute='Praanta_id'),
    'Role' : Role_field,
#    'custom_greeting': fields.FormattedString('Namaste {username}!'),
#    'date_created': fields.DateTime,
#    'date_updated': fields.DateTime,
    'Address' : address_fields
}

class Users(Resource):

    @marshal_with(user_fields)
    def post(self):
        args = post_parser.parse_args()
        user = sbget().users.update({'Email' : args.email}, args)
        return user

    @marshal_with(user_fields)
    def get(self, id=None):
        if id:
            print "Retrieving user by " + id
            args = get_parser.parse_args()
            user = sbget().users.get(id)
            return user
        else:
            print "Listing users"
            u = sbget().users.all().values()
            #pprint(u)
            #o = u[u.keys()[0]]
            #pprint(json.dumps(o))
            #out = marshal(o, user_fields)
            #pprint(json.dumps(out))
            return u
