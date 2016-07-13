from flask import Flask, redirect, url_for, session, request,render_template,flash
from flask_oauth import OAuth
from pymongo import MongoClient



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
@app.route('/login',methods = ['GET','POST'])
def login():
	
	if request.method == 'POST':
		error = None
		session.pop('user',None)	
		username = request.form.get('username')
		password = request.form.get('password')
   	   	if db.user.find_one({"username": username }) and db.user.find_one({"password": password }):
			session['user'] = username
			return redirect( "homepage" )	
		else:
			error = 'username or password is invalid'
			return render_template('home.html', error = error) 	
    #if request.method == 'POST':
     #   username = request.args.get("email")
		#username = "hello"
		##if db.user.find_one({"username": username }):
		#	session.pop('user', None)
		#	session['user'] = username
	#	return render_template("home.html", use = username)

	
		 			
	return render_template('home.html')




@app.route('/signup', methods = ['GET','POST'])
def signup():
	if request.method == 'POST':
		username = request.form.get('username')
		name = request.form.get('name')
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
    flash('you have logged out')
    return render_template('home.html')


if __name__ == '__main__':
	app.run(debug = True)
