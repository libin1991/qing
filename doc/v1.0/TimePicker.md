> QingUI是一个UI组件库<br>
> 目前拥有的组件：DatePicker, TimePicker, Paginator, Tree, Cascader, Checkbox, Radio, Switch, InputNumber, Input<br>
> ES6语法编写，无依赖<br>
> 原生模块化，Chrome63以上支持，请开启静态服务器预览效果，[静态服务器传送门](https://github.com/veedrin/qing/tree/master/server)<br>
> 采用CSS变量配置样式<br>
> 辛苦造轮子，欢迎来github仓库star：[https://github.com/veedrin/qing](https://github.com/veedrin/qing)

## 写在前面

去年年底项目中尝试着写过一个分页的Angular组件，然后就有了写QingUI的想法

过程还是非常有意思的

接下来我会用几篇文章分别介绍每个组件的大概思路，请大家耐心等待

这一篇介绍TimePicker日期选择器

最重要的，求star，求fork，求内推

> [QingUI](https://github.com/veedrin/qing)

## 少废话，先上图

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/time-picker.png)

## 当前时间

[介绍DatePicker的文章](https://github.com/veedrin/qing/blob/master/doc/v1.0/DatePicker.md)写的时候已经凌晨了，毕竟那天commit了50多次，所以有点草率，这回我尽量写的清楚一点

初始加载TimePicker的时候肯定显示当前的时间，所以我们首先要获取当前的时间

当前时间好说，只是ES6提供了解构赋值正好可以在这里派上用场

直接返回一个数组，需要的时候一次性赋值就好了

如果不需要这么多，没问题，ES6不仅可以批发，还可以零售，贴不贴心！

为什么秒不直接赋值呢？因为我觉得很少有场景我们需要精确到秒，还不如初始直接给个0，省的别人点一下，他要精确到秒是他的事

```javascript
constructor() {
    [this.H, this.M, ] = this.nowTime();
    this.S = 0;
}

nowTime() {
    const date = new Date();
    return [date.getHours(), date.getMinutes(), date.getSeconds()];
}
```

当用户选择的时候，选中的就会高亮，之前的高亮会取消

我们可以粗暴一点，每次点击都运行一个for循环，找到高亮，取消高亮，场子清完以后再将当前选中的高亮

不过这样性能肯定是不好的

如果我把选中的时间缓存起来

每次点击的时候我还记得上次高亮的在哪，直接处理它就好了，少了一个for循环是不是好多了

不过要注意，每次点击都要把新值缓存，它就是个跟屁虫，可不能掉队

```javascript
constructor() {
    [this.oldH, this.oldM, this.oldS] = [this.H, this.M, this.S];
}
```

## 切换

时钟、分钟、秒钟，总共有三个面板，所以我设置三个按钮，时间格动态渲染

假如用户点击时钟按钮，他要怎么辨别刚才点的是哪个按钮呢？

下意识的，我们会想到，当前活跃的，我们就给它置灰，以来作区分，二来省的用户无聊老在一个地方点来点去造成重复渲染

我以前也有过一点经验，就是`button`的`disabled`属性并不是通过true和false来控制的

真正控制它是否置灰的，是有没有这个属性

我觉得这个设计...

所以我们写一个控制置灰的函数，同样，oldDisabled是用来缓存的

```javascript
ableAndDisableEvent(ableNode) {
    if (this.oldDisabled) {
        this.oldDisabled.removeAttribute('disabled');
    }
    ableNode.setAttribute('disabled', '');
    this.oldDisabled = ableNode;
}
```

有时候我们有这样的需求，虽然点击事件是响应用户操作的，但偶尔我们自己也希望触发一下事件

用户可以触发点击事件，那么程序可以吗？

其实是可以的，`.click()`，就这么简单

说实话这个我也是第一次见，可能是我比较孤陋寡闻吧...

```javascript
this.oldDisabled.click();
```

## 转数字

当我们点击时，获取到的`innerHTML`实际上是一个字符串

我希望在入口把关，保证`this.H; this.M; this.S;`都是数字类型

于是我们就要把字符串类型的数字转成真数字，这倒不难

我曾经测过几种字符串类型的数字转成真数字的方法，当然，我说的是正整数

- parseInt()

- parseFlout()

- Number()

- Math.floor()

- num - 0

性能肯定是`num - 0`最好，但是这样并不是特别正规

除此之外，性能最好的是`parseInt()`，`parseFlout()`要考虑小数位，`Number()`估计是内部的类型转换比较复杂

除了语义化并不是特别好之外，我平常都喜欢用`parseInt()`

但这不是重点

重点是ES6在`Number`下面也挂载了该方法，`window.parseInt()`和`Number.parseInt()`都是可以的，为什么这样做呢？

因为JS的全局对象`window`实在是太复杂了，它不仅是全局对象，还是窗口对象，连所有的全局变量都挂在它下面

所以W3C希望改变这个现状，尽量减少甚至取消`window`下面的属性

这也是为什么在ES6模块内，指向全局的this等于undefined

所以，如果兼容性允许的话，尽量用`Number.parseInt()`代替`window.parseInt()`，为美妙的JS尽一份力

离`Everything Based On JavaScript`就不远了吧

## 格式化

比较正规的时间表盘都会显示两位数，比如3点20分，会写成`03: 20`

所以我们也需要一个两位数的格式化函数

为什么需要`String(num).length === 1`这个判断条件？

因为有时传进来的参数已经格式化过了，而它实际上又小于10，所以需要过滤掉它们

```javascript
twoDigitsFormat(num) {
    if (String(num).length === 1 && num < 10) {
        num = `0${num}`;
    }
    return num;
}
```

然后我再用一个漏斗函数把变化收集起来，统一更新

```javascript
timeChangeEvent(hour, minute, second) {
    hour ? this.H = hour : '';
    minute ? this.M = minute : '';
    second ? this.S = second : '';
    this.$view.innerHTML = this.timeFormat(this.H, this.M, this.S);
}
```

至于显示成最终的时间格式，我们有它

```javascript
timeFormat(hour = 0, minute = 0, second = 0) {
    hour = this.twoDigitsFormat(hour);
    minute = this.twoDigitsFormat(minute);
    second = this.twoDigitsFormat(second);
    return `${hour} : ${minute} : ${second}`;
}
```

## 写在后面

首先，这个时间选择器确实不好看，我将来可能会重构

然后，时间选择器也确实比较简单，比日期选择器代码少多了

不过还是可以自己尝试着自己写一个，一切都在细节里

下一篇文章介绍Paginator，敬请期待

最后，求star，求fork，求内推

> [QingUI](https://github.com/veedrin/qing)
