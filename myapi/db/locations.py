from ..config import *
import re

class Locations:
    code2addr = {}
    countries = {}
    table = { 'name' : "Location" }
    addrfields = ['Country', 'Postal_code', 'State', 'District', 'City', 
        'Locality']
    contents = []
    mydb = None
    mycollection = None

    def __init__(self, mydb):
        self.mydb = mydb
        mydb.add('locations')
        self.mycollection = mydb['locations']

    def importIndia(self, fname):
        print "Creating India address database ..."
        with open(fname) as f:
            gothdr = False
            cols = []
            #Assumes the All-India Pincodes CSV file provided by 
            #https://data.gov.in/resources/all-india-pincode-directory/download
            idx = {}
            for line in f.readlines():
                line = line.rstrip('\n')
                if not gothdr:
                    gothdr = True
                    f = line.lstrip('#').split(',')
                    idx = dict(zip(f, range(len(f))))
                    self.table['fields'] = self.addrfields

                    cols = [idx[f] for f in ['pincode', 'statename',
                        'Districtname', 'Taluk', 'officename']]
                    self.table['values'] = []
                    continue
                m = re.match('^(.*?),(\d\d\d\d\d\d),(.*)$', line)
                if m:
                    f1, pin, rest = [m.group(1), m.group(2), m.group(3)]
                    f1 = f1.replace(',', '')
                    line = ",".join([f1, pin, rest])
                values = line.split(',')
                values[0] = re.sub(r' [A-Z]\.O', '', values[0])
                if not values[idx['pincode']].isdigit():
                    print ", ".join(values)
                if values[idx['statename']] in ['NULL', 'NA']:
                    values[idx['statename']] = values[idx['circlename']]
                if values[idx['Districtname']] in ['NULL', 'NA']:
                    values[idx['Districtname']] = values[idx['regionname']]
                if values[idx['Taluk']] in ['NULL', 'NA']:
                    values[idx['Taluk']] = values[idx['divisionname']]
                self.table['values'].append(['India'] + \
                    [values[i] if values[i].isdigit() else values[i].title() \
                        for i in cols])
            self.contents.extend(table2json(self.table))
        print "Creating location index ..."
        self.createIndex()

    def createIndex(self):
        self.countries = {}
        for r in self.contents:
            # Update the pincode index
            if r['Country'] not in self.code2addr:
                self.code2addr[r['Country']] = {}
            self.code2addr[r['Country']][r['Postal_code']] = r

            l = self.countries
            for f in ['Country', 'State', 'District', 'City']:
                v = r[f]
                if v not in l:
                    l[v] = {}
                l = l[v]
            l[r['Locality']] = r['Postal_code']
        #with open(join(workdir(), "location_pincodes.json"), "w") as f:
        #    f.write(json.dumps(self.countries, indent=4))
        #print json.dumps(self.code2addr['India'], indent=4)

    def save(self):
        print "Saving " + self.table['name'] + " database into Mongo ..."
        self.mycollection.fromJSON(self.contents)

    def load(self):
        self.mycollection.slurp()
        self.contents = self.mycollection.all()
        self.createIndex()

    def address(self, pincode, country='India'):
        pincode = str(pincode)
        if pincode in self.code2addr[country]:
            return self.code2addr[country][pincode]
        return None

    def match(self, addr):
        #fields = locations.addrfields + ['Address_line1', 'Address_line2']
        #addrstr = ", ".join(address[f] for f in fields]
        l = self.countries
        match_fields = []
        for f in ['Country', 'State', 'District', 'City', 'Locality']:
            if f not in addr:
                continue
            v = addr[f]
            if v in l:
                l = l[v]
                match_fields.append(f)
            else:
                break
        return { 'match_fields' : match_fields, 'value' : l }
