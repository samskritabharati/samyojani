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

api.add_resource(Users, '/users', '/users/<_id>')
api.add_resource(Activities, '/activities', '/activities/<_id>')
api.add_resource(Regions, '/regions', '/regions/<_id>')
api.add_resource(Projects, '/projects', '/projects/<_id>')
api.add_resource(Roles, '/roles', '/roles/<_id>')

app.register_blueprint(ui_bp, url_prefix='/ui')

(cmddir, cmdname) = os.path.split(argv[0])
setmypath(os.path.abspath(cmddir))
print "My path is " + mypath()

def usage():
    print cmdname + " [-r] [-R] [-d] [-o <workdir>] [-l <local_wloads_dir>] <repodir1>[:<reponame>] ..."
    exit(1)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

def main(argv):
    try:
        opts, args = getopt.getopt(argv, "do:l:p:rRh", ["workdir="])
    except getopt.GetoptError:
        usage()

    reset = False
    dbreset = False
    dbgFlag = False
    myport = PORTNUM
    localdir = None
    wdir = workdir()
    for opt, arg in opts:
        if opt == '-h':
            usage()
        elif opt in ("-o", "--workdir"):
	        wdir=arg
        elif opt in ("-l", "--localdir"):
            localdir = arg
        elif opt in ("-p", "--port"):
            myport = int(arg)
        elif opt in ("-r", "--reset"):
            reset = True
        elif opt in ("-R", "--dbreset"):
            dbreset = True
        elif opt in ("-d", "--debug"):
            dbgFlag = True
    setworkdir(wdir,myport)
    print cmdname + ": Using " + workdir() + " as working directory."
    
    initworkdir(reset)

    sbinit(dbreset)
    mgmtdb = sbget()
    print("Imported %d users,  %d events" % (mgmtdb.users.count(), mgmtdb.activities.count()));

    for a in args:
        components = a.split(':')
        if len(components) > 1:
            print "Importing " + components[0] + " as " + components[1]
            addrepo(components[0], components[1])
        else: 
            print "Importing " + components[0]
            addrepo(components[0], "")

    if localdir:
        setwlocaldir(localdir)
    if not path.exists(wlocaldir()):
        setwlocaldir(DATADIR_SBMGMT)
    os.chdir(workdir())

    print "Available on the following URLs:"
    for line in mycheck_output(["/sbin/ifconfig"]).split("\n"):
        m = re.match('\s*inet addr:(.*?) .*', line)
        if m:
            print "    http://" + m.group(1) + ":" + str(myport) + "/"
    app.run(
      host ="0.0.0.0",
      port = myport,
      debug = dbgFlag,
      use_reloader=False
     )

if __name__ == "__main__":
   main(sys.argv[1:])
