# -*- coding:utf-8 -*-
from bson import ObjectId
import sys


reload(sys)
sys.setdefaultencoding("utf-8")

from model.blog import blog

class blogService():
    def addblog(self,name,content):
        try:
            blogs = blog(name=name,content=content)
            blogs.save()
            return  "添加博客成功"
        except Exception, e:
            return  "添加博客出错"

    def delblog(self,blogId):
        try:
            blogs = blog.objects(id=ObjectId(blogId)).first()
            blogs.delete()
            return "删除博客成功"
        except Exception, e:
            return "删除博客出错"

    def updateblog(self,blogId,name,content):
        try:
            blogs = blog.objects(id=ObjectId(blogId)).first()
            blogs.name=name
            blogs.content=content
            blogs.save()
            return "更新博客成功"
        except Exception, e:
            return "更新博客出错"

