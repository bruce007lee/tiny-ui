import React, {
  CSSProperties,
  ForwardRefRenderFunction,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import classnames from 'classnames';
import utils from '../utils';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type ExposureMode = 'vertical' | 'horizontal';
export type Observer = (change: () => void) => HTMLElement | (() => void);
export interface ExposureViewProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 曝光的附加距离
   */
  offset?: Partial<{
    top: number;
    left: number;
    bottom: number;
    right: number;
  }>;

  /**
   * 是否在曝光时才渲染内容
   */
  lazyRender?: boolean;

  /**
   * 曝光渲染前渲染内容，需结合lazyRender使用
   */
  lazyRenderPlaceholder?: ReactNode;

  /**
   * 是否只触发一次曝光事件
   */
  once?: boolean;

  /**
   * 曝光的模式
   */
  mode?: ExposureMode | ExposureMode[];

  /**
   * 曝光时附加的样式
   */
  exposureClassName?: string;

  /**
   * 未曝光时附加的style
   */
  exposureStyle?: CSSProperties;

  /**
   * 未曝光时附加的样式
   */
  unExposureClassName?: string;

  /**
   * 未曝光时附加的style
   */
  unExposureStyle?: CSSProperties;

  /**
   * 曝光时触发
   */
  onExposure?: (direction: Direction) => void;

  /**
   * 不可见时触发
   */
  onUnExposure?: (direction: Direction) => void;

  /**
   * 曝光区域容器
   */
  container?: () => HTMLElement | Window;

  /**
   * 曝光侦听器，可自定义曝光检测触发处理
   */
  observer?: Observer;
}

export type ExposureViewRef = {
  /**
   * 刷新layout方法
   */
  layout: () => void;
};

const ExposureView: ForwardRefRenderFunction<
  ExposureViewRef,
  ExposureViewProps
> = (
  {
    children,
    className,
    offset,
    lazyRender,
    lazyRenderPlaceholder,
    once,
    mode = ['vertical', 'horizontal'],
    exposureClassName,
    exposureStyle,
    unExposureClassName,
    unExposureStyle,
    style,
    onExposure,
    onUnExposure,
    container = () => window,
    observer,
    ...others
  },
  ref
) => {
  const ctRef = useRef<HTMLDivElement>();
  const onPostionChangeRef = useRef<() => void>();
  const onExposureRef = useRef(onExposure);
  const onUnExposureRef = useRef(onUnExposure);
  const [isRender, setIsRender] = useState(false);
  const [preventEvent, setPreventEvent] = useState(false);
  const boundsRef = useRef<{
    left: number;
    top: number;
  }>({
    left: 0,
    top: 0,
  });
  const [prevContentBounds, setContentBounds] = useState<{
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
  const [prevContainerBounds, setContainerBounds] = useState<{
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
  const [exposureState, setExposureState] = useState<{
    isExposure: boolean;
    direction?: Direction;
  }>({
    isExposure: false,
  });

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

  const handleExposureChange = (state: boolean, direction: Direction) => {
    if (once && !exposureState.isExposure) {
      setPreventEvent(true);
    }
    setExposureState({
      isExposure: state,
      direction,
    });
    if (lazyRender && state) {
      setIsRender(true);
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
      const contentBounds = utils.getBoundingClientRect(ctRef.current);
      const containerBounds = getContainerBounds();

      if (
        utils.equals(prevContentBounds, contentBounds) &&
        utils.equals(prevContainerBounds, containerBounds)
      ) {
        return;
      }

      setContainerBounds(containerBounds);
      setContentBounds(contentBounds);
      const { left = 0, right = 0, top = 0, bottom = 0 } = offset || {};
      const topSpace = Math.round(contentBounds.top - containerBounds.top);
      const leftSpace = Math.round(contentBounds.left - containerBounds.left);

      const isExposure = exposureState.isExposure;
      const bounds = boundsRef.current;
      const hasHor = hasMode('horizontal', mode);
      const hasVer = hasMode('vertical', mode);

      let direction: Direction = null;

      if (hasVer) {
        direction = bounds.top <= contentBounds.top ? 'down' : 'up';
      }

      if (!hasVer || (hasHor && bounds.top == contentBounds.top)) {
        direction = bounds.left <= contentBounds.left ? 'right' : 'left';
      }

      boundsRef.current = {
        top: contentBounds.top,
        left: contentBounds.left,
      };

      if (
        (hasVer
          ? topSpace >= -contentBounds.height + top &&
            topSpace <= containerBounds.height - bottom
          : true) &&
        (hasHor
          ? leftSpace >= -contentBounds.width + left &&
            leftSpace <= containerBounds.width - right
          : true)
      ) {
        !isExposure && handleExposureChange(true, direction);
      } else {
        isExposure && handleExposureChange(false, direction);
      }
    }
  };

  useEffect(() => {
    setPreventEvent(false);
  }, [once]);

  useEffect(() => {
    onPostionChangeRef.current = handlePosChange;
    onExposureRef.current = onExposure;
    onUnExposureRef.current = onUnExposure;
  });

  useEffect(() => {
    if (!preventEvent && onPostionChangeRef.current) {
      onPostionChangeRef.current();
    }
  });

  useEffect(() => {
    if (exposureState.direction) {
      if (exposureState.isExposure && onExposureRef.current) {
        onExposureRef.current(exposureState.direction);
      } else if (!exposureState.isExposure && onUnExposureRef.current) {
        onUnExposureRef.current(exposureState.direction);
      }
    }
  }, [exposureState.isExposure]);

  useEffect(() => {
    let el = null;
    let handleChange = null;
    if (!preventEvent) {
      el = container();
      handleChange = () => {
        if (onPostionChangeRef.current) {
          onPostionChangeRef.current();
        }
      };
      if (el !== window) {
        el.addEventListener('scroll', handleChange);
      }
      window.addEventListener('scroll', handleChange);
      window.addEventListener('resize', handleChange);
    }
    return () => {
      if (el) {
        if (el !== window) {
          el.removeEventListener('scroll', handleChange);
        }
        window.removeEventListener('scroll', handleChange);
        window.removeEventListener('resize', handleChange);
      }
    };
  }, [container(), preventEvent]);

  useEffect(() => {
    let ob = null;
    let handleChange = null;
    if (!preventEvent) {
      handleChange = () => {
        if (onPostionChangeRef.current) {
          onPostionChangeRef.current();
        }
      };
      ob = observer == null ? null : observer(handleChange);
      if (utils.isHTMLElement(ob)) {
        ob.addEventListener('scroll', handleChange);
      }
    }
    return () => {
      if (ob) {
        if (utils.isHTMLElement(ob)) {
          ob.removeEventListener('scroll', handleChange);
        } else if (typeof ob === 'function') {
          ob();
        }
      }
    };
  }, [observer, preventEvent]);

  let content = children;
  if (lazyRender && !isRender) {
    content = lazyRenderPlaceholder;
  }

  let st = style;
  if (exposureState.isExposure) {
    if (exposureStyle) {
      st = { ...style, ...exposureStyle };
    }
  } else {
    if (unExposureStyle) {
      st = { ...style, ...unExposureStyle };
    }
  }

  return (
    <div
      {...others}
      ref={ctRef}
      style={st}
      className={classnames(
        'ctf-lib-exposure-view',
        className,
        exposureState.isExposure ? exposureClassName : null
      )}
    >
      {content}
    </div>
  );
};

export default forwardRef(ExposureView);
