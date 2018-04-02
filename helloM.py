# -*- coding:utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding("utf8")
from flask_bootstrap import Bootstrap
from flask import Flask
app = Flask(__name__)
app.secret_key = 'A\xbf\x07\xd7|\x193\xc5\xc9\xce:\x9a\x1c\x9e\xc4\xfc\x92\xbbdc*4\xdd*'
bootstrap = Bootstrap(app)

from flask_moment import Moment   #这一类的import和定义要写在启动文件上
moment = Moment(app)

from apphello import hello,userroute
app.register_blueprint(hello.hello_page)
app.register_blueprint(userroute.user_page)




if __name__ == '__main__':
    app.run( debug=False)