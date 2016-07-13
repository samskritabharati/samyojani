from flask import *
from pymongo import MongoClient
import json
from pprint import pprint

app = Flask(__name__)
app.secret_key = '123'
client = MongoClient()	
db = client.samvit



@app.route('/')
def index():
	return redirect('/login')
@app.route('/landpage')
def landpage():
	return render_template('landpage.html')	
@app.route('/login',methods = ['GET', 'POST'])
def login():
    error = None
    session.pop('user',None)	
    if request.method == 'POST':
        userinfo = { \
                'username' : request.form.get('email'), \
                'name' : request.form.get('name'), \
                'auth_src' : request.form.get('auth_src'), \
            }
        pprint(userinfo)
        auth_src = userinfo['auth_src']
        print "Importing auth_src " + auth_src + " into DB"

        email = userinfo['username']
        if not db.user.find_one({"username": email }):
            print "Importing new user " + email + " into DB"
            db.user.update({'username' : email}, userinfo, upsert=True)
        session['user'] = email

        return make_response(json.dumps({'redirect' : url_for("homepage") }))
    else:
	    return render_template('home.html')


@app.route('/signup', methods = ['GET','POST'])
def signup():
	if request.method == 'POST':
		username = request.form.get('username')
		name = requestk.form.get('name')
		password = request.form.get('password')
		db.user.insert({"name": name, "username": username, "password":password})
		return redirect('/')	
	return render_template('signup.html')

@app.route('/homepage', methods = ['GET','POST'])
def homepage():
    info =  []
    for i in db.shibira.find():
		info.append(i)
    return render_template('homepage.html', name = session['user'],info = info)
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
        for x in db.shibira.find({'name':i['teacher_id']}):
            sjoined.append(x)

    return render_template("sjoined.html", sjoined = sjoined)    

@app.route('/join', methods = ['GET','POST'])
def join():
	if request.method == "GET":
		teacherid = request.args.get('shibira_id')
        if db.activity.find_one({"name":session['user'], "teacher_id":teacherid}):
            flash('You Have already Enrolled For this shibira')
            return redirect('homepage') 
        else:    
            db.activity.insert({"name": session['user'], "teacher_id": teacherid})
	return redirect('homepage')

@app.route('/squit', methods = ['GET'])
def squit():
    if request.method == 'GET':
        teachername = request.args.get('teachername')
        db.activity.remove({'name':session['user'], 'teacher_id': teachername})
    return redirect("homepage")
    
@app.route('/logout')
def logout():
    session.pop('user', None)
    # flash('you have logged out')
    return render_template('home.html')


if __name__ == '__main__':
	app.run(host="0.0.0.0", debug = True)
