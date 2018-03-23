# -*- coding: utf-8 -*-

import urllib2
import math
import re
response = urllib2.urlopen('http://www.runoob.com/python/python-operators.html')
html = response.read()
a='hello'
print type(html)
#print html
print ('html is:',a)
print (str('1'+','+'2'))

b=2
c=3
print (b and c)

g = [1, 2, 3]
b = [1, 2, 3]
print (b is g)

g=(1,2,3)
b=(1,2,3)
print (b is g)


d=4444
e=4444
print(e is d)

d=2.0
e=2.0
print(e is d)

print pow(3,2)
ee=[1,2,5,88]
print max(ee)
ff=(1,23,0)
print max(ff)

# -*- coding: utf-8 -*-
# 一个简单的match实例



# 匹配如下内容：单词+空格+单词+任意字符
m = re.match(r'(\w+) (\w+)(\S*)', 'hello world!')

print "m.string:", m.string
print "m.re:", m.re
print "m.pos:", m.pos
print "m.endpos:", m.endpos
print "m.lastindex:", m.lastindex
print "m.lastgroup:", m.lastgroup
print "m.group():", m.group()
print "m.group(1,2):", m.group(1, 2)
print "m.groups():", m.groups()
print "m.groupdict():", m.groupdict()
print "m.start(2):", m.start(2)
print "m.end(2):", m.end(2)
print "m.span(2):", m.span(2)
print r"m.expand(r'\g \g\g'):", m.expand(r'\2 \1\3')



pattern = re.compile(r'(\w+) (\w+)')
s = 'i say, hello world!'
m=re.sub(pattern, r'\2 \1', s)
print m
