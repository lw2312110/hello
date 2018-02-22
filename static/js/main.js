
var app = (function (window, document, $, undefined) {
    var flowGraph = new FlowGraph("main");
    // 连线关联的对象
    var linkSource;
    //拖拽元素当前位置
    var pos = {
        x: 0,
        y: 0
    };
    var decisionBranchCount = 0;
    // 删除多余空格
    function Trim(str, is_global) {
        var result;
        result = str.replace(/(^\s+)|(\s+$)/g, "");
        if (is_global.toLowerCase() == "g") {
            result = result.replace(/\s/g, "");
        }
        return result;
    }

    //拖拽参数
    var gmethod = {};
    var getList = new Promise(function (resolve, reject) {
        $.ajax({
            url: '/mixfunc/getAllMixFunc',
            dataType:'text',
            type: 'get',
            success: function (json) {
                json = Trim(json,'g')
                json = JSON.parse(json)
                resolve(json);
            },
            error: function (err) {
                reject(err)
            }
        })
    })
    // 选择的参数
    var jparams = []
    // 选择参数事件
    $('body').delegate('.params-ref', 'change', function () {
        var refInd = $(this).children('option:selected').index();
        var refVal = $(this).children('option:selected').val();
        var returnData = jparams[refInd];

        var paramsReturn = '';
        returnData.output.forEach(function (item) {
            paramsReturn += '<option data-return = "' + item.value + '" value ="' + item.resultExplain + '">' + item.resultExplain + '</option>';
        });
        $(this).siblings('.params-return').html(paramsReturn);
        if (refVal == '其他') {
            $(this).parents('div').children('.params-input').show();
        } else {
            $(this).parents('div').children('.params-input').hide();
        }
    });

    var _app = {}
    _app.run = function () {
        _app.attachEvents();
        var myTextarea = $('#editor')[0]
        editor = CodeMirror.fromTextArea(myTextarea, {
            lineNumbers: true,
            mode: 'python'
        });
        getList.then(function (json) {
            _app.createNavList(json)
        }).catch(function (err) {
            console.error(err);
        })
    }
    _app.attachEvents = function () {
        var that = this;
        // 点击设置下个模块链接的起点
        flowGraph.graph.click = function (evt) {
            if (evt.sourceState) {
                if (evt.sourceState.style.shape == 'connector') {
                    flowGraph.setLinkPointer(evt.sourceState.cell);
                } else {
                    flowGraph.setLinkPointer();
                }
            }
        }
        // 双击
        flowGraph.graph.dblClick = function (evt, cell) {
            if (cell) {
                if (cell.getType() == 'codeblock') {
                    var method = {};
                    method.id = cell.getBlockId();
                    method.input = cell.getInput();
                    method.output = cell.getOutput();
                    method.name = cell.getMethodName();
                    method.displayName = cell.getDisplayName();
                    var config = {}
                    if (cell.getConfig() != '') {
                        config = JSON.parse(cell.getConfig())
                    }
                    that.createConfigPanel(cell.getId(), method, config);
                } else if (cell.getType() == 'decision') {
                    $('#if').modal('show');
                    $('#if').attr('cellId', cell.getId())
                } else if (cell.getType() == 'circulate') {
                    $('#for').modal('show');
                    $('#for').attr('cellId', cell.getId())
                    // 获取参数列表
                    jparams = flowGraph.getJparams();
                    var paramsRef = '', paramsReturn = '';
                    jparams.forEach(function (item, key) {
                        paramsRef += '<option value ="' + item.name + '">' + item.name + '</option>';
                        if (key == 0) {
                            item.output.forEach(function (value) {
                                paramsReturn += '<option return="' + item.value + '" value ="' + item.resultExplain + '">' + item.resultExplain + '</option>';
                            });
                        }
                    });
                    selectHtml = '<select class="params-ref">' + paramsRef + '</select><select class="params-return">' + paramsReturn + '</select>';
                    $('#for .select-box').html(selectHtml);
                }
            }
        }
        // 拖拽
        $('#main')[0].ondrop = function (event) {
            var x = pos.x = event.clientX - 220
            var y = pos.y = event.clientY;
            if (event.dataTransfer.getData('type') == 'codeblock') {
                var code = event.dataTransfer.getData('code');
                var id = event.dataTransfer.getData('id');
                var input = event.dataTransfer.getData('input');
                var output = event.dataTransfer.getData('output');
                var name = event.dataTransfer.getData('name');
                var displayName = event.dataTransfer.getData('displayName');
                var dataJson = event.dataTransfer.getData('dataJson');
                var method = {};
                method.code = code;
                method.input = input;
                method.output = output;
                method.name = name;
                method.id = id;
                method.displayName = displayName;
                method.dataJson = dataJson;
                gmethod = method;
                // function
                flowGraph.drawMethod(x, y, method)
            } else if (event.dataTransfer.getData('type') == 'decision') {
                // if
                flowGraph.drawDecision(x, y);
            } else {
                // for
                flowGraph.drawCirculate(x, y)
            }
        };


        $('#myModal .confirm').click(function () {
            var rs = $('#myModal input[name="decision"]').val();
            flowGraph.drawMethod(pos.x, pos.y, gmethod, rs)
            flowGraph.branchCount--;
            $('#myModal').modal('hide')
        });
        // if 确定
        $('#if .confirm').click(function () {
            flowGraph.updateCell($('#if').attr('cellId'), $('#if input[name="condition"]').val())
            $('#if').modal('hide')
        });
        // 变量确定
        $('#config .confirm').click(function () {
            // 显示流程图的数据
            var params = [];
            // 代码真实数据
            var realParams = [];
            var paramDoms = $('#config .params-box');
            var paramTypeDoms = $('#config .param-type');
            // 输出的参数
            var outputDom = $('#config .output2')[0];
            var output = '';
            if (outputDom) {
                output = $(outputDom).val();
                if (output == "") {
                    output = $(outputDom).attr('placeholder')
                }
            }
            // 输入的参数
            for (var i = 0; i < paramDoms.length; i++) {
                var $paramChild = $(paramDoms[i]);

                // 输入的参数
                var paramType = $paramChild.children('.params-input').children('.param-type').prop('checked');
                var paramInput = $paramChild.children('.params-input').children('.params').val();
                // 选中参数
                var paramRef = $paramChild.children('.select-box').children('.params-ref').val();
                var paramsVal = $paramChild.children('.select-box').children('.params-return').val();
                var paramsReturn = $paramChild.children('.select-box').children('.params-return').find('option:selected').data('return');
                if (paramRef == '其他') {
                    if (paramType) {
                        params.push('\'' + paramInput + '\'');
                        realParams.push('\'' + paramInput + '\'')
                    } else {
                        params.push(paramInput);
                        realParams.push(paramInput);
                    }
                } else {
                    params.push(paramsVal);
                    realParams.push(paramRef + paramsReturn)

                }
            }
            var input = params.join(',');
            var realInput = realParams.join(',');
            var id = $('#config').attr('cellId');
            var name = $('#config').attr('methodName');
            var methodId = $('#config').attr('methodId');
            var displayName = $('#config').attr('displayName');
            flowGraph.updateBlock(id, methodId, input, output, name, displayName, realInput);
            $('#config').modal('hide')
        });























        // for 确定
        $('#for .confirm').click(function () {
            var forInd = '', forObj = '', forIndReal = '', forObjReal = '';
            // 索引参数
            var $paramsInd = $('#for .params-ind');
            var indInput = $paramsInd.children('.params-input').children('.params').val();
            var indRef = $paramsInd.children('.select-box').children('.params-ref').val();
            var indVal = $paramsInd.children('.select-box').children('.params-return').val();
            var indReturn = $paramsInd.children('.select-box').children('.params-return').find('option:selected').data('return');
            if (indRef == '其他') {
                forInd = indInput;
                forIndReal = indInput;
            } else {
                forInd = indVal;
                forIndReal = indRef + indReturn;
            }
            // 索引参数
            var $paramsObj = $('#for .params-obj');
            var objInput = $paramsObj.children('.params-input').children('.params').val();
            var objRef = $paramsObj.children('.select-box').children('.params-ref').val();
            var objVal = $paramsObj.children('.select-box').children('.params-return').val();
            var objReturn = $paramsObj.children('.select-box').children('.params-return').find('option:selected').data('return');
            if (objRef == '其他') {
                forObj = objInput;
                forObjReal = '\'' + objInput + '\'';
            } else {
                forObj = objVal;
                forObjReal = objRef + objReturn;
            }
            flowGraph.updateForCell($('#for').attr('cellId'), forInd, forObj, forIndReal, forObjReal)
            $('#for').modal('hide')
        });
















        // 编辑代码
        $('#edit').click(function () {
            var code = editor.getValue();
            var body = { body: code }
        });
        // 生成代码
        $('#create').click(function s() {
            var code = flowGraph.generate();
            if (code) {
                editor.setValue(code);
                codeEditor.setValue(code);
            }
        });
        // 保存流程图
        $('#save').click(function () {
            var flowChartContent = flowGraph.flowChartContent();
            $.ajax({
                // 保存的接口
                url: '/json/save.json',
                dataType: 'json',
                // 正常使用时改post
                type: 'get',
                // post保存传内容
                // data: {
                //     saveData: flowChartContent
                // },
                success: function (json) {
                    console.log(json)
                },
                error: function (err) {
                    reject(err)
                }
            })

        });
        // 导入流程图
        $('#leading').click(function () {
            $.ajax({
                // 保存的接口
                url: '/json/url.json',
                dataType: 'json',
                // 正常使用时改post
                type: 'get',
                // post保存传内容
                // data: {
                //     saveData: flowChartContent
                // },
                success: function (json) {
                    flowGraph.loadXml(json.url);
                },
                error: function (err) {
                    reject(err)
                }
            })
        });
        // 清除流程图
        $('#clearGraph').click(function () {
            flowGraph.clearGraph('main');
        })
    }

    var createNavList = function (json) {
        var html = '';
        var dataJson = encodeURIComponent(JSON.stringify(json));
        json.forEach(function (item) {
            var inputData = '', outputData = '';
            item.input.forEach(function (value) {
                inputData += value.inExplain + ','
            });
            item.output.forEach(function (value) {
                outputData += value.resultExplain + ','
            });
            inputData = inputData.substring(0, inputData.length - 1);
            outputData = outputData.substring(0, outputData.length - 1);
            // from mixFunc.cardbill.getProviceBill import getProviceBill
            var itemHtml = '<li class="method" displayName="' + item.methodTitle + '" id="' + item.id + '" draggable="true" dataJson="' + dataJson + '" output="' + outputData + '" input="' + inputData + '" name="'+item.className+'().' + item.methodName + '" ondragstart="drag(event)" code="from ' + item.classImport +' import ' + item.className  + '">' + item.methodTitle + '</li>'
            html += itemHtml;
        });
        $('#nav').html(html)
    }
    _app.createNavList = createNavList

    var createConfigPanel = function (cellId, method, config) {
        var content = '';
        var inputList = '';
        var params = method.input ? method.input.split(',') : []
        var inputValues = [];
        var outputValue = '';
        if (config.methodId) {
            inputValues = config.input ? config.input.split(',') : [];
            outputValue = config.output || '';
        }
        // 获取参数列表
        jparams = flowGraph.getJparams();
        var paramsRef = '', paramsReturn = '';
        jparams.forEach(function (item, key) {
            paramsRef += '<option value ="' + item.name + '">' + item.name + '</option>';
            if (key == 0) {
                item.output.forEach(function (value) {
                    paramsReturn += '<option return="' + item.value + '" value ="' + item.resultExplain + '">' + item.resultExplain + '</option>';
                });
            }
        });
        selectHtml = '<div class="select-box"><select class="params-ref">' + paramsRef + '</select><select class="params-return">' + paramsReturn + '</select></div> ';

        params.forEach(function (element, index) {
            var value = inputValues[index] || '';
            value = value.replace(/\'/g, '')
            var html = '<div class="params-box">' + element + ':' + selectHtml + '<div class="params-input"><input class="params" name="' + element + '" value="' + value + '" type="text" /><input class="param-type" type="checkbox" checked/>是否为字符串</div></div>';
            inputList += html
        });
        content = '<h3>参数</h3>' + inputList;
        if (method.output)
            content += '<h3>输出变量名</h3>' + '<input value="' + outputValue + '" placeholder="' + IdGenerator.getNext() + '" class="output2"  type="text" />';
        $('#config .modal-body').html(content);
        $('#config').attr({
            methodName: method.name,
            methodId: method.id,
            cellId: cellId,
            name: method.output || '',
            displayName: method.displayName
        });
        if (method.input != "" || method.output != "") {
            $('#config').modal('show')
        }
        //  methodName ="' + method.name + '"  methodId="' + method.id + '"  cellId ="' + cellId + '" name="' + method.output + '"

    }

    _app.createConfigPanel = createConfigPanel;




    return _app;
})(window, document, jQuery, undefined)



$(document).ready(function () {
    app.run();
})
