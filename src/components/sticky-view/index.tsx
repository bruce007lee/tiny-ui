import React, {
  ForwardRefRenderFunction,
  HTMLAttributes,
  CSSProperties,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import classnames from 'classnames';
import utils from '../../utils';

export type StickyMode = 'top' | 'bottom';
export type KeepBoundsMode = 'width' | 'height';
export interface StickyViewProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * sticky改变时触发
   */
  onStickyChange?: (isSticky: boolean, mode: StickyMode) => void;
  /**
   * 浮动内容上的样式
   */
  contentClassName?: string;
  /**
   * 浮动内容上的样式
   */
  contentStyle?: CSSProperties;
  /**
   * 当触发sticky行为时外部容器样式
   */
  stickyClassName?: string;
  /**
   * 当触发sticky行为时外部容器样式
   */
  stickyStyle?: CSSProperties;
  /**
   * 当触发sticky行为时浮动内容上的样式
   */
  stickyContentStyle?: CSSProperties;
  /**
   * 当触发sticky行为时浮动内容上的样式
   */
  stickyContentClassName?: string;
  /**
   * sticky触发的模式。默认为'bottom'
   */
  mode?: StickyMode | StickyMode[];
  /**
   * 内容区域是否在sticky时保持原来的大小和水平位置
   */
  keepBounds?: boolean;
  /**
   * 保持原来的大小模式的设置，width就是保持宽度，height就是保持高度
   * 默认是: ['width', 'height']
   */
  keepBoundsMode?: KeepBoundsMode | KeepBoundsMode[];
  /**
   * 顶部触发sticky行为的offset,默认为0
   */
  offsetTop?: number;
  /**
   * 底部触发sticky行为的offset,默认为0
   */
  offsetBottom?: number;
  /**
   * 需要监听滚动事件的容器元素
   */
  container?: () => HTMLElement | Window;
  /**
   * 获取sticky时顶部的边界位置（相对window区域）
   */
  topEdge?: () => number;
  /**
   * 获取sticky时底部的边界位置（相对window区域）
   */
  bottomEdge?: () => number;
  /**
   * 是否启用绝对定位布局
   */
  useAbsolute?: boolean;
  /**
   * 是否禁用sticky
   */
  disable?: boolean;
}

export type StickyViewRef = {
  /**
   * 刷新layout方法
   */
  layout: () => void;
};

const StickyView: ForwardRefRenderFunction<StickyViewRef, StickyViewProps> = (
  {
    children,
    style,
    className,
    contentStyle,
    contentClassName,
    stickyStyle,
    stickyClassName,
    stickyContentClassName,
    stickyContentStyle,
    keepBounds,
    keepBoundsMode = ['width', 'height'],
    mode = 'bottom',
    offsetTop = 0,
    offsetBottom = 0,
    disable,
    useAbsolute,
    topEdge,
    bottomEdge,
    onStickyChange,
    container = () => window,
    ...others
  },
  ref
) => {
  const ctRef = useRef<HTMLDivElement>();
  const innerRef = useRef<HTMLDivElement>();
  const onStickyChangeRef = useRef(onStickyChange);
  const onPostionChangeRef = useRef<() => void>();
  const modeRef = useRef(mode);
  const [stickyState, setStickyState] = useState<{
    isSticky: boolean;
    mode?: StickyMode;
  }>({ isSticky: false });
  const viewPortBounds = utils.getViewPortBounds();
  const isSticky = !disable && stickyState.isSticky;

  const [contentBounds, setContentBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const [containerBounds, setContainerBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const getContainerBounds = (): {
    width: number;
    height: number;
    top: number;
    left: number;
  } => {
    let applyTo = container();
    if (!applyTo) {
      applyTo = window;
    }
    return applyTo === window
      ? utils.getViewPortBounds()
      : utils.getBoundingClientRect(applyTo as HTMLElement);
  };

  const handleStickyChange = (isSticky: boolean, mode: StickyMode) => {
    if (disable) {
      if (stickyState.mode && stickyState.isSticky) {
        setStickyState({ isSticky: false, mode: stickyState.mode });
      }
    } else {
      setStickyState({ isSticky, mode });
    }
  };

  const hasMode = (curMode: string, mode: string | string[]): boolean => {
    if (!curMode) {
      return false;
    }
    if (curMode === mode) {
      return true;
    }

    if (Array.isArray(mode) && mode.indexOf(curMode) >= 0) {
      return true;
    }

    return false;
  };

  const handlePosChange = () => {
    if (ctRef.current) {
      const newContentBounds = utils.getBoundingClientRect(ctRef.current);
      const newContainerBounds = getContainerBounds();

      if (
        utils.equals(containerBounds, newContainerBounds) &&
        utils.equals(contentBounds, newContentBounds)
      ) {
        return;
      }

      setContainerBounds(newContainerBounds);
      setContentBounds(newContentBounds);

      const topSpace = Math.round(
        newContentBounds.top - newContainerBounds.top
      );
      const bottomSpace = Math.round(
        newContainerBounds.height -
          newContentBounds.bottom +
          newContainerBounds.top
      );
      const mode = modeRef.current;

      if (hasMode('top', mode) && topSpace < offsetTop && !isSticky) {
        handleStickyChange(true, 'top');
      } else if (
        topSpace >= offsetTop &&
        isSticky &&
        stickyState.mode === 'top'
      ) {
        handleStickyChange(false, 'top');
      } else if (
        hasMode('bottom', mode) &&
        bottomSpace < offsetBottom &&
        !isSticky
      ) {
        handleStickyChange(true, 'bottom');
      } else if (
        bottomSpace >= offsetBottom &&
        isSticky &&
        stickyState.mode === 'bottom'
      ) {
        handleStickyChange(false, 'bottom');
      }
    }
  };

  /**
   * 提供外部方法
   */
  useImperativeHandle(ref, () => ({
    layout: () => {
      if (onPostionChangeRef.current) {
        onPostionChangeRef.current();
      }
    },
  }));

  const mergeStyle: CSSProperties = {
    ...style,
    ...(isSticky
      ? {
          position: 'relative',
          height: contentBounds.height,
        }
      : null),
    ...(isSticky ? stickyStyle : null),
  };

  let left;
  let rpBounds;
  if (isSticky) {
    if (useAbsolute) {
      rpBounds = utils.getBoundingClientRect(ctRef.current);
    }
    if (keepBounds) {
      if (useAbsolute) {
        left = contentBounds.left - rpBounds.left;
      } else {
        left = contentBounds.left;
      }
    }
  }

  const stictyStyle: {
    width?: number;
    height?: number;
    left?: number;
  } = {};
  if (isSticky && keepBounds) {
    stictyStyle.left = left;
    if (hasMode('width', keepBoundsMode)) {
      stictyStyle.width = contentBounds.width;
    }
    if (hasMode('height', keepBoundsMode)) {
      stictyStyle.height = contentBounds.height;
    }
  }

  const mergeCtStyle: CSSProperties = {
    ...contentStyle,
    ...stictyStyle,
    ...(isSticky ? stickyContentStyle : null),
  };

  if (isSticky) {
    mergeCtStyle.position = useAbsolute ? 'absolute' : 'fixed';
    const innerBox = utils.getBoundingClientRect(innerRef.current);

    let append = 0;
    if (stickyState.mode === 'top') {
      if (useAbsolute) {
        append = -contentBounds.top;
      }

      mergeCtStyle.top = offsetTop + (containerBounds?.top || 0);
      //处理下边界
      if (bottomEdge) {
        const bottomEdgePos = bottomEdge() ?? viewPortBounds.height;
        const maxTop = Math.round(bottomEdgePos - innerBox.height);
        if (mergeCtStyle.top > maxTop) {
          mergeCtStyle.top = maxTop;
        }
      }
      mergeCtStyle.top += append;
    }

    if (stickyState.mode === 'bottom') {
      if (useAbsolute) {
        append =
          contentBounds.top + contentBounds.height - viewPortBounds.height;
      }

      mergeCtStyle.bottom =
        offsetBottom +
        ((viewPortBounds?.height || 0) -
          (containerBounds?.top || 0) -
          (containerBounds?.height || 0));
      //处理上边界
      if (topEdge) {
        const topEdgePos = topEdge() ?? 0;
        const maxBottom = Math.round(
          viewPortBounds.height - topEdgePos - innerBox.height
        );
        if (mergeCtStyle.bottom > maxBottom) {
          mergeCtStyle.bottom = maxBottom;
        }
      }
      mergeCtStyle.bottom += append;
    }
  }

  useEffect(() => {
    modeRef.current = mode;
    onStickyChangeRef.current = onStickyChange;
    onPostionChangeRef.current = handlePosChange;
  });

  useEffect(() => {
    if (onStickyChangeRef.current && stickyState?.mode) {
      onStickyChangeRef.current(isSticky, stickyState.mode);
    }
  }, [stickyState.isSticky]);

  useEffect(() => {
    if (onPostionChangeRef.current) {
      onPostionChangeRef.current();
    }
  });

  useEffect(() => {
    const el = container();
    const handleChange = () => {
      if (onPostionChangeRef.current) {
        onPostionChangeRef.current();
      }
    };
    if (el !== window) {
      el.addEventListener('scroll', handleChange);
    }
    window.addEventListener('scroll', handleChange);
    window.addEventListener('resize', handleChange);
    return () => {
      if (el !== window) {
        el.removeEventListener('scroll', handleChange);
      }
      window.removeEventListener('scroll', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, [container()]);

  return (
    <div
      {...others}
      ref={ctRef}
      style={mergeStyle}
      className={classnames(
        'tui-sticky-view',
        className,
        isSticky ? stickyClassName : null
      )}
    >
      <div
        ref={innerRef}
        className={classnames(
          contentClassName,
          isSticky ? stickyContentClassName : null
        )}
        style={mergeCtStyle}
      >
        {children}
      </div>
    </div>
  );
};

export default forwardRef(StickyView);
