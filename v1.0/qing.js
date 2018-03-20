/**
 * @author      : 马蹄疾
 * @date        : 2018-01-27
 * @version     : v1.0
 * @description : 一个UI组件库
 * @repository  : https://github.com/veedrin/qing
 * @license     : MIT
 */


////////// * DatePicker和TimePicker公共父类 * //////////

class TimeCommon {
    constructor() {}

    twoDigitsFormat(num) {
        if (String(num).length === 1 && num < 10) {
            num = `0${num}`;
        }
        return num;
    }
}

////////// * 日期选择器组件类 * //////////

class DatePicker extends TimeCommon {
    constructor({
        id = 'date-picker',
        yearRange = [1970, 2050],
        lang = 'zh',
        callback = () => {},
    } = {}) {
        // 继承父类的this对象
        super();
        this.$mount = document.querySelector(`#${id}`);
        // 年份选项范围
        this.yearRange = yearRange;
        this.lang = lang;
        this.callback = callback;
        // 用户选中的年月日，初始是当前年月日
        [this.Y, this.M, this.D] = this.nowDate();
        // 上一次选中的日期
        this.oldD = this.D;
        // 面板选择年份时的锚点年份
        this.anchor = this.Y;
        this.init();
    }

    init() {
        // 参数检查
        this.verifyOptions();
        this.render();
        this.$trough = this.$mount.querySelector('.trough');
        this.$view = this.$trough.querySelector('.view');
        this.$curtain = this.$mount.querySelector('.curtain');
        this.renderDay();
        this.$troughEvent();
    }

    render() {
        const tpl = `
            <div class="qing qing-date-picker">
                <div class="trough">
                    <div class="view">${this.dateFormat(this.Y, this.M, this.D)}</div>
                    <span class="arrow">^</span>
                </div>
                <div class="curtain"></div>
            </div>
        `;
        this.$mount.innerHTML = tpl;
    }

    renderDay() {
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
            <div class="week">
                <span class="week-item">一</span>
                <span class="week-item">二</span>
                <span class="week-item">三</span>
                <span class="week-item">四</span>
                <span class="week-item">五</span>
                <span class="week-item">六</span>
                <span class="week-item">日</span>
            </div>
        `;
        const daysCountThisMonth = this.daysCountThisMonth();
        const daysCountLastMonth = this.daysCountThisMonth(-1);
        // weekie指的是星期几（自创）
        const weekieFirstDay = this.weekieOfSomedayThisMonth(1);
        const weekieLastDay = this.weekieOfSomedayThisMonth(daysCountThisMonth);
        // 当前年月日
        const [Y, M, D] = this.nowDate();
        tpl += '<div class="board">';
        if (weekieFirstDay > 1) {
            for (let i = daysCountLastMonth - weekieFirstDay + 2; i <= daysCountLastMonth; i++) {
                tpl += `<span class="day-disable">${i}</span>`;
            }
        }
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
        if (weekieLastDay < 7) {
            for (let i = 1; i <= 7 - weekieLastDay; i++) {
                tpl += `<span class="day-disable">${i}</span>`;
            }
        }
        tpl += '</div>'
        tpl += `
            <div class="control">
                <button class="today">${this.lang === 'en' ? 'Today' : '今天'}</button>
                <button class="close">${this.lang === 'en' ? 'Close' : '关闭'}</button>
            </div>
        `;
        this.$curtain.innerHTML = tpl;
        this.$bar = this.$curtain.querySelector('.bar');
        this.$yearPop = this.$bar.querySelector('.year-pop');
        this.$monthPop = this.$bar.querySelector('.month-pop');
        this.$dayEvent();
        this.$barEvent();
        this.$controlEvent();
        // 中英文配置
        this.langConfig();
    }

    $troughEvent() {
        const self = this;
        const curtainCL = this.$curtain.classList;
        const arrowCL = this.$trough.querySelector('.view').classList;
        this.$trough.addEventListener('click', function(event) {
            event.stopPropagation();
            arrowCL.toggle('active');
            if (curtainCL.contains('active')) {
                curtainCL.remove('active');
            } else {
                curtainCL.add('active');
                // 打开curtain重新渲染
                self.renderDay();
            }
        });
        document.addEventListener('click', function() {
            curtainCL.contains('active') ? curtainCL.remove('active') : '';
            arrowCL.contains('active') ? arrowCL.remove('active') : '';
        });
    }

    $dayEvent() {
        const self = this;
        const $days = this.$curtain.querySelectorAll('.board .day');
        for (let i = 0; i < $days.length; i++) {
            const $day = $days[i];
            const CL = $day.classList;
            $day.addEventListener('click', function(event) {
                event.stopPropagation();
                $days[self.oldD - 1].classList.remove('active');
                // 切换class
                CL.toggle('active');
                self.D = Number.parseInt(this.innerHTML);
                // 重置oldD
                self.oldD = self.D;
                const format = self.dateFormat(self.Y, self.M, this.innerHTML);
                self.$view.innerHTML = format;
                // 回调
                self.callback(format);
                // 稍微延迟关闭curtain
                setTimeout(() => {
                    self.$trough.click();
                }, 100);
            });
        }
    }

    $barEvent() {
        const self = this;
        const $yearPrev = this.$bar.querySelector('.year-prev');
        const $yearNext = this.$bar.querySelector('.year-next');
        const $monthPrev = this.$bar.querySelector('.month-prev');
        const $monthNext = this.$bar.querySelector('.month-next');
        // 初始内容
        this.$yearPop.innerHTML = this.Y;
        this.$monthPop.innerHTML = this.twoDigitsFormat(this.M);
        // 置灰时获取不到元素
        if ($yearPrev) {
            $yearPrev.addEventListener('click', function(event) {
                event.stopPropagation();
                self.Y--;
                self.yearAndMonthChange('year');
            });
        }
        // 置灰时获取不到元素
        if ($yearNext) {
            $yearNext.addEventListener('click', function(event) {
                event.stopPropagation();
                self.Y++;
                self.yearAndMonthChange('year');
            });
        }
        this.$yearPop.addEventListener('click', function(event) {
            event.stopPropagation();
            self.renderYear();
        });
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
        // 置灰时获取不到元素
        if ($monthNext) {
            $monthNext.addEventListener('click', function(event) {
                event.stopPropagation();
                self.M++;
                if (self.M < 13) {
                    self.yearAndMonthChange('month');
                } else {
                    self.M = 1;
                    self.Y++;
                    self.yearAndMonthChange('both');
                }
            });
        }
        this.$monthPop.addEventListener('click', function(event) {
            event.stopPropagation();
            self.renderMonth();
        });
    }

    renderYear() {
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
        this.$curtain.innerHTML = tpl;
        this.$yearEvent();
        this.$yearEndEvent();
    }

    $yearEvent() {
        const self = this;
        const $years = this.$curtain.querySelectorAll('.year');
        for (let i = 0; i < $years.length; i++) {
            $years[i].addEventListener('click', function(event) {
                event.stopPropagation();
                self.Y = Number.parseInt(this.innerHTML);
                self.yearAndMonthChange('year');
            });
        }
    }

    $yearEndEvent() {
        const self = this;
        const $prev = this.$curtain.querySelector('.prev');
        const $next = this.$curtain.querySelector('.next');
        // 置灰时获取不到元素
        if ($prev) {
            $prev.addEventListener('click', function(event) {
                event.stopPropagation();
                self.anchor -= 12;
                self.renderYear();
            });
        }
        // 置灰时获取不到元素
        if ($next) {
            $next.addEventListener('click', function(event) {
                event.stopPropagation();
                self.anchor += 12;
                self.renderYear();
            });
        }
    }

    renderMonth() {
        const [, M, ] = this.nowDate();
        let tpl = `<div class="title">${this.lang === 'en' ? 'Choose a Month' : '选择月份'}</div>`;
        for (let i = 1; i <= 12; i++) {
            if (i !== M) {
                tpl += `<span class="month">${this.twoDigitsFormat(i)}</span>`;
            } else {
                tpl += `<span class="month thismonth">${this.twoDigitsFormat(i)}</span>`;
            }
        }
        this.$curtain.innerHTML = tpl;
        this.$monthEvent();
    }

    $monthEvent() {
        const self = this;
        const $months = this.$curtain.querySelectorAll('.month');
        for (let i = 0; i < $months.length; i++) {
            $months[i].addEventListener('click', function(event) {
                event.stopPropagation();
                self.M = Number.parseInt(this.innerHTML);
                self.yearAndMonthChange('month');
            });
        }
    }

    yearAndMonthChange(code) {
        // 当前年月日
        const [Y, M, D] = this.nowDate();
        if (this.Y !== Y || this.M !== M) {
            this.D = 1;
        } else {
            this.D = D;
        }
        // 重置oldD
        this.oldD = this.D;
        switch (code) {
            case 'year':
                this.$yearPop.innerHTML = this.Y;
                break;
            case 'month':
                this.$monthPop.innerHTML = this.twoDigitsFormat(this.M);
                break;
            case 'both':
                this.$yearPop.innerHTML = this.Y;
                this.$monthPop.innerHTML = this.twoDigitsFormat(this.M);
                break;
        }
        this.$view.innerHTML = this.dateFormat(this.Y, this.M, this.D);
        this.renderDay();
    }

    $controlEvent() {
        const self = this;
        const $today = this.$curtain.querySelector('.control .today');
        const $close = this.$curtain.querySelector('.control .close');
        $today.addEventListener('click', function(event) {
            event.stopPropagation();
            [self.Y, self.M, self.D] = self.nowDate();
            // 重置oldD
            self.oldD = self.D;
            self.$view.innerHTML = self.dateFormat(self.Y, self.M, self.D);
            self.renderDay();
        });
        $close.addEventListener('click', function(event) {
            self.$trough.click();
        });
    }

    langConfig() {
        if (this.lang === 'en') {
            const dict = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const $weeks = this.$curtain.querySelectorAll('.week-item');
            for (let i = 0; i < $weeks.length; i++) {
                $weeks[i].innerHTML = dict[i];
            }
        }
    }

    nowDate() {
        const date = new Date();
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    }

    daysCountThisMonth(num = 0) {
        return new Date(this.Y, this.M + num, 0).getDate();
    }

    weekieOfSomedayThisMonth(day) {
        let weekie = new Date(this.Y, this.M - 1, day).getDay();
        if (weekie === 0) {
            weekie = 7;
        }
        return weekie;
    }

    dateFormat(year, month, day) {
        month = this.twoDigitsFormat(month);
        day = this.twoDigitsFormat(day);
        return `${year}-${month}-${day}`;
    }

    verifyOptions() {
        // $mount
        if (!this.$mount) {
            throw new Error('[Qing error]: 日期选择器组件无法找到挂载点');
        }
        // yearRange
        if (Object.prototype.toString.call(this.yearRange) !== '[object Array]') {
            this.yearRange = [1970, 2050];
            console.warn('[Qing warn]: 日期选择器的yearRange必须是数组');
        } else if (typeof this.yearRange[0] !== 'number' || typeof this.yearRange[1] !== 'number') {
            this.yearRange = [1970, 2050];
            console.warn('[Qing warn]: 日期选择器的yearRange的年份必须是数字');
        } else if (this.yearRange[0] > this.Y || this.yearRange[1] < this.Y) {
            this.yearRange = [1970, 2050];
            console.warn('[Qing warn]: 日期选择器的yearRange的范围必须包含当年');
        }
        // callback
        if (typeof this.callback !== 'function') {
            this.callback = () => {};
            console.warn('[Qing warn]: 日期选择器的callback必须是函数');
        }
    }
}

////////// * 时间选择器组件类 * //////////

class TimePicker extends TimeCommon {
    constructor({
        id = 'time-picker',
        lang = 'zh',
        callback = () => {},
    } = {}) {
        // 继承父类的this对象
        super();
        this.$mount = document.querySelector(`#${id}`);
        this.lang = lang;
        this.callback = callback;
        // 用户选中的时间，初始是当前时间，秒数为0
        [this.H, this.M, ] = this.nowTime();
        this.S = 0;
        // 用户上一次选中的时间
        [this.oldH, this.oldM, this.oldS] = [this.H, this.M, this.S];
        // 上一次被禁用的按钮
        this.oldDisabled;
        this.init();
    }

    init() {
        // 参数检查
        this.verifyOptions();
        this.render();
        this.$trough = this.$mount.querySelector('.trough');
        this.$view = this.$trough.querySelector('.view');
        this.$curtain = this.$mount.querySelector('.curtain');
        this.$time = this.$curtain.querySelector('.time');
        this.$troughEvent();
        this.$selectEvent();
        this.$controlEvent();
        // 中英文配置
        this.langConfig();
    }

    render() {
        const tpl = `
            <div class="qing qing-time-picker">
                <div class="trough">
                    <div class="view">${this.timeFormat(this.H, this.M, this.S)}</div>
                    <span class="arrow">^</span>
                </div>
                <div class="curtain">
                    <div class="select">
                        <button class="select-item select-h">时钟</button>
                        <button class="select-item select-m">分钟</button>
                        <button class="select-item select-s">秒钟</button>
                    </div>
                    <div class="time"></div>
                    <div class="control">
                        <button class="now">${this.lang === 'en' ? 'Now' : '现在'}</button>
                        <button class="ok">${this.lang === 'en' ? 'OK' : '确定'}</button>
                    </div>
                </div>
            </div>
        `;
        this.$mount.innerHTML = tpl;
    }

    $troughEvent() {
        const self = this;
        const curtainCL = this.$curtain.classList;
        const arrowCL = this.$trough.querySelector('.arrow').classList;
        this.$trough.addEventListener('click', function(event) {
            event.stopPropagation();
            arrowCL.toggle('active');
            if (curtainCL.contains('active')) {
                curtainCL.remove('active');
            } else {
                curtainCL.add('active');
                // 打开curtain，回到时钟界面
                if (self.oldDisabled === self.$selectH) {
                    // 如果已经disabled，则去掉disabled才可以点击
                    self.oldDisabled.removeAttribute('disabled');
                    self.oldDisabled.click();
                } else {
                    self.$selectH.click();
                    self.oldDisabled = self.$selectH;
                }
            }
        });
        document.addEventListener('click', function() {
            curtainCL.contains('active') ? curtainCL.remove('active') : '';
            arrowCL.contains('active') ? arrowCL.remove('active') : '';
        });
    }

    $selectEvent() {
        const self = this;
        this.$selectH = this.$curtain.querySelector('.select-h');
        this.$selectM = this.$curtain.querySelector('.select-m');
        this.$selectS = this.$curtain.querySelector('.select-s');
        this.$selectH.addEventListener('click', function(event) {
            event.stopPropagation();
            self.ableAndDisableEvent(this);
            self.renderHour();
            self.$hourEvent();
        });
        this.$selectM.addEventListener('click', function(event) {
            event.stopPropagation();
            self.ableAndDisableEvent(this);
            self.renderMinute();
            self.$minuteEvent();
        });
        this.$selectS.addEventListener('click', function(event) {
            event.stopPropagation();
            self.ableAndDisableEvent(this);
            self.renderSecond();
            self.$secondEvent();
        });
        // 初始触发
        this.$selectH.click();
    }

    ableAndDisableEvent(ableNode) {
        if (this.oldDisabled) {
            this.oldDisabled.removeAttribute('disabled');
        }
        ableNode.setAttribute('disabled', '');
        this.oldDisabled = ableNode;
    }

    renderHour() {
        let tpl = '';
        for (let i = 0; i < 24; i++) {
            if (this.H !== i) {
                tpl += `<span class="hour">${this.twoDigitsFormat(i)}</span>`;
            } else {
                tpl += `<span class="hour active">${this.twoDigitsFormat(i)}</span>`;
            }
        }
        this.$time.innerHTML = tpl;
    }

    $hourEvent() {
        const self = this;
        const $hours = this.$time.querySelectorAll('.hour');
        for (let i = 0; i < $hours.length; i++) {
            const $hour = $hours[i];
            const CL = $hour.classList;
            $hour.addEventListener('click', function(event) {
                event.stopPropagation();
                $hours[self.oldH].classList.remove('active');
                CL.add('active');
                const hour = Number.parseInt(this.innerHTML);
                self.oldH = hour;
                self.timeChangeEvent(hour, 0, 0);
            });
        }
    }

    renderMinute() {
        let tpl = '';
        for (let i = 0; i < 60; i++) {
            if (this.M !== i) {
                tpl += `<span class="minute">${this.twoDigitsFormat(i)}</span>`;
            } else {
                tpl += `<span class="minute active">${this.twoDigitsFormat(i)}</span>`;
            }
        }
        this.$time.innerHTML = tpl;
    }

    $minuteEvent() {
        const self = this;
        const $minutes = this.$time.querySelectorAll('.minute');
        for (let i = 0; i < $minutes.length; i++) {
            const $minute = $minutes[i];
            const CL = $minute.classList;
            $minute.addEventListener('click', function(event) {
                event.stopPropagation();
                $minutes[self.oldM].classList.remove('active');
                CL.add('active');
                const minute = Number.parseInt(this.innerHTML);
                self.oldM = minute;
                self.timeChangeEvent(0, minute, 0);
            });
        }
    }

    renderSecond() {
        let tpl = '';
        for (let i = 0; i < 60; i++) {
            if (this.S !== i) {
                tpl += `<span class="second">${this.twoDigitsFormat(i)}</span>`;
            } else {
                tpl += `<span class="second active">${this.twoDigitsFormat(i)}</span>`;
            }
        }
        this.$time.innerHTML = tpl;
    }

    $secondEvent() {
        const self = this;
        const $seconds = this.$time.querySelectorAll('.second');
        for (let i = 0; i < $seconds.length; i++) {
            const $second = $seconds[i];
            const CL = $second.classList;
            $second.addEventListener('click', function(event) {
                event.stopPropagation();
                $seconds[self.oldS].classList.remove('active');
                CL.add('active');
                const second = Number.parseInt(this.innerHTML);
                self.oldS = second;
                self.timeChangeEvent(0, 0, second);
            });
        }
    }

    timeChangeEvent(hour, minute, second) {
        hour ? this.H = hour : '';
        minute ? this.M = minute : '';
        second ? this.S = second : '';
        this.$view.innerHTML = this.timeFormat(this.H, this.M, this.S);
    }

    $controlEvent() {
        const self = this;
        const $now = this.$curtain.querySelector('.control .now');
        const $ok = this.$curtain.querySelector('.control .ok');
        $now.addEventListener('click', function(event) {
            event.stopPropagation();
            [self.H, self.M, self.S] = self.nowTime();
            self.$view.innerHTML = self.timeFormat(self.H, self.M, self.S);
            // 缓存选择的时间
            [self.oldH, self.oldM, self.oldS] = [self.H, self.M, self.S];
            // 更新时间面板，回到时钟界面
            if (self.oldDisabled === self.$selectH) {
                // 如果已经disabled，则去掉disabled才可以点击
                self.oldDisabled.removeAttribute('disabled');
                self.oldDisabled.click();
            } else {
                self.$selectH.click();
                self.oldDisabled = self.$selectH;
            }
        });
        $ok.addEventListener('click', function(event) {
            event.stopPropagation();
            // 回调
            self.callback(self.timeFormat(self.H, self.M, self.S));
            // 稍微延迟关闭curtain
            setTimeout(() => {
                self.$trough.click();
            }, 100);
        });
    }

    langConfig() {
        if (this.lang === 'en') {
            [this.$selectH.innerHTML, this.$selectM.innerHTML, this.$selectS.innerHTML] = ['Hour', 'Minute', 'Second'];
        }
    }

    nowTime() {
        const date = new Date();
        return [date.getHours(), date.getMinutes(), date.getSeconds()];
    }

    timeFormat(hour = 0, minute = 0, second = 0) {
        hour = this.twoDigitsFormat(hour);
        minute = this.twoDigitsFormat(minute);
        second = this.twoDigitsFormat(second);
        return `${hour} : ${minute} : ${second}`;
    }

    verifyOptions() {
        // $mount
        if (!this.$mount) {
            throw new Error('[Qing error]: 时间选择器组件无法找到挂载点');
        }
        // callback
        if (typeof this.callback !== 'function') {
            this.callback = () => {};
            console.warn('[Qing warn]: 时间选择器的callback必须是函数');
        }
    }
}

////////// * 分页组件类 * //////////

class Paginator {
    constructor({
        id = 'paginator',
        pageCount = 1,
        showSizeChanger = false,
        pageSizeOptions = [10, 20, 30],
        pageSize = 10,
        total,
        showQuickJumper = false,
        lang = 'zh',
        callback = () => {},
    } = {}) {
        this.$mount = document.querySelector(`#${id}`);
        // 页数
        this.pageCount = pageCount;
        // 是否显示调整每页条数下拉框
        this.showSizeChanger = showSizeChanger;
        // 每页条数选项
        this.pageSizeOptions = pageSizeOptions;
        // 每页条数
        this.pageSize = pageSize;
        // 总条数
        this.total = total ? total : this.pageCount * this.pageSize;
        // 是否显示快速跳转至某页
        this.showQuickJumper = showQuickJumper;
        this.lang = lang;
        this.callback = callback;
        // 分页数据模型
        this.model = [];
        // 当前页
        this.position = 1;
        this.init();
    }

    init() {
        // 参数检查
        this.verifyOptions();
        this.render();
        this.$prev = this.$mount.querySelector('.prev');
        this.$next = this.$mount.querySelector('.next');
        this.$bar = this.$mount.querySelector('.bar');
        this.actPerEvent();
        this.$endEvent();
        if (this.showSizeChanger) {
            this.$combobox = this.$mount.querySelector('.combobox');
            this.$panel = this.$combobox.querySelector('.panel');
            this.$arrow = this.$combobox.querySelector('.arrow');
            this.$comboboxEvent();
            this.$optionEvent();
        }
        if (this.showQuickJumper) {
            this.$jumpEvent();
        }
    }

    actPerEvent() {
        this.buildModel();
        this.$barRender();
        this.$pageEvent();
    }

    render() {
        let template = '<div class="qing qing-paginator">';
        template += `
            <div class="square end prev">﹤</div>
            <div class="bar"></div>
            <div class="square end next">﹥</div>
        `;
        if (this.showSizeChanger) {
            const perPage = this.lang === 'en' ? 'page' : '页';
            // 下拉列表的模板
            let optionTpl = '';
            for (const item of this.pageSizeOptions) {
                optionTpl += `<div class="option">${item}&nbsp;/&nbsp;${perPage}</div>`;
            }
            template += `
                <div class="combobox">
                    <div class="show">
                        <span class="size">${this.pageSize}</span>
                        <span>/&nbsp;${perPage}</span>
                    </div>
                    <span class="arrow">^</span>
                    <div class="panel">${optionTpl}</div>
                </div>
            `;
        }
        if (this.showQuickJumper) {
            template += `
                <div class="jumper">
                    <span class="goto">${this.lang === 'en' ? 'Goto' : '前往'}</span>
                    <input class="jump" type="text">
                </div>
            `;
        }
        template += '</div>';
        this.$mount.innerHTML = template;
    }

    buildModel() {
        // 每次重新初始化
        this.model = [];
        const c = this.pageCount, p = this.position;
        // 首页和尾页必须展示
        // 如果有省略号则首尾只展示一条，当前页前后各展示两条共五条，一边没有空间则叠加到另一边
        // 首尾页与当前页五条可以重合
        // 跨度大于等于两条才出现省略号，省略号用0表示
        if (c < 8) {
            for (let i = 1; i <= c; i++) {
                this.model.push(i);
            }
        } else {
            if (p < 6) {
                if (p < 4) {
                    this.model = [1, 2, 3, 4, 5, 0, c];
                } else if (p === 4) {
                    this.model = [1, 2, 3, 4, 5, 6, 0, c];
                } else {
                    this.model = [1, 2, 3, 4, 5, 6, 7, 0, c];
                }
            } else {
                if (p < c - 4) {
                    this.model = [1, 0, p - 2, p - 1, p, p + 1, p + 2, 0, c];
                } else {
                    if (p === c - 4) {
                        this.model = [1, 0, p - 2, p - 1, c - 4, c - 3, c - 2, c - 1, c];
                    } else if (p === c - 3) {
                        this.model = [1, 0, p - 2, c - 4, c - 3, c - 2, c - 1, c];
                    } else {
                        this.model = [1, 0, c - 4, c - 3, c - 2, c - 1, c];
                    }
                }
            }
        }
    }

    $barRender() {
        let template = '';
        for (const item of this.model) {
            if (item > 0) {
                if (this.position !== item) {
                    template += `<div class="square page">${item}</div>`;
                } else {
                    template += `<div class="square page active">${item}</div>`;
                }
            } else {
                template += '<div class="square gap">···</div>';
            }
        }
        this.$bar.innerHTML = template;
        // 控制prev和next是否置灰
        // 如果只有一页，则this.pageCount === 1
        if (this.pageCount === 1) {
            this.$prev.classList.add('disabled');
            this.$next.classList.add('disabled');
            return;
        }
        if (this.position === 1) {
            this.$prev.classList.add('disabled');
            this.$next.classList.remove('disabled');
        } else if (this.position === this.pageCount) {
            this.$next.classList.add('disabled');
            this.$prev.classList.remove('disabled');
        } else {
            this.$prev.classList.remove('disabled');
            this.$next.classList.remove('disabled');
        }
    }

    $pageEvent() {
        const self = this;
        const $pages = this.$mount.querySelectorAll('.page');
        for (const $page of $pages) {
            $page.addEventListener('click', function(event) {
                event.stopPropagation();
                self.position = Number.parseInt(this.innerHTML);
                // 回调
                self.callback(self.position, self.pageSize);
                // 重新渲染
                self.actPerEvent();
            });
        }
    }

    $endEvent() {
        const self = this;
        this.$prev.addEventListener('click', function(event) {
            event.stopPropagation();
            if (self.position === 1) {
                return;
            }
            self.position--;
            // 回调
            self.callback(self.position, self.pageSize);
            // 重新渲染
            self.actPerEvent();
        });
        this.$next.addEventListener('click', function(event) {
            event.stopPropagation();
            if (self.position === self.pageCount) {
                return;
            }
            self.position++;
            // 回调
            self.callback(self.position, self.pageSize);
            // 重新渲染
            self.actPerEvent();
        });
    }

    $comboboxEvent() {
        const panelCL = this.$panel.classList;
        const arrowCL = this.$arrow.classList;
        this.$combobox.addEventListener('click', function(event) {
            event.stopPropagation();
            panelCL.toggle('active');
            arrowCL.toggle('active');
        });
        // 点击页面任何地方关闭combobox
        document.addEventListener('click', function() {
            panelCL.contains('active') ? panelCL.remove('active') : '';
            arrowCL.contains('active') ? arrowCL.remove('active') : '';
        });
    }

    $optionEvent() {
        const self = this;
        const $options = this.$panel.querySelectorAll('.option');
        const $size = this.$combobox.querySelector('.size');
        // 如果pageSize是pageSizeOptions当中的一项，该项所在的$option添加active
        let index = this.pageSizeOptions.indexOf(this.pageSize);
        if (index > -1) {
            $options[index].classList.add('active');
        } else if (index === -1) {
            index = 0;
        }
        const panelCL = this.$panel.classList;
        const arrowCL = this.$arrow.classList;
        for (let i = 0; i < $options.length; i++) {
            const $option = $options[i];
            const optionCL = $option.classList;
            $option.addEventListener('click', function(event) {
                event.stopPropagation();
                // 收起combobox和arrow；如果不阻止冒泡则可省略
                panelCL.remove('active');
                arrowCL.remove('active');
                // 处理$option的active
                optionCL.add('active');
                $options[index].classList.remove('active');
                index = i;
                // 选中的每页条数
                const num = Number.parseInt(this.innerHTML.split('/')[0].trim());
                self.pageSize = num;
                $size.innerHTML = num;
                // 如果每页显示条数变化导致总页数比当前页小，则当前页变成最后一页
                const pageCount = Math.ceil(self.total / self.pageSize);
                if (pageCount < self.position) {
                    self.position = pageCount;
                }
                self.pageCount = pageCount;
                // 回调
                self.callback(self.position, self.pageSize);
                // 重新渲染
                self.actPerEvent();
            });
        }
    }

    $jumpEvent() {
        const self = this;
        const $jump = this.$mount.querySelector('.jump');
        $jump.addEventListener('keyup', function(event) {
            event.stopPropagation();
            if (event.keyCode !== 13) {
                return;
            }
            const value = this.value;
            this.value = '';
            if (Number.isInteger(value) && value > 0) {
                // 如果value大于页数，则前往最后一页
                value <= self.pageCount ? self.position = value : self.position = self.pageCount;
                // 回调
                self.callback(self.position, self.pageSize);
                // 重新渲染
                self.actPerEvent();
            }
        });
    }

    verifyOptions() {
        // $mount
        if (!this.$mount) {
            throw new Error('[Qing error]: 分页组件无法找到挂载点');
        }
        // pageCount
        if (typeof this.pageCount !== 'number') {
            this.pageCount = 1;
            console.warn('[Qing warn]: 分页组件的pageCount必须是数字');
        }
        // pageSizeOptions
        if (Object.prototype.toString.call(this.pageSizeOptions) !== '[object Array]') {
            this.pageSizeOptions = [10, 20, 30];
            console.warn('[Qing warn]: 分页组件的pageSizeOptions必须是数组');
        } else {
            for (let i = 0; i < this.pageSizeOptions.length; i++) {
                if (typeof this.pageSizeOptions[i] !== 'number') {
                    this.pageSizeOptions = [10, 20, 30];
                    console.warn('[Qing warn]: 分页组件的pageSizeOptions数组的项必须是数字');
                    break;
                }
            }
        }
        // pageSize
        if (typeof this.pageSize !== 'number') {
            this.pageSize = 10;
            console.warn('[Qing warn]: 分页组件的pageSize必须是数字');
        }
        // total
        if (typeof this.total !== 'number') {
            this.total = 10;
            console.warn('[Qing warn]: 分页组件的total必须是数字');
        } else if (this.total > this.pageCount * this.pageSize) {
            this.total = this.pageCount * this.pageSize;
            console.warn('[Qing warn]: 分页组件的total不能超过pageCount和pageSize的乘积');
        }
        // callback
        if (typeof this.callback !== 'function') {
            this.callback = () => {};
            console.warn('[Qing warn]: 分页组件的callback必须是函数');
        }
    }
}

////////// * 树组件类 * //////////

class Tree {
    constructor({
        id = 'tree',
        data = [],
        checkable = true,
        indent = 40,
        expand = 'none',
        callback = () => {},
    } = {}) {
        this.$mount = document.querySelector(`#${id}`);
        this.data = data;
        this.checkable = checkable;
        // 每一级的缩进距离
        this.indent = indent;
        // 初始伸展方式
        this.expand = expand;
        this.callback = callback;
        // 与data结构相同的cb树
        this.cbTree = [];
        this.init();
    }

    init() {
        // 参数检查
        this.verifyOptions();
        this.render();
        if (this.checkable) {
            // $mount.firstElementChild是根元素
            this.buildCbTree(this.$mount.firstElementChild, {sub: this.cbTree});
            this.$checkboxEvent(this.cbTree);
        }
        this.$fruitEvent();
    }

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
            // 判断展开或闭合
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

    $fruitEvent() {
        const self = this;
        const $fruits = this.$mount.querySelectorAll('.fruit');
        for (const $fruit of $fruits) {
            const $sub = $fruit.nextElementSibling;
            if (!$sub) {
                continue;
            }
            const CL = $fruit.querySelector('.arrow').classList;
            $fruit.addEventListener('click', function(event) {
                event.stopPropagation();
                // sub动画
                self.subHeightToggle($sub);
                // arrow动画
                CL.toggle('active');
            });
        }
    }

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

    $checkboxEvent(arr) {
        const self = this;
        for (const item of arr) {
            const $cb = item.cb;
            const $sub = item.sub;
            const queue = item.queue;
            $cb.addEventListener('click', function(event) {
                event.stopPropagation();
                const checked = !this.classList.contains('checked');
                // cb事件
                checked ? self.$cbEvent(item, 'all') : self.$cbEvent(item, 'none');
                // cb子代事件
                checked ? self.childCbsEvent($sub, 'all') : self.childCbsEvent($sub, 'none');
                // cb父代事件
                self.fatherCbsEvent(queue);
                // 根据cbTree更新数据
                self.updateData(self.cbTree, self.data);
                // 触发回调
                self.callback(self.data);
            });
            if ($sub) {
                this.$checkboxEvent($sub);
            }
        }
    }

    $cbEvent(item, action) {
        const $cb = item.cb;
        const cl = $cb.classList;
        switch (action) {
            case 'all':
                item.checked = true;
                cl.remove('somechecked');
                cl.add('checked');
                break;
            case 'some':
                item.checked = false;
                cl.remove('checked');
                cl.add('somechecked');
                break;
            case 'none':
                item.checked = false;
                cl.remove('somechecked');
                cl.remove('checked');
                break;
        }
    }

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

    fatherCbsEvent(queue) {
        const $fatherItem = this.findFatherItem(queue);
        if (!$fatherItem) {
            return;
        }
        const $siblingCbs = this.findSiblingCbs($fatherItem.sub);
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
            this.$cbEvent($fatherItem, 'all');
        } else if (noneFlag) {
            this.$cbEvent($fatherItem, 'none');
        } else {
            this.$cbEvent($fatherItem, 'some');
        }
        this.fatherCbsEvent($fatherItem.queue);
    }

    findFatherItem(queue) {
        const n = queue.length - 1;
        // 顶级item没有父item
        if (n === 0) {
            return;
        }
        let $fatherItem = this.cbTree;
        for (let i = 0; i < n; i++) {
            const char = queue.charAt(i);
            if (i < n - 1) {
                $fatherItem = $fatherItem[char].sub;
            } else {
                $fatherItem = $fatherItem[char];
            }
        }
        return $fatherItem;
    }

    findSiblingCbs($sub) {
        let $siblingCbs = [];
        for (const $item of $sub) {
            $siblingCbs.push($item.cb);
        }
        return $siblingCbs;
    }

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

    verifyOptions() {
        // $mount
        if (!this.$mount) {
            throw new Error('[Qing error]: 树组件无法找到挂载点');
        }
        // data
        if (Object.prototype.toString.call(this.data) !== '[object Array]') {
            this.data = [];
            console.warn('[Qing warn]: 树组件的data必须是数组');
        }
        // indent
        if (typeof this.indent !== 'number') {
            this.indent = 40;
            console.warn('[Qing warn]: 树组件的indent必须是数字');
        }
        // callback
        if (typeof this.callback !== 'function') {
            this.callback = () => {};
            console.warn('[Qing warn]: 树组件的callback必须是函数');
        }
    }
}
