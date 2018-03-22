![logo](https://raw.githubusercontent.com/veedrin/qing/master/doc/logo/logo.png)

<h1 align="center">QingUI</h1>

<br>

> QingUI是一个UI组件库<br>

## DatePicker

![img failed](https://raw.githubusercontent.com/veedrin/qing/master/doc/img/date-picker.png)

API

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| id | string | 'date-picker' | 挂载标签的id |
| yearRange | array | [1970, 2050] | 年份选择的范围，必须包含当年 |
| lang | string | 'zh' | 中文是'zh'，英文是'en' |
| callback | function(date: string) | () => {} | 回调，第一个参数是选择的年月日，格式为'YYYY-MM-DD' |
