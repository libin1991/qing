## 为什么要开启静态服务器

```html
<script type="module">
    import {Tree} from './qing.js';
</script>
```

如果使用原生模块，浏览器会阻止资源请求，报错信息如下

`Access to Script at 'file:///D:/Code/qing/qing.js' from origin 'null' has been blocked by CORS policy: Invalid response. Origin 'null' is therefore not allowed access.`

## 如何开启静态服务器

确保已经安装node

```
$ node server
```

地址栏输入`http://127.0.0.1:3333/`
