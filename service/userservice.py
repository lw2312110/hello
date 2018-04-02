# -*- coding:utf-8 -*-
from bson import ObjectId
import sys


reload(sys)
sys.setdefaultencoding("utf-8")

from model.user import user

class userService():
    def insert(self,username,password):
        try:
            users = user(username=username,password=password)
            users.save()
            return  "注册成功"
        except Exception, e:
            return  "注册出错"

    def isExisted(self,username,password):
        try:
            users=user.objects(username=username,password=password)
            if users:
                return True
            else:
                return False
        except Exception,e:
            return "判断是否存在出错"








