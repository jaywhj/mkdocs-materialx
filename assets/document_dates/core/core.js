/*
    1.生成头像
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
function generateAvatar() {
    document.querySelectorAll('.avatar-wrapper').forEach(wrapper => {
        const name = wrapper.dataset.name || '';
        const initials = extractInitials(name);
        const bgColor = nameToHSL(name);

        const textEl = wrapper.querySelector('.avatar-text');
        textEl.textContent = initials;
        textEl.style.backgroundColor = bgColor;

        const imgEl = wrapper.querySelector('img.avatar');
        if (imgEl) {
            const src = (imgEl.getAttribute('src') || '').trim();
            if (!src) {
                imgEl.style.display = 'none';
            }
        }
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
// 处理数据加载
function processDataLoading() {
    document.querySelectorAll('.document-dates-plugin').forEach(ddpEl => {
        // 获取 locale，优先级：用户主动选择 > 服务端显式配置 > 用户浏览器语言 > 站点HTML语言 > 默认英语
        const rawLocale =
            ddUtils.getSavedLanguage() ||
            ddpEl.getAttribute('locale') ||
            navigator.language ||
            navigator.userLanguage ||
            document.documentElement.lang ||
            'en';

        // 处理 time 元素（使用 timeago 时）
        if (typeof timeago !== 'undefined') {
            const tLocale = ddUtils.resolveTimeagoLocale(rawLocale);
            ddpEl.querySelectorAll('time').forEach(timeEl => {
                timeEl.textContent = timeago.format(timeEl.getAttribute('datetime'), tLocale);
            });
        }

        // 动态处理 tooltip 内容
        const langData = TooltipLanguage.get(rawLocale);
        ddpEl.querySelectorAll('[data-tippy-content]').forEach(tippyEl => {
            const iconEl = tippyEl.querySelector('[data-icon]');
            const rawIconKey = iconEl ? iconEl.getAttribute('data-icon') : '';
            const iconKey = iconKeyMap[rawIconKey] || 'author';
            if (langData[iconKey]) {
                const content = langData[iconKey] + ': ' + tippyEl.dataset.tippyRaw;
                // 如果 tippy 实例已存在，直接更新内容
                if (tippyEl._tippy) {
                    tippyEl._tippy.setContent(content);
                }
            }
        });
    });
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
            tippyTargets.forEach(el => {
                if (el._tippy) {
                    el._tippy.hide();
                }
            });
        };
        // true: 浏览器可以立刻执行默认行为。这个事件监听器只是‘看看’，绝不会阻止浏览器的默认行为
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

    const groups = document.querySelectorAll('.author-group');
    groups.forEach(el => {
        // 先取消旧监听器，避免重复绑定
        if (el._ddWheelAbortController) {
            el._ddWheelAbortController.abort();
        }
        const controller = new AbortController();
        el._ddWheelAbortController = controller;

        el.addEventListener('wheel', function (event) {
            // 只处理纵向滚轮（触控板横向滑动不干预）
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            // 在 author-group 内，始终阻止页面纵向滚动
            event.preventDefault();

            const scrollWidth = el.scrollWidth;
            const clientWidth = el.clientWidth;
            // 元素不可横向滚动时返回
            if (scrollWidth <= clientWidth) return;

            const delta = event.deltaY;
            const atLeft = el.scrollLeft <= 0;
            const atRight = el.scrollLeft + clientWidth >= scrollWidth - 1;

            if ((delta < 0 && !atLeft) || (delta > 0 && !atRight)) {
                el.scrollLeft += delta;
            }
            // 到边界：什么都不做（不冒泡、不滚页面）
        }, {
            // false: 先等 JS 跑完，再决定要不要滚。我可能会调用 event.preventDefault()，浏览器你先别急着执行默认行为
            passive: false,
            signal: controller.signal
        });
    });
}


// 动态处理窄屏换行
function handleDocumentDatesAutoWrap() {
    const containers = document.querySelectorAll('.document-dates-plugin');
    const AUTHOR_THRESHOLD = 140;   // 大概2个作者宽度

    containers.forEach(container => {
        const leftPart = container.querySelector('.dd-left');
        const rightPart = container.querySelector('.dd-right');
        if (!leftPart || !rightPart) return;

        // 使用 getBoundingClientRect 更加精确（包含小数）
        const containerWidth = container.getBoundingClientRect().width;
        const leftWidth = leftPart.getBoundingClientRect().width;
        if (containerWidth <= leftWidth) return;

        // 如果: 容器总宽度 < 日期宽度 + 2个作者宽度，则换行
        const shouldWrap = containerWidth < (leftWidth + AUTHOR_THRESHOLD);
        // 只有在状态确实需要改变时才操作 DOM
        if (container.classList.contains('is-wrapped') !== shouldWrap) {
            container.classList.toggle('is-wrapped', shouldWrap);
        }
    });
}

/*
    入口: 兼容 Material 主题的 'navigation.instant' 属性
*/
let datesAutoWrapObserver = null;
function initPluginFeatures() {
    tippyManager.initialize();
    processDataLoading();
    generateAvatar();
    enableHorizontalWheelScroll();

    if (datesAutoWrapObserver) datesAutoWrapObserver.disconnect();
    datesAutoWrapObserver = new ResizeObserver(() => {
        // 使用 RAF 确保在浏览器重绘前处理，减少视觉跳动
        window.requestAnimationFrame(() => {
            handleDocumentDatesAutoWrap();
        });
    });
    const containers = document.querySelectorAll('.document-dates-plugin');
    containers.forEach(el => datesAutoWrapObserver.observe(el));
}

if (window.document$ && !window.document$.isStopped) {
    window.document$.subscribe(initPluginFeatures);
} else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPluginFeatures);
} else {
    initPluginFeatures();
}
