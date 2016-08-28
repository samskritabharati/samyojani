from sys import argv
import sys, getopt
from flask import Flask, Blueprint
from flask_restful import Api
from resources.types import *
from resources.collections import *
#from resources.activities import Shibiras, Vargas
#from resources.projects import projects
#from resources.regions import regions
from ui import ui_bp

app = Flask(__name__)
api = Api(app)

api.add_resource(region_types, '/types/region')
api.add_resource(project_types, '/types/project')
api.add_resource(role_types, '/types/role')
api.add_resource(activity_types, '/types/activity')
api.add_resource(Presets, '/presets', '/presets/<field>')

api.add_resource(Users, '/users/schema', '/users', '/users/<_id>')
api.add_resource(Activities, '/activities/schema', '/activities', '/activities/<_id>')
api.add_resource(Regions, '/regions/schema', '/regions', '/regions/<_id>')
api.add_resource(Projects, '/projects/schema', '/projects', '/projects/<_id>')
api.add_resource(Roles, '/users/schema', '/roles', '/roles/<_id>')

app.register_blueprint(ui_bp, url_prefix='/ui')

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/')
def index():
	return redirect('/www')
#    mgmtdb = sbget()
#    coll = mgmtdb.list()
#    print coll
#    return make_response(jsonify({'collections' : coll}))

(cmddir, cmdname) = os.path.split(__file__)
setmypath(os.path.abspath(cmddir))
print "My path is " + mypath()

parms = DotDict({
    'reset' : False,
    'dbreset' : False,
    'dbgFlag' : False,
    'myport' : PORTNUM,
    'localdir' : None,
    'wdir' : workdir(),
    })

def setup_app(parms):
    setworkdir(parms.wdir, parms.myport)
    print cmdname + ": Using " + workdir() + " as working directory."
    
    initworkdir(parms.reset)

    sbinit(parms.dbreset)
    mgmtdb = sbget()
    print("Imported %d users,  %d events" % (mgmtdb.users.count(), mgmtdb.activities.count()));

    if parms.localdir:
        setwlocaldir(parms.localdir)
    if not path.exists(wlocaldir()):
        setwlocaldir(DATADIR_SBMGMT)
    os.chdir(workdir())

def usage():
    print cmdname + " [-r] [-R] [-d] [-o <workdir>] [-l <local_wloads_dir>] <repodir1>[:<reponame>] ..."
    exit(1)

def main(argv):
    try:
        opts, args = getopt.getopt(argv, "do:l:p:rRh", ["workdir="])
    except getopt.GetoptError:
        usage()

    global parms
    for opt, arg in opts:
        if opt == '-h':
            usage()
        elif opt in ("-o", "--workdir"):
	        parms.wdir=arg
        elif opt in ("-l", "--localdir"):
            parms.localdir = arg
        elif opt in ("-p", "--port"):
            parms.myport = int(arg)
        elif opt in ("-r", "--reset"):
            parms.reset = True
        elif opt in ("-R", "--dbreset"):
            parms.dbreset = True
        elif opt in ("-d", "--debug"):
            parms.dbgFlag = True

    setup_app(parms)

    for a in args:
        components = a.split(':')
        if len(components) > 1:
            print "Importing " + components[0] + " as " + components[1]
            addrepo(components[0], components[1])
        else: 
            print "Importing " + components[0]
            addrepo(components[0], "")

    print "Available on the following URLs:"
    for line in mycheck_output(["/sbin/ifconfig"]).split("\n"):
        m = re.match('\s*inet addr:(.*?) .*', line)
        if m:
            print "    http://" + m.group(1) + ":" + str(myport) + "/"
    app.run(
      host ="0.0.0.0",
      port = myport,
      debug = parms.dbgFlag,
      use_reloader=False
     )

if __name__ == "__main__":
   main(sys.argv[1:])
else:
    setup_app(parms)
