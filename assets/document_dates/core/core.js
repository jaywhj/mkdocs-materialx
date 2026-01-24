/*
    1.加载头像
*/
function isLatin(name) {
    return /^[A-Za-z\s]+$/.test(name.trim());
}
function extractInitials(name) {
    name = name.trim();
    if (!name) return '?';
    if (isLatin(name)) {
        const parts = name.toUpperCase().split(/\s+/).filter(Boolean);
        return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
    } else {
        return name[0];
    }
}
function nameToHSL(name, s = 50, l = 55) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, ${s}%, ${l}%)`;
}

function loadAvatars() {
    document.querySelectorAll('.avatar-wrapper').forEach(wrapper => {
        const name = wrapper.dataset.name || '';
        const initials = extractInitials(name);
        const bgColor = nameToHSL(name);

        const textEl = wrapper.querySelector('.avatar-text');
        textEl.textContent = initials;
        textEl.style.backgroundColor = bgColor;

        const imgEl = wrapper.querySelector('img.avatar');
        if (imgEl) {
            const urls = [];
            const dataSrc = (imgEl.dataset.src || '').trim();
            const email = (imgEl.dataset.email || '').trim();

            if (dataSrc) {
                urls.push(dataSrc);
            }
            if (email && AvatarService.base) {
                const hash = md5(email.trim().toLowerCase());
                urls.push(AvatarService.build(hash));
            }
            if (urls.length === 0) {
                imgEl.style.display = 'none';
                return;
            }

            bindAvatar(imgEl, urls);
        }
    });
}
function bindAvatar(imgEl, urls) {
    let index = 0;
    function next() {
        if (index >= urls.length) {
            imgEl.style.display = 'none';
            return;
        }
        imgEl.src = urls[index++];
    }
    imgEl.onerror = next;
    // 加载成功后清掉 onerror
    imgEl.onload = () => imgEl.onerror = null;

    next();
}

const AVATAR_CDNS = {
    // gravatar: 全球通用头像服务商，国内访问不稳定
    // weavatar: gravatar 国内镜像，实测发现国内外访问都正常，数据跟 gravatar 一致
    // cravatar: 国内头像服务商，有国际 CDN，很多开源项目在用，实测发现只包含部分 gravatar 数据

    gravatar: 'https://www.gravatar.com/avatar',
    weavatar: 'https://weavatar.com/avatar'
    // cravatar: 'https://cravatar.cn/avatar'
};
const PROBE_TARGETS = [
    { name: 'gravatar', probe: 'https://www.gravatar.com/favicon.ico' },
    { name: 'weavatar', probe: 'https://weavatar.com/favicon.ico' }
];

let avatarServiceInited = false;
const AvatarService = {
    base: null,
    async init() {
        if (avatarServiceInited) return;
        avatarServiceInited = true;

        const winner = await raceAvatarCDN(PROBE_TARGETS.map(t => t.probe));
        if (!winner) return;

        const hit = PROBE_TARGETS.find(t => t.probe === winner);
        this.base = AVATAR_CDNS[hit.name];
    },

    // style: '404' 'wavatar' 'retro' 'identicon' 'mp' 'monsterid' 'robohash' 'blank'
    // size: avatar size in pixels (1~2048)
    build(emailHash, style = '404', size = 128) {
        if (!this.base) return null;
        return `${this.base}/${emailHash}?d=${style}&s=${size}`;
    }
};
function raceAvatarCDN(urls, timeout = 500) {
    return new Promise(resolve => {
        let done = false;
        urls.forEach(url => {
            const img = new Image();
            const timer = setTimeout(() => {
                img.src = '';
            }, timeout);
            img.onload = () => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                resolve(url);
            };
            img.onerror = () => {
                clearTimeout(timer);
            };
            img.src = url;
        });
        // 兜底（全部失败 / 全部超时），不让 Promise 永远 pending
        setTimeout(() => {
            if (!done) resolve(null);
        }, timeout);
    });
}



/*
    2.处理内容赋值
*/
// 图标键映射表
const iconKeyMap = {
    doc_created: 'created_time',
    doc_updated: 'updated_time',
    doc_author: 'author',
    doc_authors: 'authors'
};

function applyTimeagoToTimes(timeNodes, rawLocale) {
    if (typeof timeago === 'undefined') {
        return;
    }
    if (!timeNodes || !timeNodes.length) {
        return;
    }
    const tLocale = ddUtils.resolveTimeagoLocale(rawLocale);
    timeNodes.forEach(timeEl => {
        const dt = timeEl.getAttribute('datetime');
        if (dt) {
            timeEl.textContent = timeago.format(dt, tLocale);
        }
    });
}

// 处理数据加载
function processDataLoading() {
    // 获取 locale，优先级：用户主动选择 > 服务端显式配置 > 用户浏览器语言 > 站点HTML语言 > 默认英语
    const rawLocale =
        ddUtils.getSavedLanguage() ||
        // ddpEl.getAttribute('locale') ||
        navigator.language ||
        navigator.userLanguage ||
        document.documentElement.lang ||
        'en';

    document.querySelectorAll('.document-dates-plugin').forEach(ddpEl => {
        // 处理 time 元素（使用 timeago 时）
        applyTimeagoToTimes(ddpEl.querySelectorAll('time'), rawLocale);

        // 动态处理 tooltip 内容
        const langData = TooltipLanguage.get(rawLocale);
        ddpEl.querySelectorAll('[data-tippy-content]').forEach(tippyEl => {
            const iconEl = tippyEl.querySelector('[data-icon]');
            const rawIconKey = iconEl ? iconEl.getAttribute('data-icon') : '';
            const iconKey = iconKeyMap[rawIconKey] || 'author';
            if (langData[iconKey]) {
                const content = langData[iconKey] + ': ' + tippyEl.dataset.tippyRaw;
                if (tippyEl._tippy) {
                    tippyEl._tippy.setContent(content);
                }
            }
        });
    });

    // 处理其他 timeago 时间
    applyTimeagoToTimes(document.querySelectorAll('time.dd-timeago'), rawLocale);
}

// 供外部使用：更新文档日期和 tippy 内容到指定语言（可持久化）
function updateDocumentDates(locale) {
    ddUtils.saveLanguage(locale);
    processDataLoading();
}
window.ddPlugin = {
    updateLanguage: updateDocumentDates
};



/*
    3.初始化 tippyManager，创建和管理 tippy 实例
*/
function getCurrentTheme() {
    // 基于 Material's light/dark 配色方案返回对应的 tooltip 主题
    const scheme = (document.body && document.body.getAttribute('data-md-color-scheme')) || 'default';
    return scheme === 'slate' ? tooltip_config.theme.dark : tooltip_config.theme.light;
}

function initTippy() {
    // 创建上下文对象，将其传递给钩子并从函数中返回
    const context = { tooltip_config };

    // 创建 tippy 实例
    const tippyInstances = tippy('[data-tippy-content]', {
        ...tooltip_config,
        theme: getCurrentTheme()
    });
    context.tippyInstances = tippyInstances;

    // 添加观察者，监控 Material's 配色变化，自动切换 tooltip 主题
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-md-color-scheme') {
                const newTheme = getCurrentTheme();
                tippyInstances.forEach(instance => {
                    instance.setProps({ theme: newTheme });
                });
            }
        });
    });
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-md-color-scheme']
    });
    context.observer = observer;

    // 返回包含 tippyInstances 和 observer 的上下文，用于后续清理
    return context;
}

// 在滚动时隐藏 author-group 的 tooltip
function initAuthorGroupTippyGuard() {
    document.querySelectorAll('.author-group').forEach(groupEl => {
        // 先取消旧监听器，避免重复绑定
        if (groupEl._ddTippyGuardAbortController) {
            groupEl._ddTippyGuardAbortController.abort();
        }
        const controller = new AbortController();
        groupEl._ddTippyGuardAbortController = controller;

        const tippyTargets = groupEl.querySelectorAll('[data-tippy-content]');
        const hideAllTippies = () => {
            tippyTargets.forEach(tippyEl => {
                if (tippyEl._tippy) {
                    tippyEl._tippy.hide();
                }
            });
        };
        // true: 浏览器立刻执行默认行为。这个事件监听器只是‘看看’，绝不会阻止浏览器的默认行为
        const opts = { passive: true, signal: controller.signal };
        groupEl.addEventListener('scroll', hideAllTippies, opts);
        groupEl.addEventListener('touchmove', hideAllTippies, opts);
    });
}

// 通过 IIFE（立即执行的函数表达式）创建 tippyManager
const tippyManager = (() => {
    let tippyInstances = [];
    let observer = null;
    function cleanup() {
        // 销毁之前的 tippy 实例
        if (tippyInstances.length > 0) {
            tippyInstances.forEach(instance => instance.destroy());
            tippyInstances = [];
        }
        // 断开之前的观察者连接
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
    return {
        // 每一次调用都生成新的实例（兼容 navigation.instant）
        initialize() {
            // 先清理以前的实例
            cleanup();
            // 初始化新实例
            const context = initTippy();
            if (context && context.tippyInstances) {
                tippyInstances = context.tippyInstances;
            }
            if (context && context.observer) {
                observer = context.observer;
            }
            initAuthorGroupTippyGuard();
        }
    };
})();


// 为 author-group 启用横向滚轮滚动
function enableHorizontalWheelScroll() {
    // 移动端不接管滚轮
    const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
    if (isTouchDevice) return;

    document.querySelectorAll('.author-group').forEach(groupEl => {
        // 先取消旧监听器，避免重复绑定
        if (groupEl._ddWheelAbortController) {
            groupEl._ddWheelAbortController.abort();
        }
        const controller = new AbortController();
        groupEl._ddWheelAbortController = controller;

        groupEl.addEventListener('wheel', function (event) {
            // 只处理纵向滚轮（触控板横向滑动不干预）
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            // 在 author-group 内，始终阻止页面纵向滚动
            event.preventDefault();

            const scrollWidth = groupEl.scrollWidth;
            const clientWidth = groupEl.clientWidth;
            // 元素不可横向滚动时返回
            if (scrollWidth <= clientWidth) return;

            const delta = event.deltaY;
            const atLeft = groupEl.scrollLeft <= 0;
            const atRight = groupEl.scrollLeft + clientWidth >= scrollWidth - 1;

            if ((delta < 0 && !atLeft) || (delta > 0 && !atRight)) {
                groupEl.scrollLeft += delta;
            }
        }, {
            // false: 浏览器你先别急着执行默认行为，等 JS 跑完，再决定要不要动，因为可能会调用 event.preventDefault()
            passive: false,
            signal: controller.signal
        });
    });
}


// 为 author-group 添加自适应动态布局
function handleDocumentDatesAutoWrap() {
    // 设定作者区域最小的显示宽度，大概2个作者宽度
    const AUTHOR_THRESHOLD = 140;
    document.querySelectorAll('.document-dates-plugin').forEach(ddpEl => {
        const leftPart = ddpEl.querySelector('.dd-left');
        const rightPart = ddpEl.querySelector('.dd-right');
        if (!leftPart || !rightPart) return;

        // 使用 getBoundingClientRect 更加精确（包含小数）
        const containerWidth = ddpEl.getBoundingClientRect().width;
        const leftWidth = leftPart.getBoundingClientRect().width;
        if (containerWidth <= leftWidth) return;

        // 如果: 容器总宽度 < 日期宽度 + 2个作者宽度，则换行
        const shouldWrap = containerWidth < (leftWidth + AUTHOR_THRESHOLD);
        // 只有在状态确实需要改变时才操作 DOM
        if (ddpEl.classList.contains('is-wrapped') !== shouldWrap) {
            ddpEl.classList.toggle('is-wrapped', shouldWrap);
        }
    });
}

// 最近更新 - 布局切换器 (Layout Switcher)
function initLayoutSwitcher() {
    const grids = document.querySelectorAll('.article-grid');
    if (!grids.length) return;

    const savedLayout = localStorage.getItem('dd_recent_docs_layout') || 'grid';

    grids.forEach(grid => {
        // 应用初始布局
        grid.classList.toggle('is-list', savedLayout === 'list');
        grid.classList.toggle('is-detail', savedLayout === 'detail');

        // 查找或创建切换器容器
        let switcher = grid.previousElementSibling;
        if (!switcher || !switcher.classList.contains('article-layout-switcher')) {
            // 如果模板中没写，可以动态注入，但建议写在模板里以保证 UI 一致性
            return;
        }

        const listBtn = switcher.querySelector('.layout-list-btn');
        const detailBtn = switcher.querySelector('.layout-detail-btn');
        const gridBtn = switcher.querySelector('.layout-grid-btn');

        const updateActiveBtn = (layout) => {
            if (listBtn) listBtn.classList.toggle('is-active', layout === 'list');
            if (detailBtn) detailBtn.classList.toggle('is-active', layout === 'detail');
            if (gridBtn) gridBtn.classList.toggle('is-active', layout === 'grid');
        };

        updateActiveBtn(savedLayout);

        const setLayout = (layout) => {
            grid.classList.remove('is-list', 'is-detail');
            if (layout !== 'grid') {
                grid.classList.add(`is-${layout}`);
            }
            localStorage.setItem('dd_recent_docs_layout', layout);
            updateActiveBtn(layout);
        };

        if (listBtn) {
            listBtn.onclick = () => {
                setLayout('list');
                listBtn.blur();
            };
        }
        if (detailBtn) {
            detailBtn.onclick = () => {
                setLayout('detail');
                detailBtn.blur();
            };
        }
        if (gridBtn) {
            gridBtn.onclick = () => {
                setLayout('grid');
                gridBtn.blur();
            };
        }
    });
}

/*
    入口
*/
let datesAutoWrapObserver = null;
function initPluginFeatures() {
    tippyManager.initialize();
    processDataLoading();
    initLayoutSwitcher();
    AvatarService.init().then(() => {
        loadAvatars();
    });
    enableHorizontalWheelScroll();

    // 观察插件尺寸变化，resize 时动态处理布局
    if (datesAutoWrapObserver) datesAutoWrapObserver.disconnect();
    datesAutoWrapObserver = new ResizeObserver(() => {
        // 使用 RAF 确保在浏览器重绘前处理，减少视觉跳动
        window.requestAnimationFrame(() => {
            handleDocumentDatesAutoWrap();
        });
    });
    document.querySelectorAll('.document-dates-plugin').forEach(ddpEl => datesAutoWrapObserver.observe(ddpEl));
    setTimeout(handleDocumentDatesAutoWrap, 100);
}

// 兼容 Material 主题的 'navigation.instant' 属性
if (window.document$ && !window.document$.isStopped) {
    window.document$.subscribe(initPluginFeatures);
} else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPluginFeatures);
} else {
    initPluginFeatures();
}
