#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import urllib
import urllib2

values = {"email":"1016903103@qq.com","password":"XXXX"}
data = urllib.urlencode(values)
url = "http://127.0.0.1:5000/"
request = urllib2.Request(url,data)
response = urllib2.urlopen(request)
print response.read()