# -*- coding:utf-8 -*-
import sys
from model.blog import blog
from service.blogService import blogService
reload(sys)
sys.setdefaultencoding("utf8")

import os

from bson import ObjectId

from flask import Blueprint, render_template, abort, request, json,session,flash,redirect,url_for
hello_page = Blueprint('hello', __name__, template_folder='../templates')



@hello_page.route('/', methods=['GET', 'POST'])
def first():
    return render_template('login.html')

@hello_page.route('/admin', methods=['GET', 'POST'])
def login():
    if(request.form['email']!='888@qq.com'):
        return render_template('index.html')

@hello_page.route('/table', methods=['GET', 'POST'])
def table():
    return render_template('table.html',datas=blog.objects)

@hello_page.route('/delblog', methods=['GET', 'POST'])
def delblog():
    blogId=request.args.get('id')
    blogService().delblog(blogId)
    return render_template('table.html',datas=blog.objects)

@hello_page.route('/addblog', methods=['GET', 'POST'])
def addblog():
    try:
        name=request.form.get('name')
        content=request.form.get('content')
        blogService().addblog(name,content)
        return "添加博客成功"
        #return render_template('table.html',datas=blog.objects)
    except Exception,e:
        return "添加博客出错"


@hello_page.route('/updatetest', methods=['GET', 'POST'])
def updateblogtest():
    try:
       blogid = request.args.get('id')
       blogs=blog.objects(id=ObjectId(blogid)).first()
       return render_template('updateblog.html', data=blogs)
    except Exception, e:
       return "更新博客出错updatetest"


@hello_page.route('/updateblog', methods=['GET', 'POST'])
def updateblog():
    try:
        blogid = request.form.get("testid")
        name=request.form.get("name")
        content=request.form.get("content")
        blogService().updateblog(blogid,name,content)
        return '添加博客成功'
    except Exception, e:
        return "更新博客出错updateblog"
    #return render_template('table.html', datas=blog.objects)
    #return redirect(url_for('hello_page.table'))
    #window.location.href="/table";




