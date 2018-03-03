import json

di={}
di["a"]="aqq"
di["b"]="brrr"
print di
print di["a"]
print di['a']
print type(di)
a=json.dumps(di)
print a
print type(a)
