```jsx
import React, { useEffect, useRef, useState } from 'react';
import StickyView from '../src/index';

const headerStyle = {
  backgroundColor: '#eee',
  padding: '10px 20px',
};

const App = () => {
  const ct = useRef();
  const topEdge = useRef();
  const bottomEdge = useRef();
  const containerTopEdge = useRef();
  const containerBottomEdge = useRef();
  const [disable, setDisable] = useState(false);
  const [useAbsolute, setUseAbsolute] = useState(false);

  return (
    <div style={{ height: 5000 }}>
      <div style={{ position: 'fixed', top: 400, left: 20, zIndex: 1000 }}>
        <div>
          <button
            type="button"
            onClick={() => {
              setDisable(!disable);
            }}
          >
            {disable ? '开启sticky' : '关闭sticky'}
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setUseAbsolute(!useAbsolute);
            }}
          >
            {useAbsolute ? '关闭useAbsolute' : '开启useAbsolute'}
          </button>
        </div>
      </div>

      <div
        style={{
          border: '1px solid red',
          height: 300,
          overflow: 'auto',
          overflowX: 'hidden',
          //position: 'relative',
          //position: 'absolute',
          //left: 300,
        }}
        ref={ct}
      >
        <div style={{ height: 1000 }}>
          <div style={{ height: 400 }}>
            <span>测试不同container</span>
            <div
              ref={containerTopEdge}
              style={{ marginTop: 300, borderBottom: '1px dashed red' }}
            >
              上边界
            </div>
          </div>
          <StickyView
            style={{ backgroundColor: 'yellow' }}
            disable={disable}
            useAbsolute={useAbsolute}
            mode={['bottom', 'top']}
            keepBounds
            container={() => ct.current}
            onStickyChange={(isSticky, mode) => {
              console.log('container onStickyChange:', isSticky, mode);
            }}
            topEdge={() => {
              //设置上边界
              const box = containerTopEdge.current.getBoundingClientRect();
              return box.top + box.height;
            }}
            bottomEdge={() => {
              //设置下边界
              const box = containerBottomEdge.current.getBoundingClientRect();
              return box.top;
            }}
          >
            <div style={headerStyle}>header in container</div>
          </StickyView>

          <div
            ref={containerBottomEdge}
            style={{ marginTop: 80, borderTop: '1px dashed red' }}
          >
            下边界
          </div>
        </div>
      </div>

      <div style={{ height: 1000, overflow: 'hidden' }}>
        <div
          ref={topEdge}
          style={{ marginTop: 500, borderBottom: '1px solid red' }}
        >
          上边界
        </div>
      </div>

      <StickyView
        style={{ backgroundColor: 'yellow' }}
        stickyContentStyle={{ left: 0 }}
        disable={disable}
        useAbsolute={useAbsolute}
        //mode={['bottom']}
      >
        <div style={headerStyle}>header1(bottom)</div>
      </StickyView>

      <StickyView
        style={{ backgroundColor: 'green', marginTop: 40 }}
        stickyContentStyle={{ left: 100 }}
        disable={disable}
        useAbsolute={useAbsolute}
        mode={['top']}
      >
        <div style={headerStyle}>header2(top)</div>
      </StickyView>

      <StickyView
        style={{ backgroundColor: 'red', marginTop: 40 }}
        stickyContentStyle={{ left: 300, border: '1px solid red' }}
        disable={disable}
        useAbsolute={useAbsolute}
        mode={['bottom', 'top']}
        onStickyChange={(isSticky, mode) => {
          console.log('onStickyChange:', isSticky, mode);
        }}
        topEdge={() => {
          //设置上边界
          const box = topEdge.current.getBoundingClientRect();
          return box.top + box.height;
        }}
        bottomEdge={() => {
          //设置下边界
          const box = bottomEdge.current.getBoundingClientRect();
          return box.top;
        }}
      >
        <div style={headerStyle}>header3(top, bottom)</div>
      </StickyView>

      <StickyView
        style={{ backgroundColor: 'blue', marginTop: 40 }}
        // stickyContentStyle={{ left: 500 }}
        offsetTop={60}
        offsetBottom={60}
        disable={disable}
        useAbsolute={useAbsolute}
        mode={['bottom', 'top']}
        keepBounds
      >
        <div style={headerStyle}>header4(top, bottom)</div>
      </StickyView>

      <div
        ref={bottomEdge}
        style={{ marginTop: 500, borderTop: '1px solid red' }}
      >
        下边界
      </div>
    </div>
  );
};

export default App;
```
