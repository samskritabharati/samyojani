import json
import re
from pprint import pprint

class SBRegions:
    cname = 'regions'
    mycollection = None
    root = None
    addr_fields = ['Country', 'State', 'District', 'City', 'Locality']
    idx = {}

    def __init__(self, mydb):
        self.mydb = mydb
        self.mycollection = mydb[self.cname]
        self.load()

    def __getitem__(self, praanta_id):
        return self.mycollection.get(praanta_id)
            
    def region_path(self, r):
        path = [r['Name']]
        p_id = r['Parent_praanta_id']
        while p_id != None and p_id >= 0:
            p = self.mycollection.get(p_id)
            path.append(p['Name'])
            p_id = p['Parent_praanta_id']
        path.reverse()
        return "/".join(path)

    def from_address(self, address, af_ind=0, root = None):
        return self.from_path('World/India')['_id']
        f = addr_fields[af_ind] if af_ind < len(addr_fields) else None
        if not f:
            return None
        val = address[f].title() if f in address else None
        
        r = root
        if not r:
            r = self.root
        if f not in r:
            return r
        options = r[f]
        if len(options) == 0:
            return r
        if val not in options:
            return None
            
        for subr in r['subregions']:
            r = self.from_address(address, af_ind+1, subr)
            if r:
                pass
            

        for id, r in self.mycollection.all().items():
            path = r['path']
            for f in ['Locality', 'City', 'District', 'State', 'Country']:
                if f in address and address[f] != '':
                    fval = address[f].title()
                    match = re.search('^{}$'.format(address[f]), r['Name'], flags=re.IGNORECASE)
                    if match:
                        print 'Found matching region: ' + path
                        return id
        return None 

    def from_path(self, path):
        print "Decoding " + path
        return self.idx[path]
#        rnames = path.split('/')
#        p = self.root
#        print json.dumps(p)
#        for n in rnames[1:]:
#            print "Looking for {} in {}".format(n, p['Name'])
#            pprint(p['subregions'].keys())
#            if 'subregions' in p and n in p['subregions']:
#                p = p['subregions'][n]
#            else:
#                print path + " -> None"
#                return None
#        print path + " -> " + json.dumps(p)
#        return p

    def load(self):
        print "Loading SB regions data ..."
        self.root = None
        self.mycollection.slurp()
        
        for id, r in self.mycollection.all().items():
            parent_id = r['Parent_praanta_id']
            if parent_id is None:
                self.root = r
                #r['Parent_praanta_id'] = None
                continue
            if parent_id not in self.mycollection.local:
                print "Skipping orphan region: ", json.dumps(r)
                continue

            myparent = self.mycollection.local[parent_id]
            if 'subregions' not in myparent:
                myparent['subregions'] = {}
            myparent['subregions'][r['Name']] = id
            #rtype = r['Praanta_type_id']
            #r.pop('Praanta_type_id')
            #r['type'] = praantatypes.get(rtype)['Name']

        for id, r in self.mycollection.all().items():
            r['path'] = self.region_path(r)
            self.mycollection.update(id, {'path' : r['path']})
            self.idx[r['path']] = r

        return self.root

#    def get(path):
#        path.lstrip('/')
#        components = path.split('/')[1:]
#        r = root['subregions']
#        for c in components:
#            if c in r:
#                r[c]
