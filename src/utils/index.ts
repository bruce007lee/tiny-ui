const util = {
  /**
   *  比较2个对象指定的key值是否相同
   * @param obj1
   * @param obj2
   * @param keys
   */
  equals(
    obj1: { [key: string]: any },
    obj2: { [key: string]: any },
    keys?: string[]
  ) {
    if (keys == null) {
      keys = Object.keys(obj1 || {});
    }
    return !keys.some((k) => obj1?.[k] !== obj2?.[k]);
  },
  /**
   * 获取窗口大小
   */
  getViewPortBounds(): {
    left: number;
    top: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  } {
    let pageWidth = 0,
      pageHeight = 0;

    //标准模式
    if (document.compatMode == 'CSS1Compat') {
      pageWidth = document.documentElement.clientWidth;
      pageHeight = document.documentElement.clientHeight;
      //怪异模式
    } else {
      pageWidth = document.body.clientWidth;
      pageHeight = document.body.clientHeight;
    }

    if (typeof pageWidth != 'number') {
      // 这个包含scrollbar，正常不应该取这个，这里只是做兜底
      (pageWidth = window.innerWidth), (pageHeight = window.innerHeight);
    }

    return {
      width: pageWidth,
      height: pageHeight,
      top: 0,
      bottom: pageHeight,
      left: 0,
      right: pageWidth,
    };
  },

  getBoundingClientRect(dom: HTMLElement): {
    left: number;
    top: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  } {
    if (dom && dom.getBoundingClientRect) {
      const box = dom.getBoundingClientRect();
      return {
        left: Math.round(box.left),
        right: Math.round(box.right),
        top: Math.round(box.top),
        bottom: Math.round(box.bottom),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    }
    return {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  },

  getStyle(dom: HTMLElement, styleKey: string) {
    if (!dom) {
      return null;
    }
    if (typeof getComputedStyle !== 'undefined' && dom.nodeType === 1) {
      return getComputedStyle(dom, null)?.getPropertyValue(styleKey);
    } else {
      /**@ts-ignore */
      return dom.currentStyle?.[styleKey];
    }
  },

  isHTMLElement(obj: any): obj is HTMLElement {
    return obj?.nodeType === 1 && obj?.cloneNode;
  },
};

export default util;
