
> QingUI是一个UI组件库<br>
> 目前拥有的组件：DatePicker, TimePicker, Paginator, Tree, Cascader, Checkbox, Radio, Switch, InputNumber, Input<br>
> ES6语法编写，无依赖<br>
> 原生模块化，Chrome63以上支持，请开启静态服务器预览效果，[静态服务器传送门](https://github.com/veedrin/qing/tree/master/server)<br>
> 采用CSS变量配置样式<br>
> 辛苦造轮子，欢迎来github仓库star：[QingUI](https://github.com/veedrin/qing)<br>
> 四月份找工作，求内推，坐标深圳

## 写在前面

去年年底项目中尝试着写过一个分页的Angular组件，然后就有了写QingUI的想法

过程还是非常有意思的

接下来我会用几篇文章分别介绍每个组件的大概思路，请大家耐心等待

这一篇介绍Tree树结构

最重要的，求star，求内推

> repo: [QingUI](https://github.com/veedrin/qing)

## 少废话，先上图

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/tree.png)

## 渲染

作为树组件，想都不用想，肯定用递归

但是QingUI的组件统一用一个`div.qing qing-component`包裹，所以用div把递归函数包起来

```javascript
const tpl = `
    <div class="qing qing-tree">
        ${this.renderTrunk(this.data)}
    </div>
`;
```

然后我们再来看`renderTrunk`函数

首先简要介绍一下标签结构

```html
<div class="trunk">
    <div class="fruit">
        <span class="arrow"></span>
        <span class="cb"></span>
        <span class="label"></span>
    </div>
    <div class="sub"></div>
</div>
```

trunk可以理解为树的一项，是树干

fruit是包裹信息用的，里面有三角箭头，checkbox和label

如果它有子项，则fruit后面再加一个sub，sub里面当然又是一个或多个trunk

### indent

Tree配置项里有一个`indent`，指的是所有的子项相对于父项缩进的距离

顶层项没有父项，所以不需要缩进

于是我们就需要在递归的时候判断，现在是顶层项还是子项

这个简单

```javascript
// data是递归函数传进来的
const inner = data !== this.data;
```

于是我们的缩进也解决了

```javascript
const marginLeft = `${inner ? `style="margin-left: ${this.indent}px;"` : ''}`;
```

### expand

Tree配置项里还有一个`expand`，它有三个选项：none、all和first

它决定的是初始加载的时候子项是全部闭合、全部展开还是只有第一个顶层项展开

子项是否展开是如何控制的呢？

当然是通过高度，`height: 0; overflow: hidden;`的时候闭合，`height: auto; overflow: hidden;`的时候展开

于是就成了下面这样

expand等于first时，意思是只有顶层项的第一项才会展开

这里有一个小技巧

expand我们给了三个可选项，但是万一用户偏偏传个`hello`进来呢？

反正none是默认项，条件判断的时候，我只认all和first，除此之外都是默认配置

这属于对错误参数的静默处理，我也不告诉你传错了，但是你也别想要任何效果

这样就不需要对参数多做一个校验了

```javascript
for (let i = 0; i < data.length; i++) {
    let arrowTpl, subTpl;
    if (this.expand === 'all') {
        arrowTpl = '<span class="arrow active"></span>';
        subTpl = '<div class="sub" style="height: auto;">';
    } else if (this.expand === 'first') {
        const boo = !inner && i === 0;
        arrowTpl = boo ? '<span class="arrow active"></span>' : '<span class="arrow"></span>';
        subTpl = `<div class="sub" ${boo ? 'style="height: auto;"' : ''}>`;
    } else {
        arrowTpl = '<span class="arrow"></span>';
        subTpl = '<div class="sub">';
    }
}
```

### fruit

fruit这里，如果没有子项，是不需要三角箭头的

另外不需要checkbox的话就不显示checkbox，只作为树结构展示用

```javascript
tpl += `
    <div class="fruit">
        ${item.sub ? arrowTpl : '<span class="blank"></span>'}
        ${this.checkable ? '<span class="cb"></span>' : ''}
        <span class="label">${item.label}</span>
    </div>
`;
```

最后，如果有子项，别忘了递归

```javascript
if (item.sub) {
    tpl += subTpl;
    tpl += this.renderTrunk(item.sub);
}
```

整个模板部分大概就是这样子的

我们看一下全貌：

```javascript
render() {
    const tpl = `
        <div class="qing qing-tree">
            ${this.renderTrunk(this.data)}
        </div>
    `;
    this.$mount.innerHTML = tpl;
}

renderTrunk(data) {
    const inner = data !== this.data;
    const marginLeft = `${inner ? `style="margin-left: ${this.indent}px;"` : ''}`;
    let tpl = '';
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        tpl += `<div class="trunk" ${marginLeft}>`;
        let arrowTpl, subTpl;
        if (this.expand === 'all') {
            arrowTpl = '<span class="arrow active"></span>';
            subTpl = '<div class="sub" style="height: auto;">';
        } else if (this.expand === 'first') {
            const boo = !inner && i === 0;
            arrowTpl = boo ? '<span class="arrow active"></span>' : '<span class="arrow"></span>';
            subTpl = `<div class="sub" ${boo ? 'style="height: auto;"' : ''}>`;
        } else {
            arrowTpl = '<span class="arrow"></span>';
            subTpl = '<div class="sub">';
        }
        tpl += `
            <div class="fruit">
                ${item.sub ? arrowTpl : '<span class="blank"></span>'}
                ${this.checkable ? '<span class="cb"></span>' : ''}
                <span class="label">${item.label}</span>
            </div>
        `;
        if (item.sub) {
            tpl += subTpl;
            tpl += this.renderTrunk(item.sub);
            tpl += '</div>';
        }
        tpl += '</div>';
    }
    return tpl;
}
```

## 映射

当我需要点击checkbox导致data的某个对象的checked属性变更时，我的做法是维护一套DOM结构的映射

映射跟DOM结构是一一对应的，跟data也是一一对应的

它可以很好的作为桥梁同步数据

为什么不直接操作data呢？

data是用户传进来的结构化数据，后面还需要通过回调传回去的，我们不应该修改用户的数据结构

映射需要保存些什么？

- 保存对应的DOM节点

- 保存checked属性的值

- 保存当前节点在树结构中的位置

### queue

一个小问题，如何保存当前节点在树结构中的位置呢？

当我们说在树结构中的位置的时候，我们想知道的是当前节点在第几级，以及当前节点在该级的第几个

我用queue关键字来保存位置信息，可能不是非常语义化，你来打我呀！

举个栗子

假如我要知道宋佳的位置，queue的值为`'111'`，表示它是一个三级子项，它的爷爷第一级是第二项，它的爹爹第二级也是第二项，它自己也是第二项

```javascript
data = [
    {
        label: '霍思燕',
    },
    {
        label: '江疏影',
        sub: [
            {
                label: '倪妮',
            },
            {
                label: '高圆圆',
                sub: [
                    {
                        label: '张雨绮',
                    },
                    {
                        label: '宋佳',
                    },
                ],
            },
        ],
    },
];
```

ES6有一个新特性，如果对象的键和值变量是一样的，那么不需要写冒号，又给你省了不少时间可以用来浪费，开不开心！

```javascript
buildCbTree(fatherCb, item) {
    const childCbs = fatherCb.children;
    for (let i = 0; i < childCbs.length; i++) {
        const fruit = childCbs[i].firstElementChild;
        const sub = fruit.nextElementSibling;
        const cb = fruit.firstElementChild.nextElementSibling;
        const checked = cb.classList.contains('checked');
        const queue = item.queue ? item.queue + String(i) : String(i);
        let obj = {cb, checked, queue};
        if (sub) {
            obj.sub = [];
            this.buildCbTree(sub, obj);
        }
        item.sub.push(obj);
    }
}
```

它的初始参数是什么呢？

`this.$mount.firstElementChild`就是开始加的包裹元素，上面有标识QingUI的class，所以它就是根元素

```javascript
this.buildCbTree(this.$mount.firstElementChild, {sub: this.cbTree});
```

## checkbox事件

我们先来捋一捋，当我们点击某一项的checkbox时

它自己只有两种状态，要么`checked`，要么去除`checked`

如果它有子项，则所有子项以及孙项以及所有的后代项跟随它的脚步，要么全部`checked`，要么全部去除`checked`

但是如果它有父项（它是有可能没有父项的，如果自己是顶层项的话），需要根据自己的兄弟来决定父项的`checked`属性，依照这个逻辑往上递归

如果自己和兄弟都去除了`checked`，则父项去除`checked`

如果自己和兄弟都`checked`，则父项`checked`

如果自己或者兄弟至少有一个`checked`，则父项`somechecked`

所以每一次点击都要做三条线的处理

```javascript
$cb.addEventListener('click', function(event) {
    event.stopPropagation();
    const checked = !this.classList.contains('checked');
    // cb事件
    checked ? self.$cbEvent(item, 'all') : self.$cbEvent(item, 'none');
    // cb子代事件
    checked ? self.childCbsEvent($sub, 'all') : self.childCbsEvent($sub, 'none');
    // cb父代事件
    self.fatherCbsEvent(queue);
});
```

## checkbox自代事件

自己虽然只有两种状态，但我们可以把它作为抽象函数，因为无论是父项、子项还是自己，都是checkbox而已，只不过是一个还是多个

所以我们给它三种状态，作为action参数传进来

```javascript
$cbEvent(item, action) {
    const $cb = item.cb;
    const CL = $cb.classList;
    switch (action) {
        case 'all':
            item.checked = true;
            CL.contains('somechecked') ? CL.remove('somechecked') : '';
            CL.add('checked');
            break;
        case 'some':
            item.checked = false;
            CL.contains('checked') ? CL.remove('checked') : '';
            CL.add('somechecked');
            break;
        case 'none':
            item.checked = false;
            CL.contains('somechecked') ? CL.remove('somechecked') : '';
            CL.contains('checked') ? CL.remove('checked') : '';
            break;
    }
}
```

## checkbox子代事件

子代事件也只有两种状态，跟自身同步

只需要递归就好了

需要提醒的是，这里所有的操作都是针对映射`cbTree`进行的

```javascript
childCbsEvent($sub, action) {
    if (!$sub) {
        return;
    }
    const self = this;
    function recursive($sub) {
        for (const $item of $sub) {
            self.$cbEvent($item, action);
            if ($item.sub) {
                recursive($item.sub);
            }
        }
    }
    recursive($sub);
}
```

## checkbox父代事件

要决定父项的状态，先要找到自己的兄弟，家族财产怎么分割，还得兄弟一起商量

兄弟怎么找呢？

先要找到包裹自己和兄弟的那个实体，你才能遍历呀，这时候queue就派上用场了

现在我知道实体的位置，只需要`this.cbTree[a][b][c]`这么找下去不就完了！

```javascript
findFatherItem(queue) {
    const n = queue.length - 1;
    // 顶级item没有父item
    if (n === 0) {
        return;
    }
    let fatherItem = this.cbTree;
    for (let i = 0; i < n; i++) {
        const char = queue.charAt(i);
        if (i < n - 1) {
            fatherItem = fatherItem[char].sub;
        } else {
            fatherItem = fatherItem[char];
        }
    }
    return fatherItem;
}
```

找到了实体，接下来遍历就行了

当然，这里面的兄弟实际上是包括自己的

因为DOM操作比较慢，我原以为这里做计算的时候，有可能自身的class变更还没生效呢

因为在我的印象里，DOM操作好像是异步的，其实不是的，所以把自己纳入进来是没问题的

```javascript
findSiblingCbs($sub) {
    let $siblingCbs = [];
    for (const $item of $sub) {
        $siblingCbs.push($item.cb);
    }
    return $siblingCbs;
}
```

最后就是根据最初的逻辑把结果丢进那个抽象函数里

当然，记住树结构里一切都是递归的

```javascript
fatherCbsEvent(queue) {
    const fatherItem = this.findFatherItem(queue);
    if (!fatherItem) {
        return;
    }
    const $siblingCbs = this.findSiblingCbs(fatherItem.sub);
    let allFlag = true;
    let noneFlag = true;
    for (const $item of $siblingCbs) {
        const cl = $item.classList;
        if (!cl.contains('checked')) {
            allFlag = false;
        }
        if (cl.contains('checked') || cl.contains('somechecked')) {
            noneFlag = false;
        }
        // flag全都已经变化，退出循环
        if (!allFlag && !noneFlag) {
            break;
        }
    }
    if (allFlag) {
        this.$cbEvent(fatherItem, 'all');
    } else if (noneFlag) {
        this.$cbEvent(fatherItem, 'none');
    } else {
        this.$cbEvent(fatherItem, 'some');
    }
    this.fatherCbsEvent(fatherItem.queue);
}
```

## 更新data

不知道你们意识到没有，上面做的所有事，仅仅是改变了DOM样式和映射cbTree

用户想在回调里拿到的是一开始传进来的data呀

不过这好办，因为cbTree好data的结构是一毛一样的

只需要一个递归就解决问题

最终我们得到的data就是checked属性已经产生变化的data

```javascript
updateData(tree, data) {
    for (let i = 0; i < tree.length; i++) {
        const ti = tree[i];
        const di = data[i];
        if (ti.checked) {
            di.checked = true;
        } else {
            di.checked = false;
        }
        if (ti.sub) {
            this.updateData(ti.sub, di.sub);
        }
    }
}
```

## 高度动画

前面讲`expand`配置项的时候，我们提到过高度为0或是auto的问题

初始是什么没关系

我们想让展开或收起的过程更加平滑一点

然而我们知道`height: auto;`是无法产生CSS动画的，CSS动画必须得有一个确定的数值

那么怎么办呢？

有人说可以用`max-height`属性，给`max-height`一个很大的固定的值，就可以产生动画了

我觉得这样，动画效果不会好，而且很不优雅

试想一下，比如说现在高度是0，我能不能把高度改成auto，再通过JS计算出真实的高度，再把高度改成0

现在我们手里有它本来的确定的高度值，就可实现动画了

最后又把它的高度改成auto，因为它有可能有子项，固定高度会出问题的

有点绕，看代码

```javascript
subHeightToggle($sub) {
    let h = $sub.getBoundingClientRect().height;
    if (h > 0) {
        // 从auto变成具体的值
        $sub.style.height = `${h}px`;
        setTimeout(() => {
            $sub.style.height = '0px';
        }, 0);
    } else {
        $sub.style.height = 'auto';
        h = $sub.getBoundingClientRect().height;
        $sub.style.height = '0px';
        setTimeout(() => {
            $sub.style.height = `${h}px`;
        }, 0);
        // 动画完成变成auto
        setTimeout(() => {
            $sub.style.height = 'auto';
        }, 200);
    }
}
```

我们老是说尽量不要操作DOM，其实这是要看付出回报比的，如果能够实现平滑效果，实现方式又足够优雅

咱们的计算机没你说的那么脆弱

## 写在后面

Tree比较核心的逻辑就在这里了

树结构算是QingUI里比较难的组件了，其中的实现方式我也试过好几版

越是难，其实越有成就感

下一篇文章介绍Cascader，敬请期待

最后，求star，求内推

> repo: [QingUI](https://github.com/veedrin/qing)
