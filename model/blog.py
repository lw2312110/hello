import datetime

from model import mongoConnect
import sys

reload(sys)
sys.setdefaultencoding("utf-8")

from mongoengine import *

connect(db=mongoConnect.db, host=mongoConnect.host, port=mongoConnect.port)

class blog(Document):
    name = StringField()
    content = StringField()

