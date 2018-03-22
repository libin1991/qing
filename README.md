![logo](https://raw.githubusercontent.com/veedrin/qing/master/doc/logo/logo.png)

<h1 align="center">QingUI</h1>

<br>

> QingUI是一个UI组件库<br>
> 目前拥有的组件：DatePicker, TimePicker, Paginator, Tree, Cascader, Checkbox, Radio, Switch, InputNumber, Input<br>
> ES6语法编写，无依赖<br>
> 原生模块化，Chrome63以上支持，请开启静态服务器预览效果，[静态服务器传送门](https://github.com/veedrin/qing/tree/master/lib)<br>
> 采用CSS变量配置样式

## DatePicker

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/date-picker.png)

DatePicker是一个日期选择器组件

### 挂载

```html
<div id="date-picker"></div>
```

### 启动

```javascript
import {DatePicker} from './qing.js';

new DatePicker({
    id: 'date-picker',
    yearRange: [2000, 2020],
    lang: 'zh',
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "date-picker" | 挂载标签的id |
| yearRange | array | [1970, 2050] | 年份选择的范围，必须包含当年 |
| lang | string | "zh" | 中文是"zh"，英文是"en" |
| callback | function(date: string) | () => {} | 回调，{param}选择的年月日，格式为"YYYY-MM-DD" |

## TimePicker

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/time-picker.png)

TimePicker是一个时间选择器组件

### 挂载

```html
<div id="time-picker"></div>
```

### 启动

```javascript
import {TimePicker} from './qing.js';

new TimePicker({
    id: 'time-picker',
    lang: 'zh',
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "time-picker" | 挂载标签的id |
| lang | string | "zh" | 中文是"zh"，英文是"en" |
| callback | function(time: string) | () => {} | 回调，{param}选择的时分秒，格式为"HH : MM : SS" |

## Paginator

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/paginator.png)

Paginator是一个分页组件

### 挂载

```html
<div id="paginator"></div>
```

### 启动

```javascript
import {Paginator} from './qing.js';

new Paginator({
    id: 'paginator',
    pageCount: 33,
    showSizeChanger: false,
    showQuickJumper: false,
    lang: 'zh',
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "paginator" | 挂载标签的id |
| pageCount | number | 1 | 页数 |
| showSizeChanger | boolean | false | 是否显示调整每页条数的下拉框 |
| pageSizeOptions | array | [10, 20, 30] | 每页条数选项，showSizeChanger为true时生效 |
| pageSize | number | 10 | 每页条数 |
| total | number | - | 总条数，total不能超过pageCount和pageSize的乘积 |
| showQuickJumper | boolean | false | 是否显示快速跳转至某页的输入框 |
| lang | string | "zh" | 中文是"zh"，英文是"en" |
| callback | function(position: number, pageSize: number) | () => {} | 回调，{param}当前页，{param}每页条数 |

## Tree

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/tree.png)

Tree是一个树结构组件

### 挂载

```html
<div id="tree"></div>
```

### 启动

```javascript
import {Tree} from './qing.js';

new Tree({
    id: 'tree',
    data: [
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
    ],
    checkable: true,
    indent: 40,
    expand: 'first',
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "tree" | 挂载标签的id |
| data | array | [] | 要渲染的树形数据 |
| checkable | boolean | true | 是否显示checkbox，即是否可选中 |
| indent | number | 40 | 每一级的缩进距离，单位为px |
| expand | string | "none" | 初始伸展方式，三个可选项，"none"是全部不展开，"all"是全部展开，"first"是第一节展开 |
| callback | function(data: array) | () => {} | 回调，{param}选中后的数据，checkable为true时生效 |

## Cascader

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/cascader.png)

Cascader是一个级联选择器组件

### 挂载

```html
<div id="cascader"></div>
```

### 启动

```javascript
import {Cascader} from './qing.js';

new Cascader({
    id: 'cascader',
    data: [
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
    ],
    searchable: true,
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "cascader" | 挂载标签的id |
| data | array | [] | 要渲染的树形数据 |
| searchable | boolean | false | 是否显示搜索框，即是否可搜索 |
| debounce | number | 300 | input事件的输入防抖 |
| trigger | string | "click" | 触发下一级的方式，两个可选项，"click"是鼠标点击触发，"hover"是鼠标悬停触发 |
| seperator | string | " / " | 分隔符 |
| callback | function(path: string) | () => {} | 回调，{param}选中的路径 |

## Checkbox

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/checkbox.png)

Checkbox是一个多选框组件

### 挂载

```html
<div class="checkbox"></div>
<div class="checkbox"></div>
<div class="checkbox"></div>
```

### 启动

```javascript
import {Checkbox} from './qing.js';

new Checkbox({
    classes: 'checkbox',
    indeterminateIndex: 0,
    data: [
        {
            checked: false,
            disabled: false,
        },
        {
            checked: false,
            disabled: false,
        },
        {
            checked: false,
            disabled: false,
        },
    ],
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| classes | string | "checkbox" | 挂载标签的class |
| indeterminateIndex | number | - | 全选全不选checkbox的索引 |
| data | array | [] | 渲染checked或者disabled的数据 |
| callback | function(data: array, i: number) | () => {} | 回调，{param}选中后的数据，{param}选中checkbox的索引，如果选中indeterminate，返回"indeterminate" |

## Radio

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/radio.png)

Radio是一个单选框组件

### 挂载

```html
<div class="radio"></div>
<div class="radio"></div>
<div class="radio"></div>
```

### 启动

```javascript
import {Radio} from './qing.js';

new Radio({
    classes: 'radio',
    data: [
        {
            checked: false,
            disabled: false,
        },
        {
            checked: false,
            disabled: false,
        },
        {
            checked: false,
            disabled: false,
        },
    ],
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| classes | string | "radio" | 挂载标签的class |
| data | array | [] | 渲染checked或者disabled的数据 |
| callback | function(data: array, i: number) | () => {} | 回调，{param}选中后的数据，{param}选中的索引 |

## Switch

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/switch.png)

Switch是一个开关组件

### 挂载

```html
<div id="switch"></div>
```

### 启动

```javascript
import {Switch} from './qing.js';

new Switch({
    id: 'switch',
    checked: false,
    disabled: false,
    size: 'default',
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "switch" | 挂载标签的id |
| checked | boolean | false | 初始是否选中 |
| disabled | boolean | false | 是否置灰 |
| size | string | "default" | 开关尺寸，两个可选项，默认"default"，小尺寸"small" |
| callback | function(checked: boolean) | () => {} | 回调，{param}是否选中 |

## InputNumber

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/input-number.png)

InputNumber是一个计数器组件

### 挂载

```html
<div id="input-number"></div>
```

### 启动

```javascript
import {InputNumber} from './qing.js';

new InputNumber({
    id: 'input-number',
    checked: false,
    disabled: false,
    size: 'default',
    callback: callback,
});
```

### API

| 参数 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| id | string | "input-number" | 挂载标签的id |
| initValue | number | 1 | 初始数值 |
| step | number | 1 | 步长 |
| min | number | - | 允许的最小值，要考虑到初始值和步长 |
| max | number | - | 允许的最大值，要考虑到初始值和步长 |
| size | string | "default" | 计数器尺寸，两个可选项，默认"default"，小尺寸"small" |
| disabled | boolean | false | 是否置灰 |
| callback | function(value: number, oldValue: number, type: string) | () => {} | 回调，{param}当前值，{param}上一次的值，{param}计数类型，有"decrease"，"increase"，"input" |

