// JavaScript Document

//检测手机号是否正确
jQuery.validator.addMethod("isMobile", function (value, element) {
    var length = value.length;
    var regPhone = /^1([3578]\d|4[57])\d{8}$/;
    return this.optional(element) || ( length == 11 && regPhone.test(value) );
}, "请正确填写您的手机号码");

//检测是否为汉字
jQuery.validator.addMethod("isChar", function (value, element) {
    var regName = /[^\u4e00-\u9fa5]/;
    return this.optional(element) || !regName.test(value);
}, "请输入正确格式的名称(只能是汉字)");

//判断是否全为字母和数字组合
jQuery.validator.addMethod("isLetter", function (value, element) {
    var regLetter = /^[a-z,A-Z,0-9]*$/;
    return this.optional(element) || regLetter.test(value);
}, "请输入正确格式的名称(只能是字母和数字组合)");