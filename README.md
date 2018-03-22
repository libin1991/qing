![logo](https://raw.githubusercontent.com/veedrin/qing/master/doc/logo/logo.png)

<h1 align="center">QingUI</h1>

<br>

> QingUI是一个UI组件库<br>

## DatePicker

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/date-picker.png)

DatePicker是一个日期选择器

支持两种方式的年份、月份选择，支持回到今天按钮，支持中英文

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
| id | string | 'date-picker' | 挂载标签的id |
| yearRange | array | [1970, 2050] | 年份选择的范围，必须包含当年 |
| lang | string | 'zh' | 中文是'zh'，英文是'en' |
| callback | function(date: string) | () => {} | 回调，{param}: 选择的年月日，格式为'YYYY-MM-DD' |
