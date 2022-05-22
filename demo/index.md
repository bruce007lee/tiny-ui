```jsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExposureView from '../src/exposure-view/index';

const headerStyle = {
  backgroundColor: '#eee',
  padding: '10px 20px',
};

const root = document.createElement('div');
document.body.appendChild(root);

const App = () => {
  const ct = useRef();
  const topEdge = useRef();
  const bottomEdge = useRef();
  const containerTopEdge = useRef();
  const containerBottomEdge = useRef();
  const [disable, setDisable] = useState(false);
  const [useAbsolute, setUseAbsolute] = useState(false);
  const [isExp, setExp] = useState(false);

  return (
    <div style={{ height: 5000, width: 4000 }}>
      <div
        style={{
          border: '1px solid red',
          height: 300,
          width: 300,
          overflow: 'auto',
          overflowX: 'hidden',
        }}
        ref={ct}
      >
        <div style={{ height: 1000 }}>
          <div style={{ height: 400 }}>
            <span>测试不同container</span>
          </div>
          <ExposureView
            style={{ border: '1px solid red' }}
            exposureStyle={{
              border: '1px solid green',
            }}
          onExposure={(direction) => {
            console.log('view inner', 'onExposure:', direction);
            setExp(true);
          }}
          onUnExposure={(direction) => {
            console.log('view inner', 'onUnExposure:', direction);
            setExp(false);
          }}
            offset={{ top: 30, bottom: 30 }}
            container={() => ct.current}
          >
            <div style={headerStyle}>view inner {isExp ? '[已曝光]' : '[未曝光]'}</div>
          </ExposureView>
        </div>
      </div>

      <div style={{ height: 1000, overflow: 'hidden' }} />

      {createPortal(
        <ExposureView
          style={{
            position: 'absolute',
            left: 1000,
            top: 1000,
            border: '1px solid red',
            zIndex: 100,
          }}
          exposureStyle={{
            border: '1px solid green',
          }}
          onExposure={(direction) => {
            console.log('view1', 'onExposure:', direction);
          }}
          onUnExposure={(direction) => {
            console.log('view1', 'onUnExposure:', direction);
          }}
        >
          <div style={{ ...{ width: 200, height: 200 }, ...headerStyle }}>
            view1
          </div>
        </ExposureView>,
        root
      )}

      <ExposureView
        style={{ width: 200, marginTop: 40, border: '1px solid red' }}
        //offset={{top: 100, bottom: 200}}
        //mode={['vertical']}
        exposureStyle={{
          border: '1px solid green',
        }}
        onExposure={(direction) => {
          console.log('view2', 'onExposure:', direction);
        }}
        onUnExposure={(direction) => {
          console.log('view2', 'onUnExposure:', direction);
        }}
      >
        <div style={headerStyle}>view2</div>
      </ExposureView>

      <ExposureView
        style={{ width: 200, marginTop: 40, border: '1px solid red' }}
        exposureStyle={{
          border: '1px solid green',
        }}
        once
        lazyRender
        lazyRenderPlaceholder={<div>等待曝光...</div>}
        offset={{ bottom: 300 }}
        onExposure={(direction) => {
          console.log('view3', 'onExposure:', direction);
        }}
        onUnExposure={(direction) => {
          console.log('view3', 'onUnExposure:', direction);
        }}
      >
        <div style={headerStyle}>view3: 曝光才渲染, 且只曝光一次</div>
      </ExposureView>
    </div>
  );
};

export default App;
```
