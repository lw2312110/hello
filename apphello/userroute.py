from flask import Flask
from flask import request
from flask import render_template
from flask import redirect,Blueprint
from model.user import user
from service.userservice import userService
app=Flask(__name__)

from wtforms import Form,StringField,PasswordField,validators
user_page = Blueprint('user', __name__, template_folder='../templates')


class LoginForm(Form):
	username = StringField("username",[validators.DataRequired()])
	password = PasswordField("password",[validators.DataRequired()])


@user_page.route("/register",methods=['GET','POST'])
def register():
	myForm=LoginForm(request.form)
	if request.method=='POST':
		userService().insert(myForm.username.data,myForm.password.data)
		return redirect("/login")
	return render_template('register.html',form=myForm)

@user_page.route("/login",methods=['GET','POST'])
def login():
	myForm=LoginForm(request.form)
	if request.method =='POST':
		if (userService().isExisted(myForm.username.data,myForm.password.data)):
			return render_template('index.html')
		else:
			return "Login Failed"
	return render_template('register.html',form=myForm)


