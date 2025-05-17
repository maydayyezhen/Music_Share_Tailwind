// src/directives/lazy-img.js

let observer = null;
const observedElements = new WeakMap();

function initObserver() {
    if (!observer) {
        observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const el = entry.target;
                if (entry.isIntersecting) {
                    const callback = observedElements.get(el);
                    if (callback) {
                        callback(el);          // 告诉元素：现在可以加载了！
                        observer.unobserve(el);
                        observedElements.delete(el);
                    }
                }
            }
        }, {
        });
    }
    return observer;
}

export default {
    mounted(el, binding) {
        // 传入的回调函数
        const loadCallback = binding.value;

        if (typeof loadCallback !== 'function') {
            console.warn('[v-lazy-img] 绑定值必须是函数');
            return;
        }

        observedElements.set(el, loadCallback);
        const observer = initObserver();
        observer.observe(el);
    },

    unmounted(el) {
        if (observer) {
            observer.unobserve(el);
        }
        observedElements.delete(el);
    }
}
