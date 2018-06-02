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

这一篇介绍DatePicker日期选择器

最重要的，求star，求fork，求内推

> [https://github.com/veedrin/qing](https://github.com/veedrin/qing)

## 少废话，先上图

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/date-picker.png)

## 实现一个类

ES6的类语法糖非常顺手，用ES6写代码就像吃德芙巧克力一样哈哈

然后DatePicker和TimePicker有一些公共的方法，我用一个公共类，让它们俩继承

extends就是继承关键字

super是用来继承父类的this对象的，它必须首先调用，否则无法找到this

主要是为了照顾对ES6不熟悉的人

```javascript
class Common {
    constructor() {}
}

class DatePicker extends Common {
    constructor() {
        super();
    }
}
```

## 日历

不知道大家观察过没有，每一页日历都是按星期来排的，展示当月的所有日期

所以，如果该月的1号不是星期一或者星期天呢？那还要从上个月抓几天过来，把空补齐，月底也一样

为了方便，下面都以星期一为一周起始日

当月所有日期容易，获取当月有多少天，for循环加到模板里

那月首补齐的呢？我要知道这个月1号是星期几，还要知道上个月最后一天是多少号，然后少几天，往前推几天就好了

月底补齐的就简单一点，我要知道这个月最后一天是星期几，然后少几天，从1号往后加几天

```javascript
const daysCountThisMonth = this.daysCountThisMonth();
const daysCountLastMonth = this.daysCountThisMonth(-1);
// weekie指的是星期几（自创）
const weekieFirstDay = this.weekieOfSomedayThisMonth(1);
const weekieLastDay = this.weekieOfSomedayThisMonth(daysCountThisMonth);

if (weekieFirstDay > 1) {
    for (let i = daysCountLastMonth - weekieFirstDay + 2; i <= daysCountLastMonth; i++) {
        tpl += `<span class="day-disable">${i}</span>`;
    }
}
for (let i = 1; i <= daysCountThisMonth; i++) {
    tpl += `<span class="day">${i}</span>`;
}
if (weekieLastDay < 7) {
    for (let i = 1; i <= 7 - weekieLastDay; i++) {
        tpl += `<span class="day-disable">${i}</span>`;
    }
}
```

这个月有多少天怎么算？

月份参数传入下个月，日期参数传入0，就可以获得当月最后一天是多少号了

我这里`this.M`就是当月，而程序的月份是要减1的，所以就相当于下个月了

某一天是星期几好求，我就不列出来了

```javascript
function daysCountThisMonth(num = 0) {
    return new Date(this.Y, this.M + num, 0).getDate();
}
```

至此，加上flex布局，一个静态的日历就做出来了

还有一个小细节，我选中的日期要高亮，当天也要有一个背景色，它们俩在初始的时候还应该是重合的

当天嘛，我缓存的年月和实时获取的年月相等，再把实时获取的日期和i比对，就是当天，加个`today`的class

而如果实时获取的日期和缓存的日期还相等，那么这天不仅是当天，还是用户选中的日子，加个`today active`的class

剩下的就是用户选中的不是当天，和完全普通的日子

由于选择年月的时候，日历都要重新渲染，所以我们只能根据这些条件来判断，看起来确实有些复杂

```javascript
for (let i = 1; i <= daysCountThisMonth; i++) {
    if (this.Y === Y && this.M === M && i === D && i !== this.D) {
        tpl += `<span class="day today">${i}</span>`;
    } else if (this.Y === Y && this.M === M && i === D && i === this.D) {
        tpl += `<span class="day today active">${i}</span>`;
    } else if (i === this.D) {
        tpl += `<span class="day active">${i}</span>`;
    } else {
        tpl += `<span class="day">${i}</span>`;
    }
}
```

我之前以为实例化时把当前年月日缓存起来，然后再把用户选中的年月日缓存起来，两者一对比，就可以渲染了

其实我没有注意到一个问题，就是使用日历是有可能跨天的，理论上，如果永远不关机，跨年都可以

如果我在午夜12点左右操作QingUI，那缓存的日期就有可能不准确，因为已经跨天了

至于我是如何发现这个BUG的，你猜？

所以每次渲染都要实时获取当前年月日

ES6的解构赋值可以让这个操作非常优美

```javascript
function nowDate() {
    const date = new Date();
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

const [Y, M, D] = nowDate();
```

话说就因为这个BUG，我几乎重构了整个组件

最后，用户选中高亮是通过添加class的方式实现的，高亮新的日子，然后把旧的日子高亮去掉

注意，这种操作是不需要重新渲染的，所以一般做法是，把所有日子循环一遍，去掉高亮，然后添加新的高亮

如果我们将上一个高亮的日子缓存起来呢？是不是就不用每次for循环了，于是就有了`this.oldD`

## 三角选择年月

选择年月有两种方式，一种是点开面板，直接选择，一种是点击三角，每次增1或减1

点击三角的时候，我设置成1月再减1，就会变成年份减1，月份变成12月，也就是说月份是可以一直点的

```javascript
// 置灰时获取不到元素
if ($monthPrev) {
    $monthPrev.addEventListener('click', function(event) {
        event.stopPropagation();
        self.M--;
        if (self.M > 0) {
            self.yearAndMonthChange('month');
        } else {
            self.M = 12;
            self.Y--;
            self.yearAndMonthChange('both');
        }
    });
}
```

可真的是这样吗？还记得有一个配置项`yearRange`吗？

如果年份到了头，就置灰不能再点了，这是我遇到的第二个坑

如果年份到了头，年份的减三角就要置灰，但是月份的减三角还是可以点

直到月份变成1，那么年份和月份的减三角都置灰了

加三角的逻辑也一样

这个逻辑，你们理一理

```javascript
const [left, right] = this.yearRange;

let tpl = `
    <div class="bar">
        <div class="bar-item">
            <span class="${this.Y > left ? 'angle year-prev' : 'angle disabled'}">◀</span>
            <span class="year-pop"></span>
            <span class="${this.Y < right ? 'angle year-next' : 'angle disabled'}">▶</span>
        </div>
        <div class="bar-item">
            <span class="${this.Y === left && this.M === 1 ? 'angle disabled' : 'angle month-prev'}">◀</span>
            <span class="month-pop"></span>
            <span class="${this.Y === right && this.M === 12 ? 'angle disabled' : 'angle month-next'}">▶</span>
        </div>
    </div>
`;
```

## 面板选择年月

选择年份和月份面板，我之前是做成pop弹窗加滚动条的，发现体验很糟糕，于是参考ElementUI做到了日历面板上

这就带来一个问题，显示年份面板的时候，日历实际上是清除了，选择完以后再重新渲染日历，继续重构...

月份简单，一个面板就显示完了

年份有可能一个面板显示不完，但再怎么样，也比年份和月份联动的情况要简单是吧

我把用户选择的年份缓存起来，因为我希望把用户选中过的年份放在比较中间的位置，他下次再选的时候，可以从这里继续

再结合`yearRange`，效果是这样的

```javascript
const [left, right] = this.yearRange;
const start = this.anchor - 4 > left ? this.anchor - 4 : left;
const end = this.anchor + 7 < right ? this.anchor + 7 : right;
const [Y, , ] = this.nowDate();
let tpl = `<div class="title">${this.lang === 'en' ? 'Choose a Year' : '选择年份'}</div>`;
if (this.anchor - 4 > left) {
    tpl += '<div class="prev">◀</div>';
} else {
    tpl += '<div class="prev-disabled">◀</div>';
}
tpl += '<div class="year-wrap">';
for (let i = start; i <= end; i++) {
    if (i !== Y) {
        tpl += `<span class="year">${i}</span>`;
    } else {
        tpl += `<span class="year thisyear">${i}</span>`;
    }
}
tpl += '</div>';
if (this.anchor + 7 < right) {
    tpl += '<div class="next">▶</div>';
} else {
    tpl += '<div class="next-disabled">▶</div>';
}
```

## 写在后面

DatePicker比较核心的逻辑就在这里了

400行左右的代码，每个人都可以尝试着写一遍，很有意思的

下一篇文章介绍TimePicker，敬请期待

最后，求star，求fork，求内推

> [https://github.com/veedrin/qing](https://github.com/veedrin/qing)
