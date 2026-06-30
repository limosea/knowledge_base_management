import { useEffect, useRef, type HTMLAttributes } from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dracula} from 'react-syntax-highlighter/dist/cjs/styles/prism';

function ScrollablePre(props: HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 只在 pre 是真正的滚动容器时才绑定事件
    const style = window.getComputedStyle(el);
    const isScrollContainer =
      ['auto', 'scroll'].includes(style.overflow) ||
      ['auto', 'scroll'].includes(style.overflowX) ||
      ['auto', 'scroll'].includes(style.overflowY);
    if (!isScrollContainer) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) return;

      const hasH = el.scrollWidth > el.clientWidth;
      const hasV = el.scrollHeight > el.clientHeight;

      // 只在同时有水平和垂直滚动条时才处理双向滚动
      if (!hasH || !hasV) return;

      const canScrollUp = el.scrollTop > 0;
      const canScrollDown =
        Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight;

      // 垂直方向还有空间时阻止事件冒泡到外层滚动容器
      if (
        (e.deltaY < 0 && canScrollUp) ||
        (e.deltaY > 0 && canScrollDown)
      ) {
        e.stopPropagation();
        return;
      }

      // 垂直方向已到边界，尝试转为水平滚动
      if (hasH) {
        const oldScrollLeft = el.scrollLeft;
        el.scrollLeft += e.deltaY;

        // 如果 scrollLeft 实际发生了变化，说明水平滚动成功
        if (el.scrollLeft !== oldScrollLeft) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return <pre ref={ref} {...props} style={{ overflow: 'auto', ...props.style }} />;
}

export function CodeBlock({ code, language, style }: { code: string, language: string, style?: React.CSSProperties }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={dracula}
      PreTag={ScrollablePre}
      customStyle={{
        background: 'transparent',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        ...style,
      }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
