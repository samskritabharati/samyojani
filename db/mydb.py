from pymongo import MongoClient
from pymongo.database import Database
from config import *
from pprint import pprint

from bson.objectid import ObjectId
import json
from operator import itemgetter, attrgetter, methodcaller

class MyCollection:
    def __init__(self, name, mydb, cache=False):
        self.name = name
        self.mydb = mydb
        self.collection = mydb.db[self.name]
        self.cache = cache
        self.local = None
        if cache:
            self.slurp()

    def slurp(self):
        self.local = {}
        for o in self.collection.find():
            o['_id'] = str(o['_id'])
            self.local[o['_id']] = o

        return self.local

    def all(self):
        return self.local

    def count(self):
        return self.collection.count()

    def toJSON(self):
        return { self.name : self.slurp() }

    def fromJSON(self, data):
        self.collection.drop()
        try:
            self.collection.insert_many(data)
        except Exception as e:
            print "Error inserting into " + self.name + ": ", e
        if self.cache:
            self.slurp()

    def __repr__(self):
        return json.dumps(self.toJSON())

    def get(self, item_id):
        res = self.collection.find_one({'_id' : ObjectId(item_id)})
        res['_id'] = str(res['_id'])
        return res

    def insert(self, item):
        try:
            result = self.collection.insert_one(item)
        except Exception as e:
            print "Error inserting into " + self.name + ": ", e
            return None
        return str(result.inserted_id)

    def update(self, item_id, item):
        #pprint(item)
        result = self.collection.update({'_id' : ObjectId(item_id)}, { "$set": item })
        isSuccess = (result['n'] > 0)
        return isSuccess

    def delete(self, item_id):
        res = self.collection.delete_one({'_id' : ObjectId(item_id)})
        return res.deleted_count > 0

    def reset():
        return self.collection.drop()
    def find(query):
        return self.collection.find(query)

    def __exit__(self, type, value, traceback):
        return True

class MyDB:
    def __init__(self, dbname):
        self.dbname = dbname
        self.db = None
        self.c = {}
        self.initialize()
#        if not database.write_concern.acknowledged:
#            raise ConfigurationError('database must use '
#                                     'acknowledged write_concern')

    def add(self, cname, cache=False):
        collection = MyCollection(cname, self, cache)
        self.c[collection.name] = collection
    def get(self, cname):
        return self.c[cname]

    def initialize(self):
        try:
            self.client = MongoClient()
            self.db = self.client[self.dbname]
            if not isinstance(self.db, Database):
                raise TypeError("database must be an instance of Database")
        except Exception as e:
            print("Error initializing MongoDB database; aborting.", e)
            sys.exit(1)

    def reset(self):
        print "Clearing database", self.dbname
        self.client.drop_database(self.dbname)
        self.initialize()
