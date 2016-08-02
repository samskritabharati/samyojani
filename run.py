import os
from flask import *
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import sys, getopt
import json
from pprint import pprint
import smtplib
from config import *
from db import *
import string
from sys import argv

app = Flask(__name__)
app.secret_key = '123'

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.realpath(__file__)),'images/')
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

(cmddir, cmdname) = os.path.split(argv[0])
setmypath(os.path.abspath(cmddir))
print "My path is " + mypath()

mgmtdb = None

def usage():
    print cmdname + " [-r] [-R] [-d] [-o <workdir>] [-l <local_wloads_dir>] <repodir1>[:<reponame>] ..."
    exit(1)

@app.route('/')
def index():
	return redirect(url_for('login'))

@app.route('/ui/landpage')
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
        if mgmtdb.users.find_one({"email": email }):
            session.pop('user',None)	
            for x in mgmtdb.users.find({"email":email}):
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
            mgmtdb.users.insert({'email' : request.form.get('email'),'name' : request.form.get('name'),'auth_src' : request.form.get('auth_src'),"role":"student", "phonenumber":"" , "address": ""})
            session['user'] = email
            return make_response(json.dumps({'redirect' : url_for("profileupdate") }))
    else:
        return render_template('home.html')

@app.route('/patch/profileupdate', methods = ['GET','POST'])
def profileupdate():
    if request.method == "POST":
        name = request.form.get('name')
        phonenumber  = request.form.get('phonenumber')
        address = request.form.get('address')
        mgmtdb.users.update({"email": session['user']}, {'name':name, \
        "address":address,"phonenumber":phonenumber}, upsert=True)
        with mgmtdb.users.find_one({"email":session['user']}) as u:
            if u['role'] == "admin":
                return redirect(url_for("adminhomepage"))
            elif u['role'] == "samyojaka":
                return redirect(url_for("samyojaka"))
            else:
                return redirect(url_for("homepage"))
    for i in mgmtdb.users.find_one({"email":session['user']}):
        userinfo = i
    return render_template('profile.html', userinfo = userinfo)
#useless
@app.route('/signup', methods = ['GET','POST'])
def signup():
	if request.method == 'POST':
		username = request.form.get('username')
		name = requestk.form.get('name')
		password = request.form.get('password')
		mgmtdb.users.insert({"name": name, "username": username, "password":password})
		return redirect('/')	
    

@app.route('/ui/homepage', methods = ['GET','POST'])
def homepage():
    info =  []
    userinfo = []
    for i in mgmtdb.activities.find():
        info.append(i)
    #for i in db.varga.find():
     #   info.append(i)
    for i in mgmtdb.users.find({"email":session['user']}):
        userinfo = i
        useraddress = i['address']
    return render_template('homepage.html',userinfo = userinfo ,info = info, useraddress = useraddress)
#api to send image to modal

@app.route('/get/user/uploads/<filename>')
def send_file(filename):
    #for i in db.image.find({"src":filename}):
     #   print filename
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/ui/user/shibiradetails/<s_id>')
def shibiradetails(s_id):
    index = 0
    for x in mgmtdb.actlog().find({"shibira_id":s_id}):
            index = index + 1
    for x in mgmtdb.activities.find({"s_id":s_id}):
        shibirainfo = x
    return render_template('shibirainfo.html', no_of_students = index, shibirainfo = shibirainfo)
#useless
@app.route('/teacherfinder',methods = ['GET','POST'])
def teacherfinder():
	info =  []
	for i in mgmtdb.activities.find():
            info.append(i) 	
	return render_template("google.html", info = info)

@app.route('/ui/user/activitiesjoined', methods = ['GET','POST'])
def sjoined():
    sjoined = [] 
    for i in mgmtdb.actlog().find({"name":session['user']}):
        for x in mgmtdb.activities.find({'s_id':i['shibira_id']}):
            sjoined.append(x)

    return render_template("sjoined.html", sjoined = sjoined)    

@app.route('/post/user/joinshibira/<s_id>', methods = ['GET','POST'])
def join(s_id):
    if mgmtdb.actlog().find_one({"name":session['user'], "shibira_id":s_id}):
        flash('You Have already Enrolled For this shibira')
        return redirect(url_for('homepage')) 
    else:    
        mgmtdb.actlog().insert({"name": session['user'], "shibira_id":s_id})
        return redirect(url_for('homepage'))

@app.route('/delete/user/quitshibira/<s_id>')
def quitshibira(s_id):
    mgmtdb.actlog().remove({'name':session['user'], 'shibira_id': s_id})
    return redirect(url_for("homepage"))
    
@app.route('/ui/logout')
def logout():
    session.pop('user', None)
    # flash('you have logged out')
    return render_template('home.html')

@app.route('/ui/samyojaka/homepage', methods = ['GET','POST'])
def samhomepage():
    list_students = []
    shibirainfo = []   
    index = 0
    for i in mgmtdb.activities.find({"samyojaka": session['user']}): # add samyajaka user field in search
        shibirainfo.append(i)
        s_id = i['s_id']
        list_students.append([])
        for x in mgmtdb.actlog().find({"shibira_id":s_id}):
            for y in mgmtdb.users.find({'email': x['name']}):
                list_students[index].append(y)
            index = index + 1
    for i in mgmtdb.users.find({"email":session['user']}):
        userinfo = i
    return render_template('samhomepage.html', shibirainfo = shibirainfo, userinfo = userinfo, list_students = list_students)

@app.route('/post/samyojaka/hostshibira', methods = ['GET','POST'])
def hostshibira():
    if request.method == "POST":
        teachername = request.form.get('teachername')
        address = request.form.get('address')
        startdate = request.form.get('fromdate')
        enddate = request.form.get('todate')
        starttime = request.form.get('starttime')
        endtime = request.form.get('endtime')
        shibira_id = request.form.get('s_id')
        phonenumber = request.form.get('phonenumber')
#code added for uploading file
# if 'file' not in request.files:
#    flash('No file part')
         #   return redirect(request.url)
        file = request.files['image']
            # if user does not select file, browser also
            # submit a empty part without filename
            #if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        srcurl = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(srcurl)
        if not mgmtdb.activities.find_one({"s_id":shibira_id}):
            mgmtdb.activities.insert({"image":filename, "phonenumber":phonenumber, "address":address,"teachername":teachername, "startdate":startdate, "enddate":enddate,"starttime":starttime, "endtime":endtime, 'category': "shibira", "s_id":shibira_id, "samyojaka":session['user'] }) #, 'samyojakaname':session['user']}) 
    return redirect(url_for('samhomepage'))
#useless
@app.route('/post/samyojaka/newvarga', methods = ['GET','POST'])
def newvarga():
    if request.method == "POST":
        teachername = request.form.get('teachername')
        address = request.form.get('address')
        startdate = request.form.get('fromdate')
        enddate = request.form.get('todate')
        starttime = request.form.get('starttime')
        endtime = request.form.get('endtime')
        varga_id = request.form.get('c_id')
        if not mgmtdb.activities.find_one({"c_id":varga_id}):
            db.varga.insert({"address":address,"teachername":teachername, "startdate":startdate, "enddate":enddate,"starttime":starttime, "endtime":endtime, 'category': "class", "s_id":shibira_id, "samyojaka":session['user'] }) 
        return render_template('samhomepage.html', shibirainfo = shibirainfo, userinfo = userinfo, list_students = list_students)

@app.route('/delete/samyojaka/deleteshibira/<s_id>', methods = ['GET','POST'])
def deleteshibira(s_id):
    mgmtdb.activities.remove({'s_id': s_id })
    return redirect(url_for('samhomepage'))

@app.route('/patch/samyojaka/shibira/edit', methods = ['GET','POST'])
def edit():
    if request.method == "POST":
        teachername = request.form.get('teachername')
        address = request.form.get('address')
        startdate = request.form.get('fromdate')
        enddate = request.form.get('todate')
        starttime = request.form.get('starttime')
        endtime = request.form.get('endtime')
        shibira_id = request.form.get('s_id')
        phonenumber = request.form.get('phonenumber')
        #mgmtdb.activities.remove({"s_id":shibira_id })
        mgmtdb.activities.update({"samyojaka":session['user']},{"$set":{"phonenumber":phonenumber, "address":address,"teachername":teachername, "startdate":startdate, "enddate":enddate,"starttime":starttime, "endtime":endtime, 'category': "shibira", "s_id":shibira_id}})
    	return redirect(url_for('samhomepage'))

@app.route('/delete/samyojaka/shibira/removestudent', methods = ['GET', 'POST'])
def removestudent():
    if request.method == "GET":
        studentname = request.args.get('studentname')
        s_id = request.args.get('s_id')
        print studentname
        mgmtdb.actlog().remove({'name': studentname, "shibira_id":s_id})
    return redirect(url_for('samhomepage')) 

@app.route('/post/samyojaka/shibira/proxyregistration', methods = ['GET','POST'])
def proxyreg():
    if request.method == "POST":
        email = request.form.get('email')
        s_id = request.form.get('s_id')
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
        mgmtdb.users.insert({"username": email, "name": name, "role": "student", "address": "none", "phonenumber": "none"})
        mgmtdb.actlog().insert({"name": email, "shibira_id": s_id})
        return redirect(url_for("samhomepage"))

@app.route('/ui/editprofile', methods = ['GET', 'POST'])
def editprofile():
    if request.method == "POST":
        name = request.form.get('name')
        phonenumber  = request.form.get('phonenumber')
        address = request.form.get('address')
        mgmtdb.users.update({"email": session['user']}, {"$set":{'name':name, "address":address,"phonenumber":phonenumber}})
        for i in mgmtdb.users.find({"email":session['user']}):
            if i['role'] == "admin":
                return redirect(url_for("adminhomepage"))
            elif i['role'] == "samyojaka":
                return redirect(url_for("samhomepage"))
            else:
                return redirect(url_for("homepage"))

#admin section
@app.route('/ui/admin/homepage')
def adminhomepage():
    userinfo = []
    for user in mgmtdb.users.find():
        userinfo.append(user)
    return render_template('adminhomepage.html', name = session['user'], userinfo = userinfo)#add session['user']

@app.route('/patch/admin/edituser', methods = ['GET','POST'])
def adminedit():
    if request.method == "POST":
        userrole = request.form.get('role')
        useremail = request.form.get('email')
        print userrole
        mgmtdb.users.update({"email": useremail}, {"$set":{"role":userrole}})        
        return redirect(url_for('adminhomepage'))
#notworking yet
@app.route("/post/admin/massupload", methods = ['GET', 'POST'])
def massuplaod():
    if request.method == "POST":
        form = request.form
        pprint(form)
        return redirect(url_for('adminhomepage'))

@app.route('/delete/admin/removeuser/<email>')
def removeuser(email):
    mgmtdb.users.remove({"email":email})
    return redirect(url_for('adminhomepage'))

@app.route('/removeuser', methods = ['GET','POST'])
def removeuserbyname():
    if request.method == "GET":
        username = request.args.get('username')
        mgmtdb.users.remove({"username": username})
        return redirect('adminhomepage')

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

    initdb(dbreset)
    global mgmtdb
    mgmtdb = getdb()
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
