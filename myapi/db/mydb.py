from pymongo import MongoClient
from pymongo.database import Database
#from config import *
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
        if not self.local:
            self.slurp()
        return self.local

    def count(self):
        return self.collection.count()

    def toJSON(self):
        return { self.name : self.slurp() }

    def fromJSON(self, data):
        try:
            self.collection.insert_many(data)
        except Exception as e:
            print "Error inserting into " + self.name + ": ", e
        if self.cache:
            self.slurp()

    def __repr__(self):
        return json.dumps(self.toJSON())

    def oid(self, item_id):
        try:
            return {'_id' : ObjectId(item_id)}
        except Exception as e:
            print "Error: invalid object id ", e
            return None

    def get(self, item_id):
        res = None
        if self.cache and (item_id in self.local):
                res = self.local[item_id]
        if not res:
            query = self.oid(item_id)
            if not query:
                return None
            res = self.collection.find_one(query)
            if res:
                res['_id'] = str(res['_id'])
                if self.cache:
                    self.local[res['_id']] = res
        return res

    def find_one(self, query):
        res = self.collection.find_one(query)
        if res:
            res['_id'] = str(res['_id'])
        return res

    def insert(self, item):
        try:
            result = self.collection.insert_one(item)
        except Exception as e:
            print "Error inserting into " + self.name + ": ", e
            return None
        newid = str(result.inserted_id)
        if self.cache:
            self.get(newid)
        return newid

    def update(self, item_id, fields):
        query = self.oid(item_id)
        if not query:
            return False
        result = self.collection.update(query, {"$set" : fields})
        isSuccess = (result['n'] > 0)
        if isSuccess and self.cache:
            self.get(item_id)
        return isSuccess

    def delete(self, item_id):
        query = self.oid(item_id)
        if not query:
            return False
        res = self.collection.delete_one(query)
        if res:
            if (res.deleted_count > 0) and self.cache:
                self.local.pop(item_id)
            return res.deleted_count > 0
        else:
            return False

    def reset(self):
        if self.cache:
            self.local = {}
        return self.collection.drop()

    def find(self, query = {}, fields = []):
        if len(fields) > 0:
            f = dict((k, 1) for k in fields)
            pprint(f)
            return self.collection.find(query, f)
        else:
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

    def __getattr__(self, name):
        if name not in self.c:
            self.add(name)
        return self.c[name]

    def __getitem__(self, name):
        if name not in self.c:
            self.add(name)
        return self.c[name]

    def add(self, cname, cache=False):
        collection = MyCollection(cname, self, cache)
        self.c[collection.name] = collection

    def list(self):
        return self.c.keys()

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
