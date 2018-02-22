/**
 * a very simple IdGenerator
 */
var IdGenerator = (function () {
    var id = 0;
    return {
        getNext: function () {
            var name = 'ref' + id;
            id++;
            return name;
        }
    }
})()


// 创建mxgraph对象
function FlowGraph(containerId) {

    var container = document.getElementById(containerId);
    var w = $(container).width();
    var x = w / 2 - 40;
    this.graph = new mxGraph(container)
    var graph = this.graph;
    graph.cellsEditable = false
    this.graph.setConnectable(true);
    graph.setAllowDanglingEdges(false);
    graph.cellsResizable = false;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    var that = this;
    model.beginUpdate();
    try {
        var v1 = graph.insertVertex(parent, null, '开始', x, 20, 80, 30);
        this.lastPointer = v1;
        this.startPointer = v1;
        // 选中连线对象
        this.linkObj = '';
        // 插入连接的起点、终点
        this.linkSource = v1;
        this.linkTarget = '';
    } finally {
        model.endUpdate();
    }
}

FlowGraph.prototype.codeBlockList = new Map();
FlowGraph.prototype.callList = [];
FlowGraph.prototype.contextVars = [];

// function 流程图
FlowGraph.prototype.drawMethod = function (x, y, method, decision) {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    model.beginUpdate();
    try {
        var v1 = graph.insertVertex(parent, null, method.displayName, x, y, 80, 30);
        // 处理连接线
        var startLinkName = '',
            startLinkStyle = ''
        if (this.linkObj) {
            if (this.linkObj.value == '是') {
                startLinkName = '是'
                startLinkStyle = startLinkStyle + 'strokeColor=green;'
            } else if (this.linkObj.value == '否') {
                startLinkName = '否'
                startLinkStyle = startLinkStyle + 'strokeColor=red;'
            }
        }
        graph.insertEdge(parent, null, startLinkName, this.linkSource, v1, startLinkStyle);

        v1.setCodeBlock(method.code)
        v1.setType('codeblock')
        v1.setInput(method.input)
        v1.setOutput(method.output)
        v1.setBlockId(method.id)
        v1.setMethodName(method.name)
        v1.setDisplayName(method.displayName)
        v1.setDataJson(method.dataJson)

        // 如果选中连线状态，移除连线
        if (this.linkObj) {
            graph.removeCells([this.linkObj]);
        }

        // 如果为插入连线中，则关联结束点
        if (this.linkTarget) {
            graph.insertEdge(parent, null, '', v1, this.linkTarget, '');
            // 清除选中
            this.clearSelected();
        } else {
            this.linkSource = v1;
            this.lastPointer = v1;
        }
    } finally {
        model.endUpdate();
    }
}

/**
 * if 流程图
 */

FlowGraph.prototype.drawDecision = function (x, y) {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    model.beginUpdate();

    try {
        // if条件
        var v1 = graph.insertVertex(parent, null, 'IF', x, y, 120, 40, 'fillColor=none;strokeColor=#ff0000;strokeWidth=1');
        var startLinkName = '',
            startLinkStyle = ''
        if (this.linkObj) {
            if (this.linkObj.value == '是') {
                startLinkName = '是'
                startLinkStyle = startLinkStyle + 'strokeColor=green;'
            } else if (this.linkObj.value == '否') {
                startLinkName = '否'
                startLinkStyle = startLinkStyle + 'strokeColor=red;'
            }
        }
        graph.insertEdge(parent, null, startLinkName, this.linkSource, v1, startLinkStyle);
        v1.setType('decision');
        // 结束点
        var vEnd = graph.insertVertex(parent, null, 'IF 终点', x, y + 260, 120, 40, 'fillColor=none;strokeColor=#222;strokeWidth=1;');

        // 是
        graph.insertEdge(parent, null, '是', v1, vEnd, 'strokeColor=green;exitX=0;exitY=2');
        // 否
        graph.insertEdge(parent, null, '否', v1, vEnd, 'strokeColor=red;exitX=1;exitY=2;');

        // 如果选中连线状态，移除连线
        if (this.linkObj) {
            graph.removeCells([this.linkObj]);
        }
        // 如果为插入连线中，则关联结束点
        if (this.linkTarget) {
            graph.insertEdge(parent, null, '', vEnd, this.linkTarget, '');
            // 清除选中
            this.clearSelected();
        } else {
            // 保留终点
            this.lastPointer = vEnd;
            // 重新设置连线的起点
            this.linkSource = vEnd;
        }

    } finally {
        model.endUpdate();
    }
}

/**
 * for 流程图
 */
FlowGraph.prototype.drawCirculate = function (x, y) {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    model.beginUpdate();
    try {
        // for起点
        var v1 = graph.insertVertex(parent, null, 'for', x, y, 120, 40, 'fillColor=none;strokeColor=#ff0000;strokeWidth=1');
        // 处理连接线
        var startLinkName = '',
            startLinkStyle = ''
        if (this.linkObj) {
            if (this.linkObj.value == '是') {
                startLinkName = '是'
                startLinkStyle = startLinkStyle + 'strokeColor=green;'
            } else if (this.linkObj.value == '否') {
                startLinkName = '否'
                startLinkStyle = startLinkStyle + 'strokeColor=red;'
            }
        }
        graph.insertEdge(parent, null, startLinkName, this.linkSource, v1, startLinkStyle);
        v1.setType('circulate');

        // 结束点
        var vEnd = graph.insertVertex(parent, null, 'for 终点', x, y + 260, 120, 40, 'fillColor=none;strokeColor=#222;strokeWidth=1;');
        graph.insertEdge(parent, null, '', v1, vEnd, '');

        // 如果选中连线状态，移除连线
        if (this.linkObj) {
            graph.removeCells([this.linkObj]);
        }
        // 如果为插入连线中，则关联结束点
        if (this.linkTarget) {
            graph.insertEdge(parent, null, '', vEnd, this.linkTarget, '');
            // 清除选中
            this.clearSelected();
        } else {
            // 保留终点
            this.lastPointer = vEnd;
            // 重新设置连线的起点
            this.linkSource = vEnd;
        }

    } finally {
        model.endUpdate();
    }
}
// 设置插入时的上下连线点
FlowGraph.prototype.setLinkPointer = function (linkObj) {
    var graph = this.graph;
    if (linkObj) {
        this.linkSource = linkObj.source;
        this.linkTarget = linkObj.target;
        this.linkObj = linkObj;
    } else {
        this.clearSelected();
    }
}
// 清除选中连线的参数，设置下次连线起点
FlowGraph.prototype.clearSelected = function () {
    this.linkSource = this.lastPointer;
    this.linkTarget = '';
    this.linkObj = '';
}












// 查找下一步的连线
function findPointerLine(pointer, pointerData) {
    var result = []
    for (var i = 0; i < pointerData.length; i++) {
        if (pointerData[i].source == pointer) {
            result.push(pointerData[i])
        }
    }
    return result;
};

// 查找是否有if 结束下一步的连线
function findIFEndLine(pointerData) {
    for (var i = 0; i < pointerData.length; i++) {
        if (pointerData[i].value == 'IF 终点') {
            return pointerData[i]
        }
    }
};

// if分支处理
var ifEndStatus = 0;
var yesRetractInd = 1,
    noRetractInd = 1;

function ifBranch(pointer, pointerData, pushStack, retractInd) {
    // 获取连线
    var pointerLine = findPointerLine(pointer, pointerData);
    if (pointerLine.length > 0) {
        var nextStep = pointerLine[0].target,
            beforeStep = pointerLine[0].source;
        // 如果是单线，则直接加入代码
        if (pointerLine.length == 1) {
            if (nextStep.value != 'IF 终点') {
                if (nextStep.type != 'decision') {
                    if (beforeStep.value == 'IF 终点') {
                        retractInd--
                    }
                    if (nextStep.value == 'for 终点') {
                        retractInd--;
                    } else if (beforeStep.type == 'circulate') {
                        retractInd++;
                        pushStack.push(makeLine(nextStep, retractInd))
                    } else {
                        pushStack.push(makeLine(nextStep, retractInd))
                    }
                }
                ifBranch(nextStep, pointerData, pushStack, retractInd);
            } else if (nextStep.value == 'IF 终点') {
                return;
            }


        }


    }

};




/**
 * 生成调用流程
 */
// 缩进间隔
var retractInd = 1
FlowGraph.prototype.makeProgress = function () {
    // 初始化缩进
    retractInd = 1;
    // 初始化if结束状态
    ifEndStatus = 0;
    // 代码块，是分支，否分支
    var callStack = [],
        yesStack = [],
        noStack = [],
        ifEndStack = [];
    // 获取所有点
    var pointerData = this.startPointer.parent.children;
    // 起点
    function fineNextStep(pointer, pointerData) {
        // 获取连线
        var pointerLine = findPointerLine(pointer, pointerData);
        if (pointerLine.length == 0) {
            return;
        } else {
            var nextStep = pointerLine[0].target,
                beforeStep = pointerLine[0].source;
            // 如果是单线，则直接加入代码
            if (pointerLine.length == 1) {
                if (nextStep.value == 'IF 终点') {
                    return
                } else {
                    if (nextStep.type != 'decision') {
                        if (nextStep.value == 'for 终点') {
                            retractInd--
                        } else if (nextStep.type == 'circulate') {
                            callStack.push(makeLine(nextStep, retractInd))
                            retractInd++;
                        } else {
                            callStack.push(makeLine(nextStep, retractInd))
                        }
                    }
                    fineNextStep(nextStep, pointerData);
                }

            } else if (pointerLine.length == 2) {
                callStack.push(addRetract(retractInd) + 'if ' + beforeStep.value + ' :')
                retractInd++;
                var yesLine, noLine, yesNextStep, noNextStep
                // 获取是、否分支
                for (var i = 0; i < pointerLine.length; i++) {
                    if (pointerLine[i].value == '是') {
                        yesLine = pointerLine[i];
                        yesNextStep = pointerLine[i].target;
                        if (yesNextStep.value != 'IF 终点') {
                            yesStack.push(makeLine(yesNextStep, retractInd))
                        }
                        // 是分支
                        ifBranch(yesNextStep, pointerData, yesStack, retractInd)
                    } else if (pointerLine[i].value == '否') {
                        noLine = pointerLine[i];
                        noNextStep = pointerLine[i].target;
                        noStack.push(addRetract(retractInd - 1) + 'else :')
                        if (noNextStep.value != 'IF 终点') {
                            noStack.push(makeLine(noNextStep, retractInd))
                        }
                        // 否分支
                        ifBranch(noNextStep, pointerData, noStack, retractInd)
                    }
                }
                // 如果分支为空时，添加pass函数
                if (yesStack.length == 0) {
                    yesStack.push(addRetract(retractInd) + 'pass')
                }
                if (noStack.length == 1) {
                    noStack.push(addRetract(retractInd) + 'pass')
                }
                callStack = callStack.concat(yesStack)
                callStack = callStack.concat(noStack)

            }
        }
    }
    fineNextStep(this.startPointer, pointerData)
    // if终点后续数据
    function fineIFEndNextStep(pointer, pointerData) {
        // 获取连线
        var pointerLine = findPointerLine(pointer, pointerData);
        if (pointerLine.length == 0) {
            return;
        } else {
            var nextStep = pointerLine[0].target,
                beforeStep = pointerLine[0].source;
            if (pointerLine.length == 1) {

                if (nextStep.type != 'decision') {
                    if (beforeStep.value == 'IF 终点') {
                        retractInd--
                    }
                    if (nextStep.value == 'for 终点') {
                        retractInd--
                    } else if (nextStep.type == 'circulate') {
                        callStack.push(makeLine(nextStep, retractInd))
                        retractInd++;
                    } else {
                        callStack.push(makeLine(nextStep, retractInd))
                    }
                }
                fineIFEndNextStep(nextStep, pointerData);
            } else {
                return;
            }
        }

    }
    var ifEndPointer = findIFEndLine(pointerData);
    fineIFEndNextStep(ifEndPointer, pointerData)


    return callStack;
}
// 返回缩进的空格
function addRetract(retractInd) {
    var result = '';
    for (let i = 0; i < retractInd; i++) {
        result += GLOBAL.INDENT;
    }
    return result;
}
















FlowGraph.prototype.generate = function () {
    try {
        this.classify();
        var result = []
        var callStack = this.makeProgress()

        var keys = this.codeBlockList.keyArray();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            result.push(this.codeBlockList.get(key).getCodeBlock())
        }


        var methodDeclares = result.join('\n\n')
        var mainContent = GLOBAL.MAIN_START + '\n' + callStack.join('\n')
        return methodDeclares + '\n'.repeat(2) + mainContent
    } catch (err) {
        editor.setValue('')
    }
}

// 判断流程图配置
function makeLine(cell, retractInd) {
    if (cell.type == 'circulate') {
        if (cell.value == 'for') {
            alert('请为for循环函数配置参数');
            editor.setValue('')
            throw (new Error())
        } else {
            return addRetract(retractInd) + cell.getRealInput() + ':';
        }
    } else {
        var realInput = cell.getRealInput();
        var configStr = cell.getConfig();
        configStr = configStr ? configStr : JSON.stringify({ name: cell.getMethodName() });
        var config = JSON.parse(configStr);
        config.input = config.input || '';
        if (!config.input && cell.getInput() != "") {
            alert('请为' + cell.getValue() + '(' + cell.getMethodName() + ')函数配置参数');
            editor.setValue('')
            throw (new Error())
        }
        if (config.output) {
            return addRetract(retractInd) + config.output + ' = ' + config.name + '(' + realInput + ')'
        } else {
            return addRetract(retractInd) + config.name + '(' + realInput + ')'
        }
    }
}



FlowGraph.prototype.classify = function () {
    this.codeBlockList.clear()
    this.callList.length = 0;
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var cells = graph.getChildVertices(parent);
    cells.forEach(function (element) {
        var type = element.getType();
        if (type == 'codeblock') {
            this.codeBlockList.put(element.getBlockId(), element)
            this.callList.push(element)
        } else if (type == 'decision') {
            if (element.getValue() == 'IF') {
                alert('请设置判断条件');
                throw '请设置判断条件'
            }
            this.callList.push(element)
        }
    }, this);
}


FlowGraph.prototype.getVarsStack = function () {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var cells = graph.getChildVertices(parent);
    cells.forEach(function (element) {
        var type = element.getType();
        if (type == 'codeblock') {
            var configItem = JSON.parse(element.getConfig())
            if (configItem.output) {
                this.contextVars.push(configItem)
            }
        }
    }, this);
}

FlowGraph.prototype.getSelectedCell = function () {
    return this.graph.getSelectionCell();
}

// 更新参数
FlowGraph.prototype.updateBlock = function (id, methodId, input, output, name, displayName, realInput) {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    var cell = model.getCell(id)
    model.beginUpdate()
    if (cell) {
        try {
            var config = {}
            config.methodId = methodId;
            config.input = input;
            config.output = output;
            config.name = name;
            cell.setConfig(JSON.stringify(config))
            cell.setParamsName(output);
            cell.setRealInput(realInput);
            //cell.valueChanged('(' + output + ')' + name + '(' + input + ')')
            model.setValue(cell, '(' + output + ') : ' + displayName + '(' + input + ')');
        } finally {
            model.endUpdate();
        }
    }

}

// 更新for循环
FlowGraph.prototype.updateForCell = function (id, forInd, forObj, forIndReal, forObjReal) {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    var cell = model.getCell(id)
    model.beginUpdate()
    if (cell) {
        cell.setRealInput('for ' + forIndReal + ' in ' + forObjReal);
        try {
            model.setValue(cell, 'for ' + forInd + ' in ' + forObj)
        } finally {
            model.endUpdate();
        }
    }

}

FlowGraph.prototype.updateCell = function (id, value) {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var model = graph.getModel();
    var cell = model.getCell(id)
    model.beginUpdate()
    if (cell) {
        try {
            model.setValue(cell, value)
        } finally {
            model.endUpdate();
        }
    }

}

// 获取流程图内容
FlowGraph.prototype.flowChartContent = function () {
    var graph = this.graph;
    var encoder = new mxCodec();
    var node = encoder.encode(graph.getModel());
    mxUtils.popup(mxUtils.getXml(node), true);
    return node;
}

// 加载xml
FlowGraph.prototype.loadXml = function (xml) {
    var graph = this.graph;
    var model = graph.getModel();
    var req = mxUtils.load(xml);
    var root = req.getDocumentElement();
    var dec = new mxCodec(root.ownerDocument);
    model.beginUpdate();
    try {
        dec.decode(root, model);
    } finally {
        model.endUpdate();
    }
    // 设置流程图起始点
    var graphNodes = graph.getDefaultParent().children;
    var graphNodeLen = graphNodes.length;
    if (graphNodeLen >= 1) {
        this.startPointer = graphNodes[0];
        for (var i = graphNodeLen - 1; i > 0; i--) {
            // 处理连线、if分支节点被设置成起点或者终点的问题
            if (graphNodes[i].value != '' && graphNodes[i].value != '是' && graphNodes[i].value != '否') {
                this.lastPointer = graphNodes[i];
                this.linkSource = graphNodes[i];
                return;
            }
        }
    } else {
        console.log('导入的xml文件格式错误');
    }
    // 居中调整
    graph.center();
}

// 清除流程图
FlowGraph.prototype.clearGraph = function (containerId) {
    this.codeBlockList.clear();
    this.callList.length = 0;

    // 清除所有的点
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var cells = graph.getChildVertices(parent);
    graph.removeCells(cells);

    var container = document.getElementById(containerId);
    var w = $(container).width();
    var x = w / 2 - 40;
    var model = graph.getModel();
    model.beginUpdate();

    try {
        var v1 = graph.insertVertex(parent, null, '开始', x, 20, 80, 30);
        this.lastPointer = v1;
        this.startPointer = v1;
        // 选中连线对象
        this.linkObj = '';
        // 插入连接的起点、终点
        this.linkSource = v1;
        this.linkTarget = '';
    } finally {
        model.endUpdate();
    }
};
// 返回方法的输出参数
function findOutput(name, data) {
    for (var i = 0; i < data.length; i++) {
        var element = data[i];
        if (element.methodTitle == name) {
            return element.output;
        }
    }
};


// 获取所有参数ref
FlowGraph.prototype.getJparams = function () {
    var graph = this.graph;
    var parent = graph.getDefaultParent();
    var cells = parent.children;
    // 获取所有方法
    var fnParams = '';
    // 方法的参数
    var refParams = [{
        name: '其他',
        output: []
    }];
    cells.forEach(function (item) {

        if (item.paramsName) {
            console.log(item)
            if (!fnParams) {
                fnParams = eval('(' + decodeURIComponent(item.dataJson) + ')');
            }
            refParams.push({
                name: item.paramsName,
                output: findOutput(item.displayName, fnParams)
            });
        }
    })
    return refParams;
}