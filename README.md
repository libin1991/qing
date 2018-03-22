![logo](https://raw.githubusercontent.com/veedrin/qing/master/doc/logo/logo.png)

<h1 align="center">QingUI</h1>

<br>

> QingUI是一个UI组件库<br>

## DatePicker

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/date-picker.png)

DatePicker是一个日期选择器组件

### 挂载

```html
<div id="date-picker"></div>
```

### 启动

```javascript
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

页码规则：

- 首页和尾页必须展示

- 如果有省略号则首尾只展示一条，当前页前后各展示两条共五条，一边没有空间则叠加到另一边

- 首尾页与当前页五条可以重合

- 跨度大于等于两条才出现省略号

### 挂载

```html
<div id="paginator"></div>
```

### 启动

```javascript
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
