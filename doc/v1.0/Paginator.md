
> QingUI是一个UI组件库<br>
> 目前拥有的组件：DatePicker, TimePicker, Paginator, Tree, Cascader, Checkbox, Radio, Switch, InputNumber, Input<br>
> ES6语法编写，无依赖<br>
> 原生模块化，Chrome63以上支持，请开启静态服务器预览效果，[静态服务器传送门](https://github.com/veedrin/qing/tree/master/server)<br>
> 采用CSS变量配置样式<br>
> 辛苦造轮子，欢迎来github仓库star：[https://github.com/veedrin/qing](https://github.com/veedrin/qing)<br>
> 四月份找工作，求内推，坐标深圳

## 写在前面

去年年底项目中尝试着写过一个分页的Angular组件，然后就有了写QingUI的想法

过程还是非常有意思的

接下来我会用几篇文章分别介绍每个组件的大概思路，请大家耐心等待

这一篇介绍Paginator分页

最重要的，求star，求fork，求内推

> repo: [QingUI](https://github.com/veedrin/qing)

## 少废话，先上图

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/paginator.png)

## 为什么要有分页

一般的需求是，我有一个列表，但是我不想一下让用户看这么多，一次看一点，再想看，翻到下一页

当然现在有无限滚动，只要滚动到一定距离，就给你加载新的数据，这个我们不考虑

分页也有两种做法，一种是一次性加载所有数据，前端做分页；一种是每次加载一部分，点击分页就是触发再次加载的动作

第一种做法应该很少见了吧，首次加载的压力太大

## 分页怎么工作

页面初始加载的时候向后台请求数据，请求哪些数据呢？要显示的列表信息，还有当前是第几页

如果每页显示多少条是可配置的，那么还需要每页显示多少条和总条数

初始加载肯定是第一页

然后用户看完第一页，往下翻，可能是翻到第二页，也可能是翻到后面的任一页，无所谓

我们获取到用户想翻到第几页的信息以后，传给后端，后端再把相应页的列表信息传过来，前端展示

注意，这个时候分页是要变的，用户点击的那一页要高亮，之前那一页去掉高亮，如果页数比较多，省略号的位置也要根据规则发生变化

所以我们得出一个重要信息，分页组件展示页码的那一块每次点击都是要重新渲染的

`$bar`就是展示页码的容器，展示页码的模板封装到另一个函数里

一开始能想到这个，后面就不需要推倒重来了，你猜我有没有推倒重来 :)

```javascript
tpl += `
    <div class="square end prev">﹤</div>
    <div class="bar"></div>
    <div class="square end next">﹥</div>
`;
```

## 数据模型

如果我们把展示逻辑放到模板渲染函数里，那模板渲染函数会变得非常繁杂

我们可以分成两步，第一步构建数据模型，第二步根据数据模型生成模板

我仔细的观察过GitHub（GitHub已经非常优美了）的分页逻辑，QingUI的分页逻辑就是根据GitHub来的

我总结了一下，代码注释里也有：

- 首页和尾页必须展示

- 如果有省略号则首尾只展示一条，当前页前后各展示两条共五条，一边没有空间则叠加到另一边

- 首尾页与当前页五条可以重合

- 跨度大于等于两条才出现省略号，省略号用0表示

哦，忘了解释，数据模型是怎么映射的

分页都是从1开始，最大随意（一般不会太大），所以我们构建一个数组，1到正无穷就代表1到正无穷页，0代表省略号

### 总页数在1到7页之间

1到7页之间可以完全展示，为什么？

首尾各1页，中间共5页，加起来就是7页，超过7页就会有省略号

不是说跨度大于等于2页才会有省略号吗？

因为首页和中间的5页是可以重合的，如果有8页，前面5页和最后1页中间正好隔了2页

所以1到7页之间可以完全展示

```javascript
for (let i = 1; i <= c; i++) {
    this.model.push(i);
}
```

### 总页数7页以上且当前页小于4

如果当前页小于4，至少要保证当前页加左右至少有5页，所以这种情况要单独拎出来

后面再加一个省略号，以及尾页

```javascript
for (let i = 1; i <= 5; i++) {
    this.model.push(i);
}
this.model.push(0, c);
```

### 总页数7页以上且当前页小于6

这种情况就是首页和中间5页不重合的情况，所以for循环不需要写死

同样，后面再加一个省略号，以及尾页

```javascript
for (let i = 1; i <= p + 2; i++) {
    this.model.push(i);
}
this.model.push(0, c);
```

### 总页数7页以上且当前页小于总页数减4

这种情况就是距离首页的跨度大于等于2，距离尾页的跨度也大于等于2，于是前后都有省略号

```javascript
this.model.push(1, 0);
for (let i = p - 2; i <= p + 2; i++) {
    this.model.push(i);
}
this.model.push(0, c);
```

### 总页数7页以上且当前页小于总页数减1

这种情况是说后面没有省略号了，但是也不至于和尾页产生重合

```javascript
this.model.push(1, 0);
for (let i = p - 2; i <= c; i++) {
    this.model.push(i);
}
```

### 总页数7页以上且当前页等于总页数减1或者等于总页数

中间5页与尾页产生重合了，至少要保证渲染出5页，所以for循环写死

```javascript
this.model.push(1, 0);
for (let i = c - 4; i <= c; i++) {
    this.model.push(i);
}
```

### 总结

6种情况：

- 没有省略号

- 前面有省略号但是中间5页与首页重合

- 前面有省略号且中间5页与首页不重合

- 前面和后面都有省略号

- 后面有省略号且中间5页与尾页不重合

- 后面有省略号但是中间5页与尾页重合

还是挺有规律的是吧

数据模型代码

```javascript
buildModel() {
    // 每次重新初始化
    this.model = [];
    const c = this.pageCount, p = this.position;
    if (c < 8) {
        for (let i = 1; i <= c; i++) {
            this.model.push(i);
        }
    } else {
        if (p < 4) {
            for (let i = 1; i <= 5; i++) {
                this.model.push(i);
            }
            this.model.push(0, c);
        } else if (p < 6) {
            for (let i = 1; i <= p + 2; i++) {
                this.model.push(i);
            }
            this.model.push(0, c);
        } else {
            if (p < c - 4) {
                this.model.push(1, 0);
                for (let i = p - 2; i <= p + 2; i++) {
                    this.model.push(i);
                }
                this.model.push(0, c);
            } else if (p < c - 1) {
                this.model.push(1, 0);
                for (let i = p - 2; i <= c; i++) {
                    this.model.push(i);
                }
            } else {
                this.model.push(1, 0);
                for (let i = c - 4; i <= c; i++) {
                    this.model.push(i);
                }
            }
        }
    }
}
```

如果你不喜欢GitHub分页规则，或者自己有特殊的需求

可以根据上面的规律自己定制一套分页逻辑

真的，往上套就可以了

## 渲染

数据模型都构建出来了，渲染就简单了

```javascript
for (const item of this.model) {
    if (item > 0) {
        if (this.position !== item) {
            tpl += `<div class="square page">${item}</div>`;
        } else {
            tpl += `<div class="square page active">${item}</div>`;
        }
    } else {
        tpl += '<div class="square gap">···</div>';
    }
}
```

## prev和next置灰

在某些情况，我们要让用户知道往前或者往后点击是无效的，要进行置灰处理

规则也挺简单的

### 如果当前页是第1页

```javascript
if (this.position === 1) {
    this.$prev.classList.add('disabled');
    this.$next.classList.remove('disabled');
}
```

### 如果当前页是最后1页

```javascript
if (this.position === this.pageCount) {
    this.$next.classList.add('disabled');
    this.$prev.classList.remove('disabled');
}
```

### 如果当前页既不是第1页也不是最后1页

```javascript
if (this.position === this.pageCount) {
    this.$prev.classList.remove('disabled');
    this.$next.classList.remove('disabled');
}
```

### 如果总页数是1

这种情况很容易被忽略

如果总共只有1页，那左右都点不了，而且立即返回

```javascript
if (this.pageCount === 1) {
    this.$prev.classList.add('disabled');
    this.$next.classList.add('disabled');
    return;
}
```

## 可以配置每页显示多少条

这里主要是注意一个问题

假如现在的当前页是比较靠后的位置

然后我增加每页显示的条数，那势必总页数就变小了

有可能总页数变的比当前页还小

那么这个时候就只能强制改变当前页，让它变成最后1页了

## 可以自由跳转

这就是一个输入框，加keyup监听`Enter`键的事件

## 写在后面

Paginator比较核心的逻辑就在这里了

最有意思的是构建数据模型的那一段，挺费脑子的

下一篇文章介绍Tree，敬请期待

最后，求star，求fork，求内推

> repo: [QingUI](https://github.com/veedrin/qing)
