> QingUI是一个UI组件库<br>
> 目前拥有的组件：DatePicker, TimePicker, Paginator, Tree, Cascader, Checkbox, Radio, Switch, InputNumber, Input<br>
> ES6语法编写，无依赖<br>
> 原生模块化，Chrome63以上支持，请开启静态服务器预览效果，[静态服务器传送门](https://github.com/veedrin/qing/tree/master/server)<br>
> 采用CSS变量配置样式<br>
> 辛苦造轮子，欢迎来github仓库star：[QingUI](https://github.com/veedrin/qing)

## 写在前面

去年年底项目中尝试着写过一个分页的Angular组件，然后就有了写QingUI的想法

过程还是非常有意思的

接下来我会用几篇文章分别介绍每个组件的大概思路，请大家耐心等待

这一篇介绍Cascader级联选择器

点个star就是对我最好的支持

> repo: [QingUI](https://github.com/veedrin/qing)

## 少废话，先上图

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/cascader.png)

## 数据

既然是级联选择器，数据肯定是树形结构，像这样

```javascript

const data = [
    {
        label: '霍思燕',
        sub: [
            {
                label: '江疏影',
            },
            {
                label: '倪妮',
            },
        ],
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
];
```

你猜我最喜欢哪位女明星 :)

而且用户点到哪一个label上，就呼出下一级列表

那么问题来了，我怎么知道我当前在哪一级，又在哪一个分支？

所以我需要给每一个分支做标记，点到哪一个label上，就取出标记，该标记能指引我找到对应的数据分支

我的方法是这样的，新建一个字段queue，字段值是一个字符串形式的数字，位数表示当前是第几级，数字表示当前是第几个分支

比如说`queue = 131;`，表示当前在第一个分支下面的第三个分支下面的第一个分支

```javascript
buildQueue(data, queue = '') {
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const sub = item.sub;
        const newQueue = `${queue}${i}`;
        item[this.queue] = newQueue;
        if (sub) {
            this.buildQueue(sub, newQueue);
        }
    }
}
```

字段名其实我并没有用queue，因为有可能已经被占用，我用的是时间戳组成的hash值，所以赋值的时候要写成`item[this.queue] = newQueue;`

渲染的时候给DOM元素加一个`data-v="${item[this.queue]}`就行了

那么怎么读呢？

这些数字其实就是数组的索引，加一个递归搞定

```javascript
findSubByQueue(data, queue) {
    const n = Number.parseInt(queue.charAt(0));
    for (let i = 0; i < data.length; i++) {
        if (i === n) {
            if (queue.length > 1) {
                return this.findSubByQueue(data[i].sub, queue.slice(1));
            } else {
                return data[i].sub;
            }
        }
    }
}
```

## 事件

级联肯定要支持点击和悬浮两种事件触发机制

所以我用`this.eventType`来保存事件类型，其实两种事件大部分代码是可以复用的

```javascript
for (let i = 0; i < $trunks.length; i++) {
    const $trunk = $trunks[i];
    const v = $trunk.dataset.v;
    const label = $trunk.querySelector('.label').innerHTML;
    const CL = $trunk.classList;
    $trunk.addEventListener(this.eventType, function(event) {
        event.stopPropagation();
        // 遍历清除trunk的active
        self.removeTrunkActive($trunks);
        // 当前trunk变成active
        CL.add('active');
        // 构建路径
        self.buildPath(v.length, label, false);
        // 找到子数据
        const sub = self.findSubByQueue(self.data, v);
        // 填充子board
        $subBoard.innerHTML = self.renderCascade(sub);
        // 添加事件
        self.$rowEvent($subBoard);
    });
}
```

注释也写的很清楚，首先是一个高亮的处理，然后要把当前路径保存下来，通过queue找到子数据，然后渲染出来，最后给子节点添加事件

要知道，分支可以分为两种，一种是下面还有分支，我把它称作trunk，另一种是末梢，下面没有分支了，我把它称作leaf

点击很容易，只给trunk添加事件就可以了

但是悬浮，leaf也要有事件，就是把之前的高亮和子数据清空

```javascript
if (this.trigger === 'hover') {
    for (let i = 0; i < $leafs.length; i++) {
        $leafs[i].addEventListener('mouseenter', function() {
            self.removeTrunkActive($trunks);
            $subBoard.innerHTML = '';
        });
    }
    // 离开curtain
    this.$curtain.addEventListener('mouseleave', function() {
        self.removeTrunkActive(self.$trunks);
        self.$subBoard.innerHTML = '';
    });
}
```

那么怎么选中呢？

到leaf才是一个完整的路径，所以leaf特殊处理，无论是什么事件，点击leaf选中，把路径渲染出来

## 路径

保存路径是一个动态的过程

因为我可能查看了某一个分支，然后又查看另一个分支，最终选中了别的分支

所以保存路径要根据路径的长度和当前级别来确定是添加还是删除

比如我现在在江疏影这里，还没有选中，那么当前是第二级，路径里只保存了霍思燕，如果我选中，那么简单，直接把江疏影push到数组里，展示出来。但是如果一刹那我不想选江疏影了，我想选张雨绮（因为胸大），首先我要从霍思燕换到高圆圆，然后转到张雨绮，选中展示出来，这时候就要先删除霍思燕，然后把高圆圆和张雨绮push进来。

```javascript
buildPath(level, label, render) {
    if (this.path.length < level) {
        // 往下选择，直接push
        this.path.push(label);
    } else {
        // 退回选择，根据退回长度删除path元素，再push
        this.path = [...this.path.slice(0, level - 1), label];
    }
    if (render) {
        this.renderPath();
    }
}
```

## 搜索

突发奇想，我又想加一个搜索功能

比如说我现在搜集了好几千个女明星，打乱格式化成树形数据，那我选择起来可就困难了，难道每一个分支都查看一遍吗？如果有搜索，我只要搜张雨绮，所有包含张雨绮的级联都展示出来，是不是方便很多！

看起来很复杂的样子

其实，换一个思路，初始化的时候就把所有的路径都遍历出来，缓存在一个数组里，搜索的时候只要检索这些字符串有没有张雨绮，是不是回到我们熟悉的字符串操作上来了？

遍历所有路径

```javascript
iterateAllPath() {
    const self = this;
    let temp = [];
    const data = pathPush([...this.data]);
    function pathPush(data, arr = []) {
        for (const item of data) {
            item.path = [];
            // 将路径存入item中的数组
            item.path.push(...arr, item.label);
        }
        return data;
    }
    function recursive(data) {
        for (const item of data) {
            const sub = item.sub;
            if (sub) {
                // 将下一层放入temp
                temp.push(...pathPush(sub, item.path));
            } else {
                // 没有下一层则路径结束
                self.pathPool.push(item.path.join(self.seperator));
            }
        }
        if (temp.length) {
            // 重新初始化
            data = temp;
            temp = [];
            recursive(data);
        }
    }
    recursive(data);
}
```

```javascript
for (const item of this.pathPool) {
    const match = item.match(reg);
    if (!match) {
        continue;
    }
    result.push(item);
}
```

别急，还有需求，我想把关键词高亮

比如说我搜张雨绮，所有结果中张雨绮都要高亮

我搜张雨，所有结果中张雨都要高亮

这个也不复杂，用关键词把路径截成三段，如果关键词在首尾那就截成两段

这里有一个小问题，如果分隔符与关键词之间有空格，展示结果总是不符合预期

后来才发现，如果标签内第一个字符是空格，空格会被忽略

所以还需要小小的处理一下

```javascript
const reg = new RegExp(value, 'i');
for (const item of this.pathPool) {
    const match = item.match(reg);
    if (!match) {
        continue;
    }
    result.push(item);
    const index = match.index;
    let [left, center, right] = [item.slice(0, index), match[0], item.slice(index + value.length)];
    // 如果标签内第一个字符是空格，空格会被忽略
    if (right && right.startsWith(' ')) {
        right = `&nbsp;${right.trimLeft()}`;
    }
    tpl += `
        <div class="result">
            ${left ? `<span class="s">${left}</span>` : ''}
            <span class="s highlight">${center}</span>
            ${right ? `<span class="s">${right}</span>` : ''}
        </div>
    `;
}
if (!tpl) {
    tpl = '<div class="null">No Result</div>';
}
```

## 写在后面

Cascader比较核心的逻辑就在这里了

相较前几篇文档，隔的时间有点长，不过Cascader不会让你失望的

如果觉得QingUI还不错，点个star激励一下老夫

> repo: [QingUI](https://github.com/veedrin/qing)