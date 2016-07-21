from flask import *
from pymongo import MongoClient
import json
from pprint import pprint
import smtplib
from config import *
from indicdocs import *

app = Flask(__name__)
app.secret_key = '123'
client = MongoClient()	
db = client.samvit
import string

(cmddir, cmdname) = os.path.split(argv[0])
setmypath(os.path.abspath(cmddir))
print "My path is " + mypath()

def usage():
    print cmdname + " [-r] [-R] [-d] [-o <workdir>] [-l <local_wloads_dir>] <repodir1>[:<reponame>] ..."
    exit(1)


@app.route('/')
def index():
	return redirect('/login')

@app.route('/landpage')
def landpage():
    return render_template('landpage.html')
@app.route('/login',methods = ['GET', 'POST'])
def login():
    error = None
   
    if request.method == 'POST':
        userinfo = {'username' : request.form.get('email'),'name' : request.form.get('name'),'auth_src' : request.form.get('auth_src')}
        pprint(userinfo)
        auth_src = userinfo['auth_src']
        print "Importing auth_src " + auth_src + " into DB"

        email = request.form.get('email')
        if db.user.find_one({"email": email }):
            session.pop('user',None)	
            for x in db.user.find({"email":email}):
                if x['role'] == "samyojaka":
                    session['user'] = email
                    return make_response(json.dumps({'redirect' : url_for("samhomepage") }))
                elif x['role'] == "admin":
                    session['user'] = email
                    return make_response(json.dumps({'redirect' : url_for("adminhomepage") }))
                elif x['role'] == "student":
                    session['user'] = email
                    return make_response(json.dumps({'redirect' : url_for("homepage") }))
        else:
            print "Importing new user " + email + " into DB"
            db.user.insert({'email' : request.form.get('email'),'name' : request.form.get('name'),'auth_src' : request.form.get('auth_src'),"role":"student", "phonenumber": "none", "address":"none"})
            session['user'] = email
            return make_response(json.dumps({'redirect' : url_for("profileupdate") }))
    else:
        return render_template('home.html')

@app.route('/profileupdate', methods = ['GET','POST'])
def profileupdate():
    if request.method == "POST":
        name = request.form.get('name')
        phonenumber  = request.form.get('phonenumber')
        address = request.form.get('address')
        db.user.update({"email": session['user']}, {"$set":{'name':name, "address":address,"phonenumber":phonenumber}})
        for i in db.user.find({"email":session['user']}):
            if i['role'] == "admin":
                return redirect("adminhomepage")
            elif i['role'] == "samyojaka":
                return redirect("samyojaka")
            else:
                return redirect("homepage")
    for i in db.user.find({"email":session['user']}):
        userinfo = i
    return render_template('profile.html', userinfo = userinfo)
@app.route('/signup', methods = ['GET','POST'])
def signup():
	if request.method == 'POST':
		username = request.form.get('username')
		name = requestk.form.get('name')
		password = request.form.get('password')
		db.user.insert({"name": name, "username": username, "password":password})
		return redirect('/')	
    

@app.route('/homepage', methods = ['GET','POST'])
def homepage():
    info =  []
    userinfo = []
    for i in db.shibira.find():
        info.append(i)
    #for i in db.varga.find():
     #   info.append(i)
    for i in db.user.find({"email":session['user']}):
        userinfo = i
        useraddress = i['address']
    return render_template('homepage.html',userinfo = userinfo ,info = info, useraddress = useraddress)
@app.route('/teacherfinder',methods = ['GET','POST'])
def teacherfinder():
	info =  []
	for i in db.shibira.find():
            info.append(i) 	
	return render_template("google.html", info = info)

@app.route('/sjoined', methods = ['GET','POST'])
def sjoined():
    sjoined = [] 
    for i in db.activity.find({"name":session['user']}):
        for x in db.shibira.find({'s_id':i['shibira_id']}):
            sjoined.append(x)

    return render_template("sjoined.html", sjoined = sjoined)    

@app.route('/join', methods = ['GET','POST'])
def join():
	if request.method == "GET":
		shibira_id = request.args.get('shibira_id')
        if db.activity.find_one({"name":session['user'], "shibira_id":shibira_id}):
            flash('You Have already Enrolled For this shibira')
            return redirect('homepage') 
        else:    
            db.activity.insert({"name": session['user'], "shibira_id": shibira_id})
	return redirect('homepage')

@app.route('/squit', methods = ['GET'])
def squit():
    if request.method == 'GET':
        s_id = request.args.get('shibira_id')
        db.activity.remove({'name':session['user'], 'shibira_id': s_id})
    return redirect("homepage")
    
@app.route('/logout')
def logout():
    session.pop('user', None)
    # flash('you have logged out')
    return render_template('home.html')

@app.route('/samhomepage', methods = ['GET','POST'])
def samhomepage():
    if request.method == "POST":
        teachername = request.form.get('teachername')
        address = request.form.get('address')
        startdate = request.form.get('fromdate')
        enddate = request.form.get('todate')
        starttime = request.form.get('starttime')
        endtime = request.form.get('endtime')
        shibira_id = request.form.get('s_id')
        phonenumber = request.form.get('phonenumber')
        if not db.shibira.find_one({"s_id":shibira_id}):
            db.shibira.insert({"phonenumber":phonenumber, "address":address,"teachername":teachername, "startdate":startdate, "enddate":enddate,"starttime":starttime, "endtime":endtime, 'category': "shibira", "s_id":shibira_id, "samyojaka":session['user'] }) #, 'samyojakaname':session['user']}) 
    list_students = []
    shibirainfo = []   
    index = 00
    for i in db.shibira.find({"samyojaka": session['user']}): # add samyajaka user field in search
        shibirainfo.append(i)
        s_id = i['s_id']
        list_students.append([])
        for x in db.activity.find({"shibira_id":s_id}):
            for y in db.user.find({'username': x['name']}):
                list_students[index].append(y)
        index = index + 1
    for i in db.user.find({"email":session['user']}):
        userinfo = i
    return render_template('samhomepage.html', shibirainfo = shibirainfo, userinfo = userinfo, list_students = list_students)

@app.route('/newvarga', methods = ['GET','POST'])
def newvarga():
    if request.method == "POST":
        teachername = request.form.get('teachername')
        address = request.form.get('address')
        startdate = request.form.get('fromdate')
        enddate = request.form.get('todate')
        starttime = request.form.get('starttime')
        endtime = request.form.get('endtime')
        varga_id = request.form.get('c_id')
        if not db.shibira.find_one({"c_id":varga_id}):
            db.varga.insert({"address":address,"teachername":teachername, "startdate":startdate, "enddate":enddate,"starttime":starttime, "endtime":endtime, 'category': "class", "s_id":shibira_id, "samyojaka":session['user'] }) 
        return render_template('samhomepage.html', shibirainfo = shibirainfo, userinfo = userinfo, list_students = list_students)

@app.route('/sdelete', methods = ['GET','POST'])
def sdelete():
    if request.method == "GET":
        s_id = request.args.get('s_id')
        db.shibira.remove({'s_id': s_id })
    return redirect('samhomepage')

@app.route('/edit', methods = ['GET','POST'])
def edit():
    if request.method == "POST":
        teachername = request.form.get('teachername')
        address = request.form.get('address')
        startdate = request.form.get('fromdate')
        enddate = request.form.get('todate')
        starttime = request.form.get('starttime')
        endtime = request.form.get('endtime')
        shibira_id = request.form.get('s_id')
        #db.shibira.remove({"s_id":shibira_id })
        db.shibira.update({"samyojaka":session['user']},{"$set":{"address":address,"teachername":teachername, "startdate":startdate, "enddate":enddate,"starttime":starttime, "endtime":endtime, 'category': "shibira", "s_id":shibira_id}})
    	return redirect('samhomepage')

@app.route('/removestudent', methods = ['GET', 'POST'])
def removestudent():
    if request.method == "GET":
        studentname = request.args.get('studentname')
        s_id = request.args.get('s_id')
        print studentname
        db.activity.remove({'name': studentname, "shibira_id":s_id})
    
    return redirect('samhomepage') 

@app.route('/proxyreg', methods = ['GET','POST'])
def proxyreg():
    if request.method == "POST":
        email = request.form.get('email')
        name = request.form.get('name')
        content = "hello " + name + """
           You have been registered for a shibira based on your request, by a samyojaka.
           Please click on the link below to register to the official samskrita Bharati App Samvit for more updates
            
            samvit.samskritabharati.in:5000
            
           with regards;
           Team Samvit
        """
        Subj = "Welcome to Samvit " 
        Body = string.join((
        "Subject: %s" % Subj,
        "",
        content,
        ), "\r\n")
        mail = smtplib.SMTP('smtp.gmail.com', 587)
        mail.ehlo()
        mail.starttls()
        mail.login('avadesh444@gmail.com', 'samskritabharati')
        mail.sendmail('avadesh444@gmail.com',email, Body)
        mail.close()
        db.user.insert({"username": email, "name": name, "role": "student"})
        return redirect("samhomepage")

@app.route('/editprofile', methods = ['GET', 'POST'])
def editprofile():
    if request.method == "POST":
        name = request.form.get('name')
        phonenumber  = request.form.get('phonenumber')
        address = request.form.get('address')
        db.user.update({"email": session['user']}, {"$set":{'name':name, "address":address,"phonenumber":phonenumber}})
        for i in db.user.find({"email":session['user']}):
            if i['role'] == "admin":
                return redirect("adminhomepage")
            elif i['role'] == "samyojaka":
                return redirect("samyojaka")
            else:
                return redirect("homepage")






#admin section
@app.route('/adminhomepage')
def adminhomepage():
    userinfo = []
    for user in db.user.find():
        userinfo.append(user)
    return render_template('adminhomepage.html', name = session['user'], userinfo = userinfo)#add session['user']

@app.route('/adminedit', methods = ['GET','POST'])
def adminedit():
    if request.method == "POST":
        userrole = request.form.get('role')
        useremail = request.form.get('email')
        print userrole
        db.user.update({"email": useremail}, {"$set":{"role":userrole}})        
        return redirect('adminhomepage')

@app.route("/massupload", methods = ['GET', 'POST'])
def massuplaod():
    if request.method == "POST":
        form = request.form
        pprint(form)
        return redirect('adminhomepage')

@app.route('/removeuser', methods = ['GET','POST'])
def removeuser():
    if request.method == "GET":
        username = request.args.get('username')
        db.user.remove({"username": username})
        return redirect('adminhomepage')

def main(argv):
    try:
        opts, args = getopt.getopt(argv, "do:l:p:rRh", ["workdir=", "wloaddir="])
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
        elif opt in ("-l", "--wloaddir"):
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

    initdb(INDICDOC_DBNAME, dbreset)

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
        setwlocaldir(DATADIR_BOOKS)
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
#if __name__ == '__main__':
#	app.run(host="0.0.0.0", debug = True)
